const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')

const articleSchema = new Schema({
    title: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    column: {
        type: Number
    },
    type: {
        type: Number
    },
    thumb: {
        type: String
    },
    content: {
        type: String
    },
    link: {
        type: String
    }
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}})

const Article = mongoClient.model(`Article`, articleSchema, 'article')
module.exports = Article