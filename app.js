const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const static = require('koa-static')   //静态资源服务插件
const path = require('path')           //路径管理
const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
const koaBody = require('koa-body')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const pv = require('./middleware/koa-pv')


const index = require('./routes/index')
const userRouter = require('./routes/user')
const lowRouter = require('./routes/law')
const reportRouter = require('./routes/report')
const adminRouter = require('./routes/admin')
const articleRouter = require('./routes/article')
const examRouter = require('./routes/exam')

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
// app.use(bodyparser({
//   enableTypes:['json', 'form', 'text']
// }))
app.use(koaBody({
  multipart:true, // 支持文件上传
  // encoding:'gzip',
  formidable:{
    uploadDir:path.join(__dirname,'static/upload/files'), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    maxFieldsSize:20 * 1024 * 1024, // 文件上传大小
    onFileBegin:(name,file) => { // 文件上传前的设置
      // console.log(`name: ${name}`);
      // console.log(file);
    },
  }
}))
app.use(json())
app.use(logger())
// app.use(require('koa-static')(__dirname + '/public'))

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
app.use(userRouter.routes(), userRouter.allowedMethods())
app.use(lowRouter.routes(), lowRouter.allowedMethods())
app.use(reportRouter.routes(), reportRouter.allowedMethods())
app.use(adminRouter.routes(), adminRouter.allowedMethods())
app.use(articleRouter.routes(), articleRouter.allowedMethods())
app.use(examRouter.routes(), examRouter.allowedMethods())

// 连接数据库
// mongoose.connect('mongodb://localhost:27017/Student', {
//   useNewUrlParser: true
// })

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
