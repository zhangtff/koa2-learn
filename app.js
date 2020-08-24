const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const static = require('koa-static')   //静态资源服务插件
const path = require('path')           //路径管理
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const pv = require('./middleware/koa-pv')


const index = require('./routes/index')
const users = require('./routes/users')
const lowRouter = require('./routes/law')
const reportRouter = require('./routes/report')
const userRouter = require('./routes/user')

// error handler
onerror(app)

// session配置
app.keys = ['koa']
const CONFIG = {
  key: 'koa'
}
app.use(session(CONFIG, app))

// 配置静态资源
const staticPath = './static'
app.use(static(
    path.join( __dirname, staticPath)
))

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

// app.use(pv())

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(lowRouter.routes(), lowRouter.allowedMethods())
app.use(reportRouter.routes(), reportRouter.allowedMethods())
app.use(userRouter.routes(), userRouter.allowedMethods())

// 连接数据库
// mongoose.connect('mongodb://localhost:27017/Student', {
//   useNewUrlParser: true
// })

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
