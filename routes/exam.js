const router = require('koa-router')()
const { to } = require('await-to-js')
const XLSX = require('xlsx')
const UserDao = require('../moudle/userDao')
const userDao = new UserDao()
const QuestionBankDao = require('../moudle/questionBankDao')
const questionBankDao = new QuestionBankDao()
const QuestionDao = require('../moudle/questionDao')
const questionDao = new QuestionDao()

router.prefix('/api/exam')

// 导入考生信息
router.post('/importUser', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    // 判断是否上传文件
    if (ctx.request.files) {
        const { file } = ctx.request.files
        const workbook = XLSX.readFile(file.path)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const xlsxJson = XLSX.utils.sheet_to_json(worksheet)

        // 循环避免重复插入数据库表
        for(let i = 0; i < xlsxJson.length; i++) {
            const department = xlsxJson[i]['处室']
            const name = xlsxJson[i]['姓名']

            if (department && name) {
                const tempObj = {
                    openID: '',
                    department,
                    name
                }
                await userDao.updateOne(tempObj, tempObj, {
                    upsert: true
                })
            }
        }
    } else {
        result.code = 5001
        result.message = '上传考生信息文件异常'
    }

    ctx.body = result
})

// 增加考生信息
router.post('/addUser', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    let { department, name } = ctx.request.body

    // 判断考生信息是否已录入，目前不允许部门名称和姓名都一样的记录重复
    const [err, res] = await to(userDao.findOne({ department, name}))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        if (res === null) {
            const [err1, res1] = await to(userDao.save({
                openID: '',
                department,
                name
            }))

            if (err1) {
                result.code = 1001
                result.message = '数据库错误'
            }
        } else {
            result.code = 5002
            result.message = '已存在相同部门和姓名的记录'
        }
    }

    ctx.body = result
})

// 获取考生信息列表
router.post('/getUserList', async (ctx, next) => {
    let result = { 
        code: 1000,
        data: {
            total: 0,
            items: []
        }
    }

    // 排序方式用1 和 -1 表示
    const { pageNum, pageSize, sort, department, name } = ctx.request.body
    let query = {}

    if (department) query.department = { $regex: department }
    if (name) query.name = { $regex: name }

    const [err, res] = await to(userDao.getCount(query))

    if (!err) result.data.total = res 

    const [err1, res1] = await to(userDao.getList(query, null, pageNum, pageSize, sort))

    if (err1) {
        console.log(err1)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res1
    }

    ctx.body = result
})

// 修改考生信息
router.post('/getEditUser', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    let { _id, department, name } = ctx.request.body

    const [err, res] = await to(userDao.updateOne({_id} ,{ department, name }))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 删除考生，支持批量，暂时不考虑考试记录的问题
router.post('/deleteUser', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    const { ids } = ctx.request.body

    let [err, res] = await to(userDao.deleteMany({_id: { $in: ids }}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 增加考试题库分类
router.post('/addQuestionBank', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    const repData = ctx.request.body

    // 判断是否已有同名的题库
    const [err, res] = await to(questionBankDao.findOne({ name: repData.name }))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        if (res === null) {
            const [err1, res1] = await to(questionBankDao.save(repData))

            if (err1) {
                result.code = 1001
                result.message = '数据库错误'
            }
        } else {
            result.code = 5003
            result.message = '已存在相同名称的记录'
        }
    }

    ctx.body = result
})

// 获取题库列表
router.post('/getQuestionBankList', async (ctx, next) => {
    let result = { 
        code: 1000,
        data: {
            total: 0,
            items: []
        }
    }

    // 排序方式用1 和 -1 表示
    const { pageNum, pageSize, sort, name, status } = ctx.request.body
    let query = {}

    if (name) query.name = { $regex: name }
    if (status !== undefined) query.status = status

    const [err, res] = await to(questionBankDao.getCount(query))
    if (!err) result.data.total = res

    const [err1, res1] = await to(questionBankDao.getList(query, null, pageNum, pageSize, sort))

    if (err1) {
        console.log(err1)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res1
    }

    ctx.body = result
})

// 修改题库状态
router.post('/editQuestionBankStatus', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    const { _id, status } = ctx.request.body
    const [err, res] = await to(questionBankDao.updateOne({ _id } ,{ status }))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 修改题库信息
router.post('/editQuestionBank', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    const resData = ctx.request.body
    const [err, res] = await to(questionBankDao.updateOne({ _id: resData._id }, resData))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 删除题库信息，支持批量
router.post('/deleteQuestionBank', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    const { ids } = ctx.request.body

    let [err, res] = await to(questionBankDao.deleteMany({_id: { $in: ids }}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 导入题目信息
router.post('/importQuestion', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    // 判断是否上传文件
    if (ctx.request.files) { 
        const { bankId } = ctx.request.body
        const { file } = ctx.request.files
        const workbook = XLSX.readFile(file.path)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const xlsxJson = XLSX.utils.sheet_to_json(worksheet)

        // 循环避免重复插入数据库表
        for(let i = 0; i < xlsxJson.length; i++) {
            let type = ''
            let options = []
            const title = xlsxJson[i]['题目']
            const typeStr = xlsxJson[i]['类型']
            const answer = xlsxJson[i]['答案'].replace(/[^a-z]/ig, '').toUpperCase()
            
            if (typeStr.indexOf('单选') > -1) type = 1
            if (typeStr.indexOf('多选') > -1) type = 2
            if (typeStr.indexOf('判断') > -1) type = 3
            if (xlsxJson[i]['选项A'] !== undefined && xlsxJson[i]['选项A'].trim() !== '') options.push(xlsxJson[i]['选项A'])
            if (xlsxJson[i]['选项B'] !== undefined && xlsxJson[i]['选项B'].trim() !== '') options.push(xlsxJson[i]['选项B'])
            if (xlsxJson[i]['选项C'] !== undefined && xlsxJson[i]['选项C'].trim() !== '') options.push(xlsxJson[i]['选项C'])
            if (xlsxJson[i]['选项D'] !== undefined && xlsxJson[i]['选项D'].trim() !== '') options.push(xlsxJson[i]['选项D'])
            if (xlsxJson[i]['选项E'] !== undefined && xlsxJson[i]['选项E'].trim() !== '') options.push(xlsxJson[i]['选项E'])
            if (xlsxJson[i]['选项F'] !== undefined && xlsxJson[i]['选项F'].trim() !== '') options.push(xlsxJson[i]['选项F'])
            if (xlsxJson[i]['选项G'] !== undefined && xlsxJson[i]['选项G'].trim() !== '') options.push(xlsxJson[i]['选项G'])

            const tempObj = {
                bankId,
                type,
                title,
                options,
                answer
            }

            await questionDao.updateOne(tempObj, tempObj, {
                upsert: true
            })
        }
    } else {
        result.code = 5004
        result.message = '上传题目信息文件异常'
    }

    ctx.body = result
})

// 开始考试
router.post('/createExam', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    const { openID, bankId } = ctx.request.body
    const [err, res] = await to(questionDao.createExam(bankId, 1, 10))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data = res
    }

    ctx.body = result
})

module.exports = router