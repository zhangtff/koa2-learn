const router = require('koa-router')()
let mongoose = require('mongoose')
const { to } = require('await-to-js')
const LawDao = require('../moudle/lawDao')
let lawDao = new LawDao()

router.prefix('/api/law')

router.get('/', async(ctx, next) => {
    ctx.body = 'law index'
})

// 根据id获取法律条文详情
router.post('/getLawDetail', async(ctx, next) => {
    const reqBody = ctx.request.body

    let code, res, err

        [err, res] = await to(lawDao.findOne({ '_id': mongoose.Types.ObjectId(reqBody.id) }))

    if (err) {
        code = 'fail'
    } else {
        code = res
    }

    ctx.body = code
})

// 模糊查询
router.post('/search', async(ctx, next) => {
    const { type, keyword, _id } = ctx.request.body
    let query, code, constraints = '';

    // 只检索标题
    if (type == 1) {
        query = {
            title: {
                $regex: keyword
            }
        }
    } else {
        query = {
            $or: [{
                    title: {
                        $regex: keyword
                    }
                },
                {
                    'content.partTitle': {
                        $regex: keyword
                    }
                },
                {
                    'content.partDes': {
                        $regex: keyword
                    }
                },
                {
                    'content.partContent.chapterTitle': {
                        $regex: keyword
                    }
                },
                {
                    'content.partContent.chapterDes': {
                        $regex: keyword
                    }
                },
                {
                    'content.partContent.chapterContent.articleTitle': {
                        $regex: keyword
                    }
                },
                {
                    'content.partContent.chapterContent.articleContent': {
                        $regex: keyword
                    }
                }
            ]
        }
    }
    if (_id !== undefined) query._id = _id
    if (type === 1) constraints = '_id title'
    const [err, res] = await to(lawDao.findAll(query, constraints))

    if (err) {
        code = 'fail'
    } else {
        code = res
    }

    ctx.body = code
})

// 获取法律文件列表
router.post('/getList', async(ctx, next) => {
    let result = {
        code: 1000,
        message: ''
    }

    const [err, res] = await to(lawDao.findAll({}, '_id title'))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data = res
    }

    ctx.body = result
})


module.exports = router