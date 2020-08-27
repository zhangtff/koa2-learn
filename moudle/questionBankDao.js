const BaseDao = require('../lib/baseDao')
const QuestionBank = require('./questionBank')

class QuestionBankDao extends BaseDao {
    constructor() {
        super(QuestionBank)
    }
}

module.exports = QuestionBankDao