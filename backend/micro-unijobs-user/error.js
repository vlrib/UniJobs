const { send } = require('micro')

const handleErrors = fn => async (req, res) => {
  try {
    const response = await fn(req, res)
    send(res, 200, response)
  } catch (err) {
    console.error(err.stack)
    send(res, 404, err)
  }
}

module.exports = {
	handleErrors
}