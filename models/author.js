const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minLength: 3
  },
  born: Number
})

schema.plugin(uniqueValidator)

module.exports = mongoose.model('Author', schema)