const { router, get, post, patch, del } = require('microrouter')
const { createError } = require('micro')
const { handleErrors } = require('./error')
const cors = require('micro-cors')()
const env = process.env.NODE_ENV || 'development'

const { createService, getService } = require('./service')

const BASE_URI = '/api'

const notFoundError = (req, res) => {
  throw createError(404, 'Not Found')
}

module.exports = cors(
  handleErrors(
    router(
    	post(`${BASE_URI}/service`, createService),
 			get(`${BASE_URI}/service`, getService),
      get('/*', notFoundError),
      post('/*', notFoundError),
      patch('/*', notFoundError),
      del('/*', notFoundError)
    )
  )
)
