const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')
const BaseDao = require('../lib/baseDao')
const mongoose = require('mongoose')

const examSchema = new Schema({
    openID: {
        type: String,
        required: true,
        trim:true //去除数据前后的空格
    },
    bankID: {
        type: "objectId",
        required: true
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
    // 关联题库表和考生表查询
    examList(pageNum, pageSize, sort = -1) {
        return new Promise((resolve, reject) => {
            this.Model.aggregate([
                {
                    $lookup: {
                        from: 'questionBank',
                        localField: 'bankID',
                        foreignField: '_id',
                        as: 'bank'
                    }
                },
                {
                    $lookup: {
                        from: 'user',
                        localField: 'openID',
                        foreignField: 'openID',
                        as: 'user'
                    }
                },
                {
                    "$project": {
                        questions: 0
                    }
                }
            ])
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .sort({'_id': sort})
            .exec(function (err, record) {
                if (err) {
                    reject(err)
                } else {
                    resolve(record)
                }
            })
        })
    }
}

module.exports = ExamDao