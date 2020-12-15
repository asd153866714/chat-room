const Koa = require('koa')
const Router = require('koa-router')

const app = module.exports = new Koa() 
const router = new Router()

const server = require('http').createServer(app.callback())
const socket = require('./socket')
socket.init(server)
const fs = require('fs')
const serve = require('koa-static')
const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const PORT = 8000

app.use(serve(__dirname + '/public'))
app.use(koaBody())
app.use(koaLogger())


router
    .get('/', (ctx) => {
        ctx.type = 'html'
        ctx.body = fs.createReadStream('./view/index.html')   
    })

    .post('/join-room', (ctx) => {
        let { username, room } = ctx.request.body
        // console.log(username, room)
        ctx.redirect(`/chat-room?username=${username}&room=${room}`)
    })

    .get('/chat-room', async (ctx, next) => {
        ctx.type = 'html'
        ctx.body = fs.createReadStream('./view/chat.html')

        await next()
    }) 

app.use(router.routes())

server.listen(PORT, () => {
    console.log(`Server run on http://localhost:${PORT}`)
})