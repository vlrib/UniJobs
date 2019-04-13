// Micro deps
const { json, createError } = require('micro')
// Utils
const mongoose = require('mongoose')
const connectWithDB = require('./db')

// User model
const User = require('./models/User')

const db = connectWithDB()

const createUser = async (req, res) => {
	const { email, password, name } = await json(req)

	if (!email || !password || !name) throw createError(400, 'Email, password and name is required')

	const newUser = new User({ name, email, password })

  const user = await newUser.save()
  	.then(() => console.log('User saved'))
  	.catch((err) => { throw createError(500, 'Could not create user in db') })

 	return newUser
}

const getUser = async (req, res) => {
	const { id } = await json(req)

	if (!id) throw createError(400, 'Id is required')

	const user = await User.findById(id, (err, user) => {
		if (err) throw createError(500, 'Could not retrieve user from db')
		return user
	})

	return user
}

const deleteUser = async (req, res) => {
	const { id } = await json(req)

	if (!id) throw createError(400, 'Id is required')


  const deletedUser = await User.findOneAndDelete({_id: id}, (err, user) => {
      if (err) { throw createError(500, 'Could not remove user from db' + err) }

      // if no user with the given ID is found throw 400
      if (!user) { throw createError(404, 'No user with that ID'); }

      return user
  })

	return deleteUser
}

module.exports = {
	createUser,
	getUser,
	deleteUser
}
