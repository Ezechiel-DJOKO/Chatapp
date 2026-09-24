'use client'

import React, { useState, useEffect } from 'react'
import { User } from '@/types'
import { X, Search, MessageCircle } from 'lucide-react'
import UserAvatar from './UserAvatar'
import { useSocket } from '@/context/SocketContext'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (conversationId: string) => void
}

export default function NewChatModal({
  isOpen,
  onClose,
  onStartChat,
}: NewChatModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { onlineUsers } = useSocket()

  useEffect(() => {
    if (isOpen) fetchUsers()
  }, [isOpen, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(search)}`
      )
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const startChat = async (otherUserId: string) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId }),
      })
      const data = await res.json()
      if (data.conversation) {
        onStartChat(data.conversation.id)
        onClose()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Nouvelle discussion
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Recherche */}
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun utilisateur trouvé
            </p>
          ) : (
            users.map((u) => (
              <button
                key={u.id}
                onClick={() => startChat(u.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <UserAvatar
                  src={u.avatar}
                  username={u.username}
                  isOnline={onlineUsers.includes(u.id)}
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">
                    {u.username}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <MessageCircle size={18} className="text-primary-500" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}