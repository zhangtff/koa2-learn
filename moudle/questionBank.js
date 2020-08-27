const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')

const questionBankSchema = new Schema({
    name: {
        type: String,
        index: true, //设定索引值
        required: true,
        trim:true //去除数据前后的空格
    },
    status: {
        type: Boolean,
        required: true 
    },
    singleNum: {
        type: Number,
        required: true 
    },
    singleScore: {
        type: Number,
        required: true 
    },
    multipleNum: {
        type: Number,
        required: true 
    },
    multipleScore: {
        type: Number,
        required: true 
    },
    judgeNum: {
        type: Number,
        required: true 
    },
    judgeScore: {
        type: Number,
        required: true 
    },
    totalScore: {
        type: Number,
        required: true 
    },
    times: {
        type: Number,
        required: true 
    },
    duration: {
        type: Number,
        required: true 
    }
})

const QuestionBank = mongoClient.model(`QuestionBank`, questionBankSchema, 'questionBank')
module.exports = QuestionBank