const https = require('https')
const { to } = require('await-to-js')
const router = require('koa-router')()

router.prefix('/user')
// 授权拼接地址https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxade672bef67e1e33&redirect_uri=http://qilu.youcheyouqu.com/user/auth&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect
router.get('/auth', async (ctx, next) => {
  const appid = 'wxade672bef67e1e33'
  const appsecret = '8b09b3e975633fb539e29f795b58bca3'
  const { code, state } = ctx.query
  if (code === undefined) {
    ctx.body = '授权失败'
  } else {
    const token_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + appsecret + '&code=' + code + '&grant_type=authorization_code';

    const [err, res] = await to(httpGetPromise(token_url))

    if (err) {
      ctx.body = '授权失败'
    } else {
      const token = JSON.parse(res)
      if (token.errcode) {
        const erroeHtml = `<h1>错误：</h1>${token.errcode}<br/><h2>错误信息：</h2>${token.errmsg}`
        ctx.body = erroeHtml
      } else {
        ctx.redirect('/#/exam?openID=' + token.openid)
      }
    }
  }

  
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

/**
* 将http.get异步函数封装未Promise
* @param {protocol | Int} 协议类型，1：https，2：http
* @param {type | Int} 资源类型，1：源码，2：文件
*/
function httpGetPromise(url, protocol = 1, type = 1) {
  return new Promise((resolve, reject) => {
      const protocolCom = protocol === 1 ? https : http
      protocolCom.get(url, function (res) {
          let resData = ''

          if (type === 1) {
              res.setEncoding('utf8')
          } else {
              res.setEncoding('binary')
          }
                    
          res.on('data', data => {
              resData += data
          })

          res.on('end', () => {
              resolve(resData)
          })

      }).on('error', error => {
          console.log(error)
          reject(error)
      })
  })
}

module.exports = router
