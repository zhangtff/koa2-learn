class BaseDao {
    /**
     * 子类构造传入对应的 Model 类
     *
     * @param Model
     */
    constructor(Model) {
        this.Model = Model;
    }


    /**
     * 使用 Model 的 静态方法 create() 添加 doc
     *
     * @param obj 构造实体的对象
     * @returns {Promise}
     */
    create(obj) {
        return new Promise((resolve, reject) => {
            let entity = new this.Model(obj);
            this.Model.create(entity, (error, result) => {
                if (error) {
                    console.log('create error--> ', error);
                    reject(error);
                } else {
                    // console.log('create result--> ', result);
                    resolve(result)
                }
            });
        });
    }


    /**
     * 使用 Model save() 添加 doc
     *
     * @param obj 构造实体的对象
     * @returns {Promise}
     */
    save(obj) {
        return new Promise((resolve, reject) => {
            let entity = new this.Model(obj);
            entity.save((error, result) => {
                if (error) {
                    console.log('save error--> ', error);
                    reject(error);
                } else {
                    // console.log('save result--> ', result);
                    resolve(result)
                }
            });
        });
    }


    /**
     * 查询所有符合条件 docs
     *
     * @param condition 查找条件
     * @param constraints
     * @returns {Promise}
     */
    findAll(condition, constraints) {
        return new Promise((resolve, reject) => {
            this.Model.find(condition, constraints ? constraints : null, (error, results) => {
                if (error) {
                    console.log('findAll error--> ', error);
                    reject(error);
                } else {
                    // console.log('findAll results--> ', results);
                    resolve(results);
                }
            });
        });
    }


    /**
     * 查找符合条件的第一条 doc
     *
     * @param condition
     * @param constraints
     * @returns {Promise}
     */
    findOne(condition, constraints) {
        return new Promise((resolve, reject) => {
            this.Model.findOne(condition, constraints ? constraints : null, (error, results) => {
                if (error) {
                    console.log('findOne error--> ', error);
                    reject(error);
                } else {
                    // console.log('findOne results--> ', results);
                    resolve(results);
                }
            });
        });
    }


    /**
     * 查找排序之后的第一条
     *
     * @param condition
     * @param orderColumn
     * @param orderType
     * @returns {Promise}
     */
    findOneByOrder(condition, orderColumn, orderType) {
        return new Promise((resolve, reject) => {
            this.Model.findOne(condition)
                .sort({[orderColumn]: orderType})
                .exec(function (err, record) {
                    // console.log(record);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(record);
                    }
                });
        });
    }


    /**
     * 更新单个 docs
     *
     * @param condition 查找条件
     * @param updater 更新操作
     * @param option 更新配置
     * @returns {Promise}
     */
    updateOne(condition, updater, option = {}) {
        return new Promise((resolve, reject) => {
            this.Model.updateOne(condition, updater, option, (error, results) => {
                if (error) {
                    console.log('update error--> ', error);
                    reject(error);
                } else {
                    // console.log('update results--> ', results);
                    resolve(results);
                }
            });
        });
    }

    /**
     * 更新多个 docs
     *
     * @param condition 查找条件
     * @param updater 更新操作
     * @param option 更新配置
     * @returns {Promise}
     */
    updateMany(condition, updater, option = {}) {
        return new Promise((resolve, reject) => {
            this.Model.updateMany(condition, updater, option, (error, results) => {
                if (error) {
                    console.log('update error--> ', error);
                    reject(error);
                } else {
                    // console.log('update results--> ', results);
                    resolve(results);
                }
            });
        });
    }


    /**
     * 移除 doc
     *
     * @param condition 查找条件
     * @returns {Promise}
     */
    deleteMany(condition) {
        return new Promise((resolve, reject) => {
            this.Model.deleteMany(condition, (error, result) => {
                if (error) {
                    console.log('remove error--> ', error);
                    reject(error);
                } else {
                    // console.log('remove result--> ', result);
                    resolve(result);
                }
            });
        });
    }

    // 分页获取列表
    getList(condition, constraints, pageNum, pageSize, sort = -1) {
        return new Promise((resolve, reject) => {
            this.Model.find(condition, constraints ? constraints : null)
                      .skip((pageNum - 1) * pageSize)
                      .limit(pageSize)
                      .sort({'_id': sort})
                      .exec(function (err, results) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
        });
    }

    // 查询符合条件的总数
    getCount(condition = {}) {
        return new Promise((resolve, reject) => {
            this.Model.countDocuments(condition, (err, count) => {
                if (err) {
                    reject(err)
                } else  {
                    resolve(count)
                }
            })
        })
    }
}


module.exports = BaseDao;