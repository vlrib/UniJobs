const { router, get, post, patch, del } = require('microrouter')

const { createError } = require('micro')

const { handleErrors } = require('./error')

const cors = require('micro-cors')()

const env = process.env.NODE_ENV || 'development'

const BASE_URI = '/api/user'

const { createUser, getUser, deleteUser } = require('./user')

const notFoundError = (req, res) => {
	throw createError(404, 'Not Found')
}

module.exports = cors(
	handleErrors(
		router(
			post(`${BASE_URI}`, createUser),
			get(`${BASE_URI}`, getUser),
			del(`${BASE_URI}`, deleteUser),
			get('/*', notFoundError),
			post('/*', notFoundError),
			patch('/*', notFoundError),
			del('/*', notFoundError)
		)
	)
)