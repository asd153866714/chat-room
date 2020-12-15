const socket = require('socket.io')

const userUtil = require('./utils/user')
const messageUtil = require('./utils/message')
let io;

class Chat {
    constructor() {
    }
    init(server) {
        io = socket(server)
        this.ioListen()
    }
    ioListen() {
        io.on('connection', (socket) => {
            console.log('a user connected')

            // Listen for user join
            socket.on('join room', ({ username, room }) => {
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

                // Send users and room information
                io.to(user.room).emit('users&room', {
                    room: user.room,
                    users: userUtil.getRoomUsers(user.room)
                })
            })
        })
    }
}



module.exports = new Chat()