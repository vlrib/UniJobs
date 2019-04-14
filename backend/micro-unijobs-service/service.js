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

	if (!body.name || !body.location) throw createError(400, 'Bad params. Service name and location is required')

	if (!isUser(jwt) && !isAdmin(jwt)) throw createError(403, 'Forbidden. Only users and admins can create services')

	const servicesProperties = Object.assign({},
    {name: body.name},
    {location: body.location},
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
	const { id } = await json(req)

	const jwt = await getJwtAuth(req, res)

	if (!isAdmin(jwt) && !isUser(jwt)) throw createError(403, 'Forbidden. Only users can see services')

	// If id was not send in request, return all services
	
	if (!id) {
		// Retrieve all users from db if it is admin
		const servicesArr = await Service.find({}, (err, services) => {
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

module.exports = {
	createService,
	getService
}