const BaseDao = require('../lib/baseDao')
const Law = require('./law')

class LawDao extends BaseDao {
    constructor() {
        super(Law)
    }
}

module.exports = LawDao