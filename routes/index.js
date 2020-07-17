const router = require('koa-router')()
const Student = require('../dbs/module/student')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.post('/goods/:id', async (ctx, next) => {
  console.log(ctx)
  ctx.body = 'goods'
})

// 增加学生
router.post('/addStudent', async (ctx, next) => {
  const reqBody = ctx.request.body
  console.log('>>>>>>>reqBody', reqBody)
  const student = new Student({
    name: reqBody.name,
    age: reqBody.age,
    class: reqBody.class
  })

  let code
  try {
    await student.save()
    code = 'success'
  } catch (err) {
    code = 'fail'
  }
  ctx.body = code
})

// 删除学生
router.post('/removeStudent', async(ctx, next) => {
  const reqBody = ctx.request.body
  await Student.where({
    name: reqBody.name
  }).remove()

})

module.exports = router
