const { Schema } = require('mongoose')
const { mongoClient } = require('../lib/mongo')
const BaseDao = require('../lib/baseDao')

const bannerSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true //去除数据前后的空格
    },
    url: {
        type: String,
        required: true,
        trim: true //去除数据前后的空格
    },
    thumb: {
        type: String,
        required: true,
        trim: true //去除数据前后的空格
    },
    sort: {
        type: Number,
        required: true,
    }
})

const Banner = mongoClient.model(`Banner`, bannerSchema, 'banner')

class BannerDao extends BaseDao {
    constructor() {
            super(Banner)
        }
        // 获取banner列表
    getList() {
        return new Promise((resolve, reject) => {
            this.Model.find()
                .sort({ 'sort': 1 })
                .exec(function(err, record) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(record)
                    }
                })
        })
    }
}

module.exports = BannerDao