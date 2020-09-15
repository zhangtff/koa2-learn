const router = require('koa-router')()
const path = require('path')
const fs = require('fs')
const { to } = require('await-to-js')
const BannerDao = require('../moudle/bannerDao')
const bannerDao = new BannerDao()

router.prefix('/api/banner')

// 添加轮播图
router.post('/add', async(ctx, next) => {
    let result = {
        code: 1000,
        message: ''
    }

    if (ctx.request.files) {
        const repData = ctx.request.body
        const { file } = ctx.request.files
        const dir = path.join(__dirname + '/../static/upload/banner/')
        const tempArr = file.name.split('.')
        const suffix = tempArr[tempArr.length - 1]
        const fileName = new Date().getTime() + '.' + suffix

        fs.copyFileSync(file.path, dir + fileName)
        repData.thumb = '/upload/banner/' + fileName

        const [err, res] = await to(bannerDao.save(repData))
        if (err) {
            result.code = 1001
            result.message = '数据库错误'
        }
    } else {
        result.code = 6001
        result.message = '上传图片文件异常'
    }

    ctx.body = result
})

// 获取轮播图列表
router.post('/getList', async(ctx, next) => {
    let result = {
        code: 1000,
        data: {
            items: []
        }
    }

    const [err, res] = await to(bannerDao.getList())

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res
    }

    ctx.body = result
})

// 修改轮播图信息
router.post('/edit', async(ctx, next) => {
    let result = {
        code: 1000,
        message: ''
    }

    if (ctx.request.files) {
        const repData = ctx.request.body
        const { file } = ctx.request.files
        const dir = path.join(__dirname + '/../static/upload/banner/')
        const tempArr = file.name.split('.')
        const suffix = tempArr[tempArr.length - 1]
        const fileName = new Date().getTime() + '.' + suffix

        fs.copyFileSync(file.path, dir + fileName)
        repData.thumb = '/upload/banner/' + fileName

        const [err, res] = await to(bannerDao.updateOne({ _id: resData._id }, resData))
        if (err) {
            result.code = 1001
            result.message = '数据库错误'
        }
    } else {
        result.code = 6001
        result.message = '上传图片文件异常'
    }

    ctx.body = result
})

// 删除轮播图，支持批量
router.post('/delete', async(ctx, next) => {
    let result = {
        code: 1000,
        message: ''
    }
    const { ids } = ctx.request.body

    let [err, res] = await to(bannerDao.deleteMany({ _id: { $in: ids } }))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

module.exports = router