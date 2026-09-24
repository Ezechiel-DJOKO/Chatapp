'use client'

import React from 'react'
import { Group } from '@/types'
import { useAuth } from '@/context/AuthContext'
import UserAvatar from './UserAvatar'
import { format, isToday, isYesterday } from 'date-fns'

interface GroupListProps {
  groups: Group[]
  activeId?: string
  onSelect: (group: Group) => void
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Hier'
  return format(date, 'dd/MM/yy')
}

export default function GroupList({
  groups,
  activeId,
  onSelect,
}: GroupListProps) {
  const { user } = useAuth()

  if (groups.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 text-sm">
        <p className="text-3xl mb-2">👥</p>
        <p>Aucun groupe</p>
        <p className="text-xs mt-1">Créez votre premier groupe !</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5 px-2">
      {groups.map((group) => {
        const isActive = group.id === activeId

        return (
          <button
            key={group.id}
            onClick={() => onSelect(group)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              isActive
                ? 'bg-emerald-50 border border-emerald-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <UserAvatar
              src={group.avatar}
              username={group.name}
              size="lg"
              showStatus={false}
            />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <p
                  className={`font-semibold text-sm truncate ${
                    isActive ? 'text-emerald-700' : 'text-gray-900'
                  }`}
                >
                  {group.name}
                </p>
                {group.lastMessage && (
                  <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                    {formatTime(group.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {group.lastMessage ? (
                  <p className="text-xs text-gray-500 truncate">
                    <span className="font-medium">
                      {group.lastMessage.senderId === user?.id
                        ? 'Vous'
                        : group.lastMessage.sender?.username}
                      :
                    </span>{' '}
                    {group.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    {group.members.length} membres
                  </p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}