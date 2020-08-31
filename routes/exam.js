const router = require('koa-router')()
const { to } = require('await-to-js')
const XLSX = require('xlsx')
const UserDao = require('../moudle/userDao')
const userDao = new UserDao()
const QuestionBankDao = require('../moudle/questionBankDao')
const questionBankDao = new QuestionBankDao()
const QuestionDao = require('../moudle/questionDao')
const questionDao = new QuestionDao()
const ExamDao = require('../moudle/examDao')
const examDao = new ExamDao()

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
router.post('/editUser', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    let { _id, department, name, openID } = ctx.request.body

    const [err, res] = await to(userDao.updateOne({_id} ,{ department, name, openID: openID ? openID : '' }))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 解除考生已有的微信绑定关系
router.post('/userUnbindWechat', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    let { _id, openID } = ctx.request.body
    await examDao.deleteMany({openID})

    const [err, res] = await to(userDao.updateOne({_id} ,{ openID : '' }))

    if (err) {
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 删除考生，支持批量，同时考试记录
router.post('/deleteUser', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    const { ids } = ctx.request.body

    // 删除考试信息需要增加删除考试记录的逻辑
    for (let i = 0; i < ids.length; i++) {
        const _id = ids[i]
        const item= await userDao.findOne({ _id})
        if (item !== null && item.openID !== '') {
            await examDao.deleteMany({openID: item.openID})
        }
    }

    let [err, res] = await to(userDao.deleteMany({_id: { $in: ids }}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 增加考试题库分类,新增题库默认为关闭状态，需要导入符合设置的各类型题目后才能开启
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
    if (status) {
        // 判断题目数量是否符合设定
        const [err, res] = await to(questionBankDao.findOne({ _id }))

        if (err) {
            console.log(err)
            result.code = 1001
            result.message = '数据库错误'
        } else {
            if (res !== null) {
                const { singleNum, multipleNum, judgeNum } = res
                let singleCount, multipleCount, judgeCount
                const [err1, res1] = await to(questionDao.getCount({
                    bankID: _id,
                    type: 1
                }))

                if (err1) {
                    console.log(err1)
                    result.code = 1001
                    result.message = '数据库错误'
                } else {
                    singleCount = res1

                    const [err2, res2] = await to(questionDao.getCount({
                        bankID: _id,
                        type: 2
                    }))
    
                    if (err2) {
                        console.log(err2)
                        result.code = 1001
                        result.message = '数据库错误'
                    } else {
                        multipleCount = res2

                        const [err3, res3] = await to(questionDao.getCount({
                            bankID: _id,
                            type: 3
                        }))
        
                        if (err3) {
                            console.log(err3)
                            result.code = 1001
                            result.message = '数据库错误'
                        } else {
                            judgeCount = res3
                            // console.log(singleCount, singleNum, multipleCount, multipleNum, judgeCount, judgeNum)
                            if (singleCount < singleNum || multipleCount < multipleNum || judgeCount < judgeNum) {
                                result.code = 5006
                                result.message = '请导入足够的试题后再开启本考试'
                            } else {
                                const [err4, res4] = await to(questionBankDao.updateOne({ _id } ,{ status }))

                                if (err4) {
                                    result.code = 1001
                                    result.message = '数据库错误'
                                }
                            }
                        }
                    }
                }
            } else {
                result.code = 5005
                result.message = '未找到考试对应的题库信息'
            }
        }    

    } else {
        const [err, res] = await to(questionBankDao.updateOne({ _id } ,{ status }))

        if (err) {
            result.code = 1001
            result.message = '数据库错误'
        }
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
        const { bankID } = ctx.request.body
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
                bankID,
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

// 获取指定题库题目列表
router.post('/getQuestionList', async (ctx, next) => {
    let result = { 
        code: 1000,
        data: {
            total: 0,
            items: []
        }
    }

    // 排序方式用1 和 -1 表示
    const { pageNum, pageSize, sort, _id } = ctx.request.body
    let query = {}

    if (_id) query.bankID = _id

    const [err, res] = await to(questionDao.getCount(query))
    if (!err) result.data.total = res

    const [err1, res1] = await to(questionDao.getList(query, null, pageNum, pageSize, sort))

    if (err1) {
        console.log(err1)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res1
    }

    ctx.body = result
})

// 删除题目信息，支持批量
router.post('/deleteQuestion', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    const { ids } = ctx.request.body

    let [err, res] = await to(questionDao.deleteMany({_id: { $in: ids }}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 开始考试
router.post('/createExam', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {}
    }

    const { openID, bankID } = ctx.request.body
    // 根据bankid获取题库信息
    const [err, res] = await to(questionBankDao.findOne({ '_id': bankID }))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        if (res !== null) {
            const { singleNum, multipleNum, judgeNum, duration, times} = res
            let singleArr = [],
                singleAnsArr = [],
                multipleArr = [],
                multipleAnsArr = [],
                judgeArr = [],
                judgeAnsArr = [];

            // 判断考试次数
            const examTimes = await examDao.getCount({
                openID,
                bankID
            })

            if (examTimes >= times) {
                result.code = 5007
                result.message = '已超过最大考试次数'
            } else {
                // 取单选题
                const [err1, res1] = await to(questionDao.createExam(bankID, 1, singleNum))

                if (err1) {
                    console.log(err1)
                    result.code = 1001
                    result.message = '数据库错误'
                } else {
                    res1.map(single => {
                        singleArr.push(single._id)
                        singleAnsArr.push(single.answer)
                    })

                    // 取多选题
                    const [err2, res2] = await to(questionDao.createExam(bankID, 2, multipleNum))

                    if (err2) {
                        console.log(err2)
                        result.code = 1001
                        result.message = '数据库错误'
                    } else {
                        res2.map(multiple => {
                            multipleArr.push(multiple._id)
                            multipleAnsArr.push(multiple.answer)
                        })

                        // 取判断题
                        const [err3, res3] = await to(questionDao.createExam(bankID, 3, judgeNum))

                        if (err3) {
                            console.log(err3)
                            result.code = 1001
                            result.message = '数据库错误'
                        } else {
                            res3.map(judge => {
                                judgeArr.push(judge._id)
                                judgeAnsArr.push(judge.answer)
                            })
                        }

                        // 插入数据库
                        const [err4, res4] = await to(examDao.save({
                            openID,
                            bankID,
                            questions: {
                                singleArr,
                                singleAnsArr,
                                multipleArr,
                                multipleAnsArr,
                                judgeArr,
                                judgeAnsArr
                            },
                            startTime: new Date().getTime(),
                            duration,
                            status: false,
                            score: 0
                        }))

                        if (err4) {
                            console.log(err4)
                            result.code = 1001
                            result.message = '数据库错误'
                        } else {
                            result.data._id = res4._id
                        }
                    }
                }
            }

        } else {
            result.code = 5005
            result.message = '未找到考试对应的题库信息'
        }
    }

    ctx.body = result
})

// 管理员获取考试记录
router.post('/getExamList', async (ctx, next) => {
    let result = { 
        code: 1000,
        data: {
            total: 0,
            items: []
        }
    }

    // 排序方式用1 和 -1 表示
    const { pageNum, pageSize, sort } = ctx.request.body

    const [err, res] = await to(examDao.getCount())

    if (!err) result.data.total = res 

    const [err1, res1] = await to(examDao.examList(pageNum, pageSize, sort))

    if (err1) {
        console.log(err1)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        // 处理返回结果，sql不完美代码来完善数据结构
        const tempArr = []
        res1.map(item => {
            tempArr.push({
                _id: item._id,
                bankName: item.bank[0].name,
                department: item.user[0].department,
                name: item.user[0].name,
                status: item.status,
                score: item.score
            })
        })
        result.data.items = tempArr
    }

    ctx.body = result
})

// 删除考试记录，支持批量
router.post('/deletEexam', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }
    const { ids } = ctx.request.body

    let [err, res] = await to(examDao.deleteMany({_id: { $in: ids }}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    }

    ctx.body = result
})

// 获取处室列表
router.post('/getDepartmentList', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {}
    }

    let [err, res] = await to(userDao.departmentList())

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res
    }

    ctx.body = result
})

// 判断用户是否已经绑定处室信息
router.post('/getUserbindStatus', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {}
    }

    const { openID } = ctx.request.body
    let [err, res] = await to(userDao.findOne({openID}))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        if (res === null) {
            result.data.status = false
        } else {
            result.data.status = true
        }
    }

    ctx.body = result
})

