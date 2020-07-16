const mongoose = require('mongoose')

// 创建类型
let studentSchemas = new mongoose.Schema({
    name: String,
    age: Number,
    class: String
})

// 创建模型,第三个参数确定了数据库中collection名称
let studentModel = mongoose.model('Student', studentSchemas, 'student')

module.exports = studentModel