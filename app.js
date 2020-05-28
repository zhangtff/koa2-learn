const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const session = require('koa-generic-session')

const pv = require('./middleware/koa-pv')

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// session配置
app.keys = ['koa']
const CONFIG = {
  key: 'koa'
}
app.use(session(CONFIG, app))

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(pv())

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// app.use(async (ctx, next) => {
//   console.log(1)
//   await next()
//   console.log(2)
// })

// app.use((ctx, next) => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log(3)
//       resolve()
//     }, 2000)
//     next()
//   })
// })
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
