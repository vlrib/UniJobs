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
  const { email, password, name, phoneNumber } = await json(req)

  if (!email || !password || !name || !phoneNumber) throw createError(400, 'Email, password, name and phoneNumber is required')

  // We need to check if there is already a user with this email
  // Get user from db
  const alreadyUser = await User.findOne({ email }, (err, user) => {
    if (err) throw createError(404, 'User does not exist')
    return user
  })

  if (alreadyUser) throw createError(403, 'Error. Email already in use')

  const hashedPass = await hashPassword(password)

  const newUser = new User({
   name, 
   email, 
   password: hashedPass,
   phoneNumber
  })

  const user = await newUser.save()
	  .then(() => console.log('User saved'))
	  .catch((err) => { throw createError(500, 'Could not create user in db') })

 	return newUser
}

const createAdmin = async (req, res) => {
	const { email, password, name } = await json(req)

	const jwt = await getJwtAuth(req, res)

	if (!jwt.system) throw createError(403, 'Forbidden. Only the system can create admin users')

  if (!email || !password || !name || !phoneNumber) throw createError(400, 'Email, password, name and phoneNumber is required')

  // We need to check if there is already a user with this email
  // Get user from db
  const alreadyUser = await User.findOne({ email }, (err, user) => {
    if (err) throw createError(404, 'User does not exist')
    return user
  })

  if (alreadyUser) throw createError(403, 'Error. Email already in use')

  const hashedPass = await hashPassword(password)

  const newUser = new User({
   name, 
   email, 
   password: hashedPass,
   phoneNumber
  })

  const user = await newUser.save()
	  .then(() => console.log('User saved'))
	  .catch((err) => { throw createError(500, 'Could not create user in db') })

 	return newUser
}

const getUser = async (req, res) => {

  const jwt = await getJwtAuth(req, res)

	if (!isUser(jwt) &&	 !isAdmin(jwt)) throw createError(403, 'Forbidden')

	const user = await User.findById(jwt.id, (err, user) => {
	    if (err) throw createError(500, 'Could not retrieve user from db')
	    return user
	})

	return user

}

const patchUser = async (req, res) => {
  const { id, password, image, name } = await json(req)

  const jwt = await getJwtAuth(req, res)

  if (!isAdmin(jwt) && !isUser(jwt)) throw createError(403, 'Forbidden')

  if (!id && isAdmin(jwt)) throw createError(400, 'Bad params. User id is required')

  if (!password && !image && !name && !phoneNumber) throw createError(400, 'Bad params. Password, image, name or phoneNumber is required')

  const hashedPass = password && await hashPassword(password)

  const toUpdate = Object.assign({},
    hashedPass && { password: hashedPass },
    image && { image },
    name && { name },
    phoneNumber && { phoneNumber }
  )

  const userId = isAdmin(jwt) ? id : jwt.id
  
  let updatedUser = null

  const updateReq = await User.findOneAndUpdate(
    { _id: userId }, 
    toUpdate,
    { new: true },
    (err, user) => {
      if (err) throw createError(500, 'Could not update user in db.')

      if (!user) throw createError(404, 'User does not exist')
      updatedUser = user
      return updatedUser
    })

  return updatedUser
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
  deleteUser,
  patchUser
}
