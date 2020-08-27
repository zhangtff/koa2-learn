const https = require('https')
const http = require('http')
const path = require('path')
const fs = require('fs')
const router = require('koa-router')()
let mongoose = require('mongoose')
const { to } = require('await-to-js')
const ArticleDao = require('../moudle/articleDao')
let articleDao = new ArticleDao()

router.prefix('/api/article')

// 增加文章
router.post('/add', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {}
    }

    let { title, column, type, thumb, content, link} = ctx.request.body

    // 判断文章标题是否已经存在
    let [err0, res0] = await to(articleDao.findOne({title}))

    if (err0) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        if (res0 === null) {
            // 微信公众号外链文章处理逻辑
            if (type === 2) {
                let [err, res] = await to(httpGetPromise(link))

                if (err) {
                    result.code = 4001
                    result.message = '获取文章缩略图失败'
                } else {
                    const htmlStr = res
                    const matchArr = htmlStr.match(/msg_cdn_url = "(.*?)"/)
            
                    if (matchArr !== null) {
                        let [err1, res1] = await to(httpGetPromise(matchArr[1],2, 2))
            
                        if (err1) {
                            console.log(err1)
                            result.message = '获取文章缩略图失败'
                        } else {
                            const dir = path.join(__dirname + '/../static/upload/thumb/')
                            const imgName = new Date().getTime() + '.jpg'
                            thumb = '/upload/thumb/' + imgName
            
                            fs.writeFileSync(dir + imgName, res1, "binary")

                            let [err2, res2] = await to(articleDao.save({title, column, type, thumb, content, link}))

                            if (err2) {
                                result.code = 1001
                                result.message = '数据库错误'
                            }
                        }
                    }
            
                }
            }
        } else {
            result.code = 4002
            result.message = '已存在相同标题文章'
        }
    }

    ctx.body = result
})

// 获取文章列表
router.post('/getList', async (ctx, next) => {
    let result = { 
        code: 1000,
        data: {
            total: 0,
            items: []
        }
    }
    // 排序方式用1 和 -1 表示
    const {pageNum, pageSize, sort, column, type} = ctx.request.body
    const query = {}

    if (column) query.column = column
    if (type) query.type = type

    const [err, res] = await to(articleDao.getCount(query))
    if (!err) result.data.total = res 

    const [err1, res1] = await to(articleDao.getList(query, null, pageNum, pageSize, sort))

    if (err1) {
        console.log(err1)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res1
    }

    ctx.body = result
})

// 更新文章
router.post('/update', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    let { _id, title, column, type, thumb, content, link} = ctx.request.body

    // 微信公众号外链文章处理逻辑
    if (type === 2) {
        let [err, res] = await to(httpGetPromise(link))

        if (err) {
            result.code = 4001
            result.message = '获取文章缩略图失败'
        } else {
            const htmlStr = res
            const matchArr = htmlStr.match(/msg_cdn_url = "(.*?)"/)
    
            if (matchArr !== null) {
                let [err1, res1] = await to(httpGetPromise(matchArr[1],2, 2))
    
                if (err1) {
                    console.log(err1)
                    result.message = '获取文章缩略图失败'
                } else {
                    const dir = path.join(__dirname + '/../static/upload/thumb/')
                    const imgName = new Date().getTime() + '.jpg'
                    thumb = '/upload/thumb/' + imgName
    
                    fs.writeFileSync(dir + imgName, res1, "binary")

                    let [err2, res2] = await to(articleDao.updateOne({_id} ,{title, column, type, thumb, content, link}))

                    if (err2) {
                        result.code = 1001
                        result.message = '数据库错误'
                    }
                }
            }
    
        }
    }

    ctx.body = result
})

// 删除文章，支持批量
router.post('/delete', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    const { ids } = ctx.request.body

    let [err, res] = await to(articleDao.deleteMany({_id: { $in: ids }}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 获取文章详情
router.post('/getDetail', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    const { _id } = ctx.request.body

    const [err, res] = await to(articleDao.findOne({ _id }))
    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data = res
    }

    ctx.body = result
})

/**
* 将http.get异步函数封装未Promise
* @param {protocol | Int} 协议类型，1：https，2：http
* @param {type | Int} 资源类型，1：源码，2：文件
*/
function httpGetPromise(url, protocol = 1, type = 1) {
    return new Promise((resolve, reject) => {
        const protocolCom = protocol === 1 ? https : http
        protocolCom.get(url, function (res) {
            let resData = ''

            if (type === 1) {
                res.setEncoding('utf8')
            } else {
                res.setEncoding('binary')
            }
                      
            res.on('data', data => {
                resData += data
            })

            res.on('end', () => {
                resolve(resData)
            })

        }).on('error', error => {
            console.log(error)
            reject(error)
        })
    })
}

module.exports = router