const router = require('koa-router')()
const { to } = require('await-to-js')
const UserDao = require('../moudle/userDao')
let userDao = new UserDao()

router.prefix('/api/user')

// 登陆
router.post('/login', async (ctx, next) => {
    let result = { code: 1000 }
    const { userName, password } = ctx.request.body

    let [err, res] = await to(userDao.findOne({userName, password}))

    if (err) {
        result.code = 1001
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

module.exports = router
