const socket = io()

const chatForm = document.querySelector('#chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.querySelector('#room-name')
const userList = document.querySelector('#users')
const typingInput = document.querySelector('#msg')

// Get username and room from URL
const params = new URLSearchParams(window.location.search);
const username = params.get('username')
const room = params.get('room')

// Join caht-room
socket.emit('join room', { username, room })

// Get room and users
socket.on('users&room', ({ users, room }) => {

    // Add room name to DOM
    roomName.innerText = room

    // Add users to DOM
    userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `
})

// Message from server
socket.on('message', (message) => {
    console.log(message)

    // Output message to DOM
    const div = document.createElement("div")
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta">
      ${message.username}
      <span>${message.time}</span>
    </p>
    <p>
      ${message.text}
    </p>
  `
    chatMessages.appendChild(div)

    // let li = document.createElement("li")
    // li.appendChild(document.createTextNode(message))
    // messages.appendChild(li)

    // Scroll down
    // window.scrollTo(0, document.body.scrollHeight)
    chatMessages.scrollTop = chatMessages.scrollHeight
})



// Message submit
chatForm.addEventListener('submit', (event) => {
    event.preventDefault()
    
    // Get message text
    const msg = event.target.elements.msg.value

    // Emit message to server
    socket.emit('chat message', msg.toString())

    // Clear input
    event.target.elements.msg.value = ''
    event.target.elements.msg.focus()
})
