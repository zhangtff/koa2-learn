module.exports = () => {
    return async (ctx, next) => {
        let n = ctx.session.views || 0
        ctx.session.views = ++n
        console.log(`pv=${ctx.session.views}------------------------`)
        await next()
    }
}