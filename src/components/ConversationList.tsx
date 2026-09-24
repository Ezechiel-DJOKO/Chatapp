'use client'

import React from 'react'
import { Conversation } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import UserAvatar from './UserAvatar'
import { format, isToday, isYesterday } from 'date-fns'

interface ConversationListProps {
  conversations: Conversation[]
  activeId?: string
  onSelect: (conversation: Conversation) => void
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Hier'
  return format(date, 'dd/MM/yy')
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  const { user } = useAuth()
  const { onlineUsers } = useSocket()

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 text-sm">
        <p className="text-3xl mb-2">💬</p>
        <p>Aucune conversation</p>
        <p className="text-xs mt-1">
          Commencez une nouvelle discussion !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5 px-2">
      {conversations.map((conv) => {
        const otherUser =
          conv.user1Id === user?.id ? conv.user2 : conv.user1
        const isActive = conv.id === activeId
        const isOnline = onlineUsers.includes(otherUser.id)

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              isActive
                ? 'bg-primary-50 border border-primary-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <UserAvatar
              src={otherUser.avatar}
              username={otherUser.username}
              size="lg"
              isOnline={isOnline}
            />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <p
                  className={`font-semibold text-sm truncate ${
                    isActive ? 'text-primary-700' : 'text-gray-900'
                  }`}
                >
                  {otherUser.username}
                </p>
                {conv.lastMessage && (
                  <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                    {formatTime(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              {conv.lastMessage && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {conv.lastMessage.senderId === user?.id ? 'Vous: ' : ''}
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}