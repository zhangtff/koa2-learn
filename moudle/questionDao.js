const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')
const BaseDao = require('../lib/baseDao')

const questionSchema = new Schema({
    bankID: {
        type: String,
        required: true,
        trim:true //去除数据前后的空格
    },
    type: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        index: true, //设定索引值
        required: true,
        trim:true //去除数据前后的空格
    },
    options	: [ String ],
    answer: {
        type: String,
        required: true,
        trim:true //去除数据前后的空格
    }
})

const Question = mongoClient.model(`Question`, questionSchema, 'question')

class QuestionDao extends BaseDao {
    constructor() {
        super(Question)
    }

    // 考试抽取试题
    createExam(bankID, type, limitSum) {
        return new Promise((resolve, reject) => {
            this.Model.aggregate([{ $match: {
                    bankID, 
                    type
                }}])
                .sample(limitSum) // 随机取指定数量记录
                .exec(function (err, record) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(record);
                    }
                });
        });
    }
}

module.exports = QuestionDao