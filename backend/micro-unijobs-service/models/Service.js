const mongoose = require('mongoose')
const Schema = mongoose.Schema

const serviceSchema = new Schema({
  name: String,
  date: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  },
  description: String,
  isOffer: Boolean,
  likedBy: [String],
  location: String,
  active: { type: Boolean, default: true },
  createdBy: String
})

let Service
try {
  Service = mongoose.model('Service')
} catch (error) {
  Service = mongoose.model('Service', serviceSchema)
}

module.exports = Service
