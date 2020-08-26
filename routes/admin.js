const router = require('koa-router')()
const { to } = require('await-to-js')
const AdminDao = require('../moudle/adminDao')
let adminDao = new AdminDao()

router.prefix('/api/admin')

// 登陆
router.post('/login', async (ctx, next) => {
    let result = { code: 1000 }
    const { username, password } = ctx.request.body

    let [err, res] = await to(adminDao.findOne({username, password}))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        if (res === null) {
            result.code = 3001
            result.message = '账号或密码不正确'
        } else {
            result.data = {
                token: new Date().getTime()
            }
        }
    }

    ctx.body = result
})

// 获取管理员信息
router.post('/info', async (ctx, next) => {
    let result = { code: 1000 }
    const { token } = ctx.request.body

    result.data = {
        roles: ['admin'],
        introduction: 'I am a super administrator',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        name: 'Super Admin'
    }

    ctx.body = result
})

// 管理员退出登陆

router.post('/logout', async (ctx, next) => {
    let result = { code: 1000 }
    ctx.body = result
})


module.exports = router
