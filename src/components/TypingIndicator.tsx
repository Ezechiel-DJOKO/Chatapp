'use client'

import React from 'react'
import { TypingUser } from '@/types'

export default function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (users.length === 0) return null

  const text =
    users.length === 1
      ? `${users[0].username} est en train d'écrire`
      : users.length === 2
        ? `${users[0].username} et ${users[1].username} écrivent`
        : `${users[0].username} et ${users.length - 1} autres écrivent`

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-gray-500">
      <div className="flex space-x-1">
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="italic">{text}...</span>
    </div>
  )
}