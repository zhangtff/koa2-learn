const BaseDao = require('../lib/baseDao')
const Report = require('./report')

class ReportDao extends BaseDao {
    constructor() {
        super(Report)
    }
}

module.exports = ReportDao