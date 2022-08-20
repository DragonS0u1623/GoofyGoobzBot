const { model, Schema } = require('mongoose')
const { reqString } = require('../utils/types')

const scrimsSchema = new Schema({
    message: reqString
})

module.exports = model('scrims-queue', scrimsSchema)