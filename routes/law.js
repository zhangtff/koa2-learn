const router = require('koa-router')()
let mongoose = require('mongoose')
const { to } = require('await-to-js')
const LawDao = require('../moudle/lawDao')
let lawDao = new LawDao()

router.prefix('/api/law')

router.get('/', async (ctx, next) => {
    ctx.body = 'law index'
})

// 根据id获取法律条文详情
router.post('/getLawDetail', async (ctx, next) => {
    const reqBody = ctx.request.body

    let code,res,err

    [err, res] = await to(lawDao.findOne({'_id': mongoose.Types.ObjectId(reqBody.id)}))

    if (err) {
        code = 'fail'
    } else {
        code = res
    }

    ctx.body = code
})

// 模糊查询
router.post('/search', async (ctx, next) => {
    const reqBody = ctx.request.body

    const type = reqBody.type
    const keyword = reqBody.keyword
    console.log(type, keyword)
    let query,code,res,err

    // 只检索标题
    if (type == 1) {
        query = {
            title: {
                $regex: keyword
            }
        }
    } else {
        query = {
            $or: [
                {
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

    [err, res] = await to(lawDao.findAll(query))

    if (err) {
        code = 'fail'
    } else {
        code = res
    }

    ctx.body = code
})


module.exports = router