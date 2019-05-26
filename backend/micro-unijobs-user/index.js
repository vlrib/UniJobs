const { router, get, post, patch, del } = require('microrouter')
const { createError } = require('micro')
const { handleErrors } = require('./error')
const cors = require('micro-cors')()
const env = process.env.NODE_ENV || 'development'

const BASE_URI = '/api'

const { createUser, createAdmin, getUser, patchUser, deleteUser } = require('./user')
const { userAuth } = require('./auth')

const notFoundError = (req, res) => {
  throw createError(404, 'Not Found')
}

module.exports = cors(
  handleErrors(
    router(
      post(`${BASE_URI}/user`, createUser),
      post(`${BASE_URI}/user/admin`, createAdmin),
      get(`${BASE_URI}/user`, getUser),
      patch(`${BASE_URI}/user`, patchUser),
      del(`${BASE_URI}/user`, deleteUser),
      post(`${BASE_URI}/auth/user`, userAuth),
      get('/*', notFoundError),
      post('/*', notFoundError),
      patch('/*', notFoundError),
      del('/*', notFoundError)
    )
  )
)
