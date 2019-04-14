const { auth: configAuth } = require('./config')[process.env.NODE_ENV || 'development']

const isUser = ({ auth }) => {
  return auth === configAuth.user
}

const isAdmin = ({ auth }) => {
  return auth === configAuth.admin
}

const isSystem = ({ auth }) => {
	return auth === configAuth.system
}

module.exports = {
  isUser,
  isAdmin,
  isSystem
}
