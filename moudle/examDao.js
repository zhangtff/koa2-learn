const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')
const BaseDao = require('../lib/baseDao')

const examSchema = new Schema({
    openID: {
        type: String,
        required: true,
        trim:true //去除数据前后的空格
    },
    bankID: {
        type: String,
        required: true,
        trim:true //去除数据前后的空格
    },
    questions: {
        singleArr: [ String ],
        singleAnsArr: [ String ],
        userSingleAnsArr: [ String ],
        multipleArr: [ String ],
        multipleAnsArr: [ String ],
        userMultipleAnsArr: [ String ],
        judgeArr: [ String ],
        judgeAnsArr: [ String ],
        userJudgeAnsArr: [ String ]
    },
    startTime: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
    handTime: {
        type: Number
    },
    score: {
        type: Number
    }
})

const Exam = mongoClient.model(`Exam`, examSchema, 'exam')

class ExamDao extends BaseDao {
    constructor() {
        super(Exam)
    }
}

module.exports = ExamDao