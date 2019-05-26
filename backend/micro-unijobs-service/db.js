const mongoose = require('mongoose')

const url = `mongodb+srv://root:unijobsstrongpass@unijobs-l78mj.mongodb.net/test?retryWrites=true`

const connectWithDB = () => {
  mongoose.Promise = global.Promise
  mongoose.connect(url, { useNewUrlParser: true })
}

module.exports = connectWithDB
