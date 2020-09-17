const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')

const userSchema = new Schema({
    openID: {
        type: String,
        index: true, //设定索引值
        trim: true //去除数据前后的空格
    },
    area: {
        type: String,
        trim: true //去除数据前后的空格
    },
    department: {
        type: String,
        trim: true //去除数据前后的空格
    },
    name: {
        type: String,
        trim: true //去除数据前后的空格
    }
})

const User = mongoClient.model(`User`, userSchema, 'user')
module.exports = User