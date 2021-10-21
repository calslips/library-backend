const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
    minLength: 2
  },
  published: Number,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: [{
    type: String,
    required: true
  }]
})

schema.plugin(uniqueValidator)

module.exports = mongoose.model('Book', schema)