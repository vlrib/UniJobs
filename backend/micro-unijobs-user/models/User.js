const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { auth } = require('../config')[process.env.NODE_ENV || 'development']

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  date: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  image: { type: String, default: null },
  auth: { type: Number, default: auth.user }
})

let User
try {
  User = mongoose.model('User')
} catch (error) {
  User = mongoose.model('User', userSchema)
}

module.exports = User
