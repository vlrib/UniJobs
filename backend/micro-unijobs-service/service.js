// Micro deps
const { json, createError } = require('micro')

// Utils
const connectWithDB = require('./db')
const { isUser, isAdmin, isSystem } = require('./authCheck')
const { getJwtAuth } = require('./jwtHelper')
const { auth: authConfig } = require('./config')[process.env.NODE_ENV || 'development']

const db = connectWithDB()