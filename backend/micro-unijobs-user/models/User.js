const mongoose = require('mongoose')
	Schema = mongoose.Schema

const userSchema = new Schema({
	name: String,
	email: String,
	password: String,
	date: {
		createdAt: { type: Date, default: Date.now },
		updatedAt: Date
	},
	image: String,
	auth: Number
})

const User = mongoose.model('User', userSchema)

module.exports = User