const { createServer } = require('http')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingTimeout: 60000,
  })

  const onlineUsers = new Map()
  const socketToUser = new Map()

  io.on('connection', (socket) => {
    console.log('✅ Utilisateur connecté:', socket.id)

    socket.on('user:online', (userId) => {
      socketToUser.set(socket.id, userId)
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set())
      }
      onlineUsers.get(userId).add(socket.id)

      io.emit('user:status', { userId, isOnline: true })
      socket.emit('users:online', Array.from(onlineUsers.keys()))
    })

    socket.on('conversation:join', (conversationId) => socket.join(`conv:${conversationId}`))
    socket.on('conversation:leave', (conversationId) => socket.leave(`conv:${conversationId}`))
    socket.on('group:join', (groupId) => socket.join(`group:${groupId}`))
    socket.on('group:leave', (groupId) => socket.leave(`group:${groupId}`))

    // Messages
    socket.on('message:send', (data) => {
      const { conversationId, message } = data
      socket.to(`conv:${conversationId}`).emit('message:receive', { conversationId, message })
      io.emit('conversation:updated', { conversationId, message })
    })

    socket.on('message:group:send', (data) => {
      const { groupId, message } = data
      socket.to(`group:${groupId}`).emit('message:group:receive', { groupId, message })
      io.emit('group:updated', { groupId, message })
    })

    // 🆕 Édition de message
    socket.on('message:edit', (data) => {
      const { conversationId, groupId, message } = data
      const room = conversationId ? `conv:${conversationId}` : `group:${groupId}`
      io.to(room).emit('message:edited', message)
    })

    // 🆕 Suppression de message
    socket.on('message:delete', (data) => {
      const { conversationId, groupId, message } = data
      const room = conversationId ? `conv:${conversationId}` : `group:${groupId}`
      io.to(room).emit('message:deleted', message)
    })

    // 🆕 Réactions
    socket.on('message:reaction', (data) => {
      const { conversationId, groupId, messageId, reactions } = data
      const room = conversationId ? `conv:${conversationId}` : `group:${groupId}`
      io.to(room).emit('message:reaction:update', { messageId, reactions })
    })

    // Indicateurs de frappe
    socket.on('typing:start', (data) => {
      const { conversationId, groupId, user } = data
      if (conversationId) socket.to(`conv:${conversationId}`).emit('typing:start', { conversationId, user })
      if (groupId) socket.to(`group:${groupId}`).emit('typing:start', { groupId, user })
    })

    socket.on('typing:stop', (data) => {
      const { conversationId, groupId, user } = data
      if (conversationId) socket.to(`conv:${conversationId}`).emit('typing:stop', { conversationId, user })
      if (groupId) socket.to(`group:${groupId}`).emit('typing:stop', { groupId, user })
    })

    socket.on('disconnect', () => {
      const userId = socketToUser.get(socket.id)
      if (userId) {
        const userSockets = onlineUsers.get(userId)
        if (userSockets) {
          userSockets.delete(socket.id)
          if (userSockets.size === 0) {
            onlineUsers.delete(userId)
            io.emit('user:status', { userId, isOnline: false })
          }
        }
        socketToUser.delete(socket.id)
      }
      console.log('❌ Utilisateur déconnecté:', socket.id)
    })
  })

  server.listen(port, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   🚀 ChatApp démarré avec succès !   ║
    ║   📍 http://${hostname}:${port}           ║
    ╚══════════════════════════════════════╝
    `)
  })
})