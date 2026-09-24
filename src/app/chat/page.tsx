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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    // Utilisation de 100dvh pour le mobile parfait
    <div className="h-[100dvh] flex overflow-hidden bg-white dark:bg-gray-950">
      <ChatSidebar
        activeChat={activeChat}
        onSelectChat={(chat) => {
          setActiveChat(chat)
          setSidebarOpen(false) // Ferme la sidebar sur mobile après sélection
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Fenêtre de chat */}
      <div className={`flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 transition-transform ${sidebarOpen ? 'translate-x-full md:translate-x-0' : ''}`}>
        <ChatWindow
          activeChat={activeChat}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  )
}