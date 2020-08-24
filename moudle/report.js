const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')

const reportSchema = new Schema({
    name: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    company: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    position: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    content: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    reportName: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    contact: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    time: {
        type: Date,
        default: Date.now
    }
})

const Report = mongoClient.model(`Report`, reportSchema, 'report')
module.exports = Report