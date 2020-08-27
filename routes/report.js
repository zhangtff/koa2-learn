const router = require('koa-router')()
const { to } = require('await-to-js')
const ReportDao = require('../moudle/reportDao')
let reportDao = new ReportDao()

router.prefix('/api/report')


// 增加举报
router.post('/add', async (ctx, next) => {
    let result = { code: 1000 }
    const {name, company, position, content, reportName, contact} = ctx.request.body

    // 查询记录是否已经存在
    let [err, res] = await to(reportDao.findOne({name, company, position, content, reportName, contact}))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        if (res !== null) {
            result.code = 2001
            result.message = '举报记录已存在'
        } else {
            [err, res] = await to(reportDao.save({name, company, position, content, reportName, contact}))

            if (err) {
                result.code = 1001
                result.message = '数据库错误'
            }
        }
    }

    ctx.body = result
})

// 获取举报列表
router.post('/getList', async (ctx, next) => {
    let result = { 
        code: 1000,
        data: {
            total: 0,
            items: []
        }
    }
    // 排序方式用1 和 -1 表示
    const {pageNum, pageSize, sort} = ctx.request.body

    const [err, res] = await to(reportDao.getCount())

    if (!err) result.data.total = res 

    const [err1, res1] = await to(reportDao.getList({}, null, pageNum, pageSize, sort))

    if (err1) {
        console.log(err1)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res1
    }

    ctx.body = result
})

// 删除指定举报，支持批量
router.post('/delete', async (ctx, next) => {
    let result = { code: 1000 }
    const { ids } = ctx.request.body

    let [err, res] = await to(reportDao.deleteMany({_id: { $in: ids }}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})


module.exports = router