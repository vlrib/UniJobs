// Micro deps
const { json, createError } = require('micro')

// Utils
const connectWithDB = require('./db')
const { isUser, isAdmin, isSystem } = require('./authCheck')
const bcrypt = require('bcrypt')
const { getJwtAuth } = require('./jwtHelper')
const { auth: authConfig } = require('./config')[process.env.NODE_ENV || 'development']

// User model
const User = require('./models/User')

const db = connectWithDB()

const hashPassword = async (pass) => {
  return bcrypt.hash(pass, 10)
}

const createUser = async (req, res) => {
  const { email, password, name } = await json(req)

  if (!email || !password || !name) throw createError(400, 'Email, password and name is required')

  // We need to check if there is already a user with this email
  // Get user from db
  const alreadyUser = await User.findOne({ email }, (err, user) => {
    if (err) throw createError(404, 'User does not exist')
    return user
  })

  if (alreadyUser) throw createError(403, 'Error. Email already in use')

  const hashedPass = await hashPassword(password)

  const newUser = new User({ name, email, password: hashedPass })

  const user = await newUser.save()
	  .then(() => console.log('User saved'))
	  .catch((err) => { throw createError(500, 'Could not create user in db') })

 	return newUser
}

const createAdmin = async (req, res) => {
	const { email, password, name } = await json(req)

	const jwt = await getJwtAuth(req, res)

	if (!jwt.system) throw createError(403, 'Forbidden. Only the system can create admin users')

  if (!email || !password || !name) throw createError(400, 'Email, password and name is required')

  // We need to check if there is already a user with this email
  // Get user from db
  const alreadyUser = await User.findOne({ email }, (err, user) => {
    if (err) throw createError(404, 'User does not exist')
    return user
  })

  if (alreadyUser) throw createError(403, 'Error. Email already in use')

  const hashedPass = await hashPassword(password)

  const newUser = new User({ name, email, password: hashedPass, auth: authConfig.admin })

  const user = await newUser.save()
	  .then(() => console.log('User saved'))
	  .catch((err) => { throw createError(500, 'Could not create user in db') })

 	return newUser
}

const getUser = async (req, res) => {
  const body = await json(req)

  const jwt = await getJwtAuth(req, res)

	if (!isUser(jwt) &&	 !isAdmin(jwt)) throw createError(403, 'Forbidden')

	const id = body.id
	
	if (id || isUser(jwt)) {
		// If it a user, allow it to retrieve only its own info
		const idToUse = isUser(jwt) ? jwt.id : id

	  const user = await User.findById(idToUse, (err, user) => {
	    if (err) throw createError(500, 'Could not retrieve user from db')
	    return user
	  })

	  return user
	} else {
		// Retrieve all users from db if it is admin
		const userArr = await User.find({}, (err, users) => {
			if (err) throw createError(500, 'Could not retrieve users from db')
			return users
		})

		return userArr

	}
}

const deleteUser = async (req, res) => {
  const { id } = await json(req)

  if (!id) throw createError(400, 'Id is required')

  const jwt = await getJwtAuth(req, res)

  if (!isAdmin(jwt)) throw createError(403, 'Forbidden. Only admin can delete users')

  // Fix this hacky thing later
  let deletedUser = null

	const deleteReq = await User.findOneAndDelete({ _id: id }, (err, user) => {
    if (err) { throw createError(500, 'Could not remove user from db') }

    // if no user with the given ID is found throw 404
    if (!user) { throw createError(404, 'No user with that ID') }
    deletedUser = user
    return user
	})
	
  return deletedUser
}


module.exports = {
  createUser,
  createAdmin,
  getUser,
  deleteUser
}
