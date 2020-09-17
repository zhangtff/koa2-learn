const BaseDao = require('../lib/baseDao')
const User = require('./user')

class UserDao extends BaseDao {
    constructor() {
        super(User)
    }

    // 去重获取地市列表
    areaList() {
            return new Promise((resolve, reject) => {
                this.Model.find({}, 'area')
                    .distinct('area')
                    .exec(function(err, result) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                    })
            })
        }
        // 去重获取处室列表
    departmentList() {
        return new Promise((resolve, reject) => {
            this.Model.find({}, 'department')
                .distinct('department')
                .exec(function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
        })
    }

    // 指定处室下未绑定微信的
    userListByDepartment(department) {
        return new Promise((resolve, reject) => {
            this.Model.find({ department: department, openID: '' }, 'name')
                .exec(function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
        })
    }
}

module.exports = UserDao