const { Schema, model } = require('mongoose')
const { reqNum, reqString } = require('../utils/types')

const skillSchema = new Schema({
    memberId: reqString,
    wins: reqNum,
    losses: reqNum,
    skill: reqNum
})

module.exports = model('skill', skillSchema)