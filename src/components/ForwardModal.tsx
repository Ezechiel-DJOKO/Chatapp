'use client'

import React, { useState, useEffect } from 'react'
import { Message, Conversation, Group } from '@/types'
import { X, Send } from 'lucide-react'
import UserAvatar from './UserAvatar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface ForwardModalProps {
  isOpen: boolean
  message: Message | null
  onClose: () => void
}

export default function ForwardModal({ isOpen, message, onClose }: ForwardModalProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchChats()
    }
  }, [isOpen])

  const fetchChats = async () => {
    try {
      const [convRes, groupRes] = await Promise.all([
        fetch('/api/conversations'),
        fetch('/api/groups'),
      ])
      const convData = await convRes.json()
      const groupData = await groupRes.json()

      setConversations(convData.conversations || [])
      setGroups(groupData.groups || [])
    } catch (e) {
      console.error(e)
    }
  }

  const forwardTo = async (targetId: string, isGroup: boolean) => {
    if (!message) return
    setLoading(true)

    try {
      const endpoint = isGroup
        ? `/api/groups/${targetId}/messages`
        : `/api/conversations/${targetId}/messages`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.content,
        }),
      })

      if (res.ok) {
        toast.success('Message transféré !')
        onClose()
      }
    } catch (e) {
      toast.error('Échec du transfert')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !message) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transférer le message</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 italic truncate">
          &quot;{message.content}&quot;
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Conversations</p>
          {conversations.map((c) => {
            const other = c.user1Id === user?.id ? c.user2 : c.user1
            return (
              <button
                key={c.id}
                onClick={() => forwardTo(c.id, false)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UserAvatar src={other.avatar} username={other.username} size="md" />
                <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white">{other.username}</span>
                <Send size={16} className="text-primary-500" />
              </button>
            )
          })}

          <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase mt-4">Groupes</p>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => forwardTo(g.id, true)}
              disabled={loading}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <UserAvatar src={g.avatar} username={g.name} size="md" showStatus={false} />
              <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white">{g.name}</span>
              <Send size={16} className="text-emerald-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}