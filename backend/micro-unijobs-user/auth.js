// Micro deps
const { json, createError } = require('micro')

// Utils
const connectWithDB = require('./db')
const { isUser, isAdmin } = require('./authCheck')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { secret } = require('./config')[process.env.NODE_ENV || 'development']

// User model
const User = require('./models/User')

const db = connectWithDB()

const checkUser = async (plainPass, hashedPass) => {
  const match = await bcrypt.compare(plainPass, hashedPass)
  return match
}

const userAuth = async (req, res) => {
  const { email, password } = await json(req)

  if (!email || !password) throw createError(400, 'Bad params. Email and password is required')

  // Get user from db
  const user = await User.findOne({ email }, (err, user) => {
    if (err) throw createError(500, 'Could not get user from db')
    return user
  })

  // Check if user exists
  if (!user) throw createError(404, 'User does not exist')

  // Check if password matches
  const passMatch = await checkUser(password, user.password)

  if (!passMatch) throw createError(400, 'Password incorrect')

  // Set jwt token
  const token = await jwt.sign({ id: user._id,
    auth: user.auth },
  secret,
  { expiresIn: '24h' })

  // Set jwt in headers
  res.setHeader('Authorization', token)

  return {
    message: 'Login success',
    token
  }
}


module.exports = {
  userAuth
}