// 获取指定处室下未绑定微信的考生姓名列表
router.post('/getUserListByDepartment', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {}
    }
    const { department } = ctx.request.body

    let [err, res] = await to(userDao.userListByDepartment(department))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        result.data.items = res
    }

    ctx.body = result
})

// 考生绑定微信
router.post('/userbindWechat', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: ''
    }

    let { department, name, openID } = ctx.request.body

    if ( department === undefined || name === undefined || openID === undefined) {
        result.code = 1002
        result.message = '参数异常'
    } else {
        const [err, res] = await to(userDao.findOne({ department, name }))

        if (err) {
            result.code = 1001
            result.message = '数据库错误'
        } else {
            if (res === null) {
                result.code = 1002
                result.message = '参数异常'
            } else {
                const [err1, res1] = await to(userDao.updateOne({ department, name } ,{ openID }))

                if (err1) {
                    result.code = 1001
                    result.message = '数据库错误'
                }
            }
        }
    }

    ctx.body = result
})

// 获取当前开启的考试和考试对应的考试记录
router.post('/getExamListAndHistory', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {
            items: []
        }
    }
    const { openID } = ctx.request.body

    const [err, res] = await to(questionBankDao.getList({ status: true }, null, 1, 100, -1))

    if (err) {
        console.log(err)
        result.code = 1001
        result.message = '数据库错误'
    } else {
        const tempArr = []
        for (let i = 0; i < res.length; i++) {
            
            const examArr = await examDao.getList({
                openID: openID,
                bankID: res[i]._id
            }, 'status score', 1, 1000, -1)
            tempArr.push({ ...res[i]._doc, examArr})
        }

        result.data.items = tempArr
    }

    ctx.body = result
})

// 获取考试试卷详情
router.post('/getExamInfo', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {}
    }
    const { _id } = ctx.request.body
    const examObj = await examDao.findOne({ _id })
    if (examObj === null) {
        result.code = 1001
        result.message = '数据库错误'
    } else {
        const { _id, duration, startTime } = examObj
        const { singleArr, multipleArr, judgeArr} = examObj.questions
        console.log(singleArr, multipleArr, judgeArr)
        const singleInfoArr = await questionDao.findAll({_id: { $in: singleArr }}, 'title options')
        const multipleInfoArr = await questionDao.findAll({_id: { $in: multipleArr }}, 'title options')
        const judgeInfoArr = await questionDao.findAll({_id: { $in: judgeArr }}, 'title options')

        result.data.singleInfoArr = singleInfoArr
        result.data.multipleInfoArr = multipleInfoArr
        result.data.judgeInfoArr = judgeInfoArr
        result.data = {
            _id,
            duration,
            startTime,
            singleInfoArr,
            multipleInfoArr,
            judgeInfoArr
        }
    }
    
    ctx.body = result
})

// 交卷
router.post('/submitExam', async (ctx, next) => {
    let result = { 
        code: 1000,
        message: '',
        data: {}
    }



    ctx.body = result
})

module.exports = router