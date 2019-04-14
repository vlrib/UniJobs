const jwt = require('jsonwebtoken')
const moment = require('moment')
const { createError } = require('micro')
const { secret, systemKey } = require('./config')[process.env.NODE_ENV || 'development']

const jwtParser = async (req, res) => {
  // Get only the token
  const token = req.headers.authorization.split(' ').pop()

  // Check if it is the system
  if (token === systemKey) {
    return {
      system: true
    }
  }

  try {
    const decoded = jwt.verify(token, secret)
    const expiresIn = new Date(decoded.exp * 1000)

    // check if Jwt token expired already
    if (moment().diff(expiresIn, 'days') < 0) {
      throw createError(401, 'Needs Authentication')
    }
    return decoded
  } catch (err) {
    throw createError(401, 'Needs Authentication')
  }
}

const getJwtAuth = async (req, res) => {
  // if there is no authorization in headers throw error
  if (!req.headers.authorization) throw createError(401, 'Needs Authentication')

  return jwtParser(req, res)
}

module.exports = {
  getJwtAuth
}