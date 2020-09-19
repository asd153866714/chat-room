const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)
const fs = require('fs')
const serve = require('koa-static')
const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const userUtil = require('./utils/user')
const messageUtil = require('./utils/message')
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
    io.on('connection', (socket) => {
        console.log('a user connected')
    
        // Listen for user join
        socket.on('join room', ({ username, room}) => {
            const user = userUtil.userJoin(socket.id, username, room)
            
            socket.join(user.room)
            
            // Welcome current user
            socket.emit('message', messageUtil('BOT', 'Welcome to ChatRoom!'))
            
            // Broadcast when a user connects
            socket.broadcast
                .to(user.room)
                .emit('message', messageUtil('BOT', `${user.username} has joined the room`))
    
            // Send users and room information
            io.to(user.room).emit('users&room', {
                users: userUtil.getRoomUsers(user.room),
                room: user.room
            })
        })
    
        // Listen for chat message
        socket.on('chat message', (msg) => {
            const user = userUtil.getCurrentUser(socket.id)
            io.to(user.room).emit('message', messageUtil(user.username, msg))
        })

        // Runs when client disconnects
        socket.on('disconnect', () => {
            console.log('user disconnected')
            console.log(socket.id)
            
            const user = userUtil.userLeave(socket.id)
    
            if (user) {
                io.to(user.room).emit('message', messageUtil('BOT', `${user.username} has left the chat`))
            }
    
            // Send users and room infomation
            io.to(user.room).emit('users&room', {
                room: user.room,
                users: userUtil.getRoomUsers(user.room)
            })
        })
    })

app.use(router.routes())

server.listen(PORT, () => {
    console.log(`Server run on http://localhost:${PORT}`)
})