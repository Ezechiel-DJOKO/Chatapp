'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ActiveChat } from '@/types'
import ChatSidebar from '@/components/ChatSidebar'
import ChatWindow from '@/components/ChatWindow'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null)
  const isMobile = useMediaQuery('(max-width: 767px)')

  // Sur mobile : sidebar ouverte si aucun chat sélectionné
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  // Sur mobile, si on sélectionne un chat → fermer la sidebar
  // Si on revient (activeChat = null) → rouvrir la sidebar
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(!activeChat)
    } else {
      setSidebarOpen(true) // desktop : toujours visible
    }
  }, [activeChat, isMobile])

  if (loading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-white dark:bg-gray-950">
      {/* SIDEBAR */}
      <div
        className={`${
          isMobile
            ? sidebarOpen
              ? 'translate-x-0 w-full'
              : '-translate-x-full w-0'
            : 'translate-x-0 w-80 lg:w-96'
        } shrink-0 h-full transition-all duration-300 ease-in-out z-30 ${
          isMobile ? 'fixed inset-0' : 'relative'
        }`}
      >
        <ChatSidebar
          activeChat={activeChat}
          onSelectChat={(chat) => {
            setActiveChat(chat)
            if (isMobile) setSidebarOpen(false)
          }}
          isOpen={true}
          onClose={() => {
            if (isMobile && activeChat) setSidebarOpen(false)
          }}
        />
      </div>

      {/* FENÊTRE DE CHAT */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-full ${
          isMobile && sidebarOpen ? 'hidden' : 'flex'
        }`}
      >
        <ChatWindow
          activeChat={activeChat}
          onToggleSidebar={() => {
            // Sur mobile = bouton retour → revenir à la liste
            if (isMobile) {
              setActiveChat(null)
              setSidebarOpen(true)
            }
          }}
        />
      </div>
    </div>
  )
}