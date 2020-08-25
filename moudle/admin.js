const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')

const adminSchema = new Schema({
    username: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    password: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    }
})

const Admin = mongoClient.model(`Admin`, adminSchema, 'admin')
module.exports = Admin