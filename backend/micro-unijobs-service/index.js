const { router, get, post, patch, del } = require('microrouter')
const { createError } = require('micro')
const { handleErrors } = require('./error')
const cors = require('micro-cors')()
const env = process.env.NODE_ENV || 'development'

const BASE_URI = '/api'

const notFoundError = (req, res) => {
  throw createError(404, 'Not Found')
}

module.exports = cors(
  handleErrors(
    router(
      get('/*', notFoundError),
      post('/*', notFoundError),
      patch('/*', notFoundError),
      del('/*', notFoundError)
    )
  )
)
