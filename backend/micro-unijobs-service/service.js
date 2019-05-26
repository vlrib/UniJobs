// Micro deps
const { json, createError } = require('micro')

// Utils
const connectWithDB = require('./db')
const { isUser, isAdmin, isSystem } = require('./authCheck')
const { getJwtAuth } = require('./jwtHelper')
const { auth: authConfig } = require('./config')[process.env.NODE_ENV || 'development']

// Service model
const Service = require('./models/Service')

const db = connectWithDB()

const createService = async (req, res) => {
	const body = await json(req)

	const jwt = await getJwtAuth(req, res)

	if (!body.name || !body.location || !body.isOffer) throw createError(400, 'Bad params. Service name, location and isOffer is required')

	if (!isUser(jwt) && !isAdmin(jwt)) throw createError(403, 'Forbidden. Only users and admins can create services')

	const servicesProperties = Object.assign({},
    {name: body.name},
    {location: body.location},
    {isOffer: body.isOffer},
    {createdBy: jwt.id},
    body.description && { description }
  )
	
	const newService = new Service(servicesProperties)

	const service = await newService.save()
	  .then(() => console.log('Service saved'))
	  .catch((err) => { throw createError(500, 'Could not create service in db') })

	return newService
}

const getService = async (req, res) => {

	const queryString = await req.query

	const id = queryString.id

	const isOffer = queryString.isOffer

	if (isOffer === undefined) throw createError(400, 'Bad params. isOffer querystring is required')

	const jwt = await getJwtAuth(req, res)

	if (!isAdmin(jwt) && !isUser(jwt)) throw createError(403, 'Forbidden. Only users can see services')

	// If id was not send in request, return all services

	if (!id) {
		const servicesArr = await Service.find({ isOffer }, (err, services) => {
			if (err) throw createError(500, 'Could not retrieve services from db')
			return services
		})

		return servicesArr
	} else {
	  const service = await Service.findById(id, (err, service) => {
	    if (err) throw createError(500, 'Could not retrieve service from db')
	    return service
	  })

	  return service
	}
}

const updateService = async (req, res) => {
	const jwt = await getJwtAuth(req, res)

	const { id, name, description, isOffer, location, active } = await json(req)

	if (!id) throw createError(400, 'Bad params. Service id is required')

	const serviceToUpdate = await Service.findById({ _id: id }, (err, service) => {
		if (err) throw createError(500, 'Could not retrieve service from db')
		return service
	})

	if (!serviceToUpdate) throw createError(404, 'Service not found')

	// Check if user thats making the request created the service
	// Note that admin can update services no matter if he created or not
	if (jwt.id !== serviceToUpdate.createdBy && !isAdmin(jwt)) throw createError(403, 'Forbidden. User does not have permission to update this service')

	 const toUpdate = Object.assign({},
	 	name && { name },
    description && { description },
    isOffer && { isOffer },
    location && { location },
    active === undefined ? null : { active }
  )

	const updatedReq = await Service.findOneAndUpdate(
		{ _id: id },
		toUpdate,
		(err, service) => {
    if (err) throw createError(500, 'Could not update service on db')
    console.log(`Sucessfully updated service with id = ${id}`)
    return service
	})

	return serviceToUpdate	
}

const deleteService = async (req, res) => {
	const jwt = await getJwtAuth(req, res)

	if (!isAdmin(jwt) && !isSystem(jwt)) throw createError(403, 'Forbidden. Only system and admin can delete services')

	const { id } = await json(req)

	if (!id) throw createError(400, 'Bad params. Service id is required')

	const serviceToDelete = await Service.findById({ _id: id }, (err, service) => {
		if (err) throw createError(500, 'Could not retrieve service from db')
		return service
	})

	if (!serviceToDelete) throw createError(404, 'Not found. Service does not exist')

	const deleteReq = await Service.findOneAndDelete({ _id: id }, (err, service) => {
    if (err) throw createError(500, 'Could not remove service from db')
    console.log(`Sucessfully deleted service with id = ${id}`)
    return service
	})

	return serviceToDelete
}

const likeService = async (req, res) => {
	const jwt = await getJwtAuth(req, res)
	const body = await json(req)

	if (!isUser(jwt)) throw createError(403, 'You have to be an user to proceed with this action')

	var set_like_on_db = function(){
		body.likedBy.push(jwt.id);
		const toUpdate = {likedBy: body.likedBy}

		const updatedReq = await Service.findOneAndUpdate(
			{ _id: id },
			toUpdate,
			(err, service) => {
	    if (err) throw createError(500, 'Could not update service on db')
	    console.log(`Sucessfully updated service with id = ${id}`)
	    return service
		})
	}

	!body.likedBy.includes(jwt.id) ? set_like_on_db() : undefined;
}

module.exports = {
	createService,
	getService,
	deleteService,
	updateService,
	likeService
}