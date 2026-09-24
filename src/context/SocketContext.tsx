'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  onlineUsers: string[]
  isConnected: boolean
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || undefined

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    const newSocket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
})

    newSocket.on('connect', () => {
      console.log('🔌 Socket connecté')
      setIsConnected(true)
      newSocket.emit('user:online', user.id)
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket déconnecté')
      setIsConnected(false)
    })

    newSocket.on('users:online', (userIds: string[]) => {
      setOnlineUsers(userIds)
    })

    newSocket.on(
      'user:status',
      ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
        setOnlineUsers((prev) => {
          if (isOnline) {
            return prev.includes(userId) ? prev : [...prev, userId]
          }
          return prev.filter((id) => id !== userId)
        })
      }
    )

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)