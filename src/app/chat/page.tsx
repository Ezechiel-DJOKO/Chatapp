'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ActiveChat } from '@/types'
import ChatSidebar from '@/components/ChatSidebar'
import ChatWindow from '@/components/ChatWindow'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-white dark:bg-gray-950">
      {/* SIDEBAR (Gaucher sur PC, Plein écran sur mobile si pas de chat actif) */}
      <div
        className={`h-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${
          activeChat
            ? 'hidden md:flex md:w-80 lg:w-96 shrink-0'
            : 'flex w-full md:w-80 lg:w-96 shrink-0'
        }`}
      >
        <ChatSidebar
          activeChat={activeChat}
          onSelectChat={(chat) => setActiveChat(chat)}
          isOpen={true}
        />
      </div>

      {/* FENÊTRE DE CHAT (Droite sur PC, Plein écran sur mobile si chat actif) */}
      <div
        className={`h-full flex-col flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 ${
          activeChat ? 'flex w-full' : 'hidden md:flex'
        }`}
      >
        <ChatWindow
          activeChat={activeChat}
          onToggleSidebar={() => setActiveChat(null)}
        />
      </div>
    </div>
  )
}