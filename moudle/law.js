const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')

const lawSchema = new Schema({
    title: {
        type: String,
        index: true, //设定索引值
        trim:true //去除数据前后的空格
    },
    content: [
        {
            partTitle: {
                type: String,
                index: true, //设定索引值
                trim:true //去除数据前后的空格
            },
            partDes: {
                type: String,
                index: true, //设定索引值
                trim:true //去除数据前后的空格
            },
            partContent: [
                {
                    chapterTitle: {
                        type: String,
                        index: true, //设定索引值
                        trim:true //去除数据前后的空格
                    },
                    chapterDes: {
                        type: String,
                        index: true, //设定索引值
                        trim:true //去除数据前后的空格
                    },
                    chapterContent: [
                        {
                            articleTitle: {
                                type: String,
                                index: true, //设定索引值
                                trim:true //去除数据前后的空格
                            },
                            articleContent: {
                                type: String,
                                index: true, //设定索引值
                                trim:true //去除数据前后的空格
                            }
                        }
                    ]
                }
            ]
        }
    ]
})

const Law = mongoClient.model(`Law`, lawSchema, 'law')
module.exports = Law