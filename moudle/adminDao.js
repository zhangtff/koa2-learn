const BaseDao = require('../lib/baseDao')
const Admin = require('./admin')

class AdminDao extends BaseDao {
    constructor() {
        super(Admin)
    }
}

module.exports = AdminDao