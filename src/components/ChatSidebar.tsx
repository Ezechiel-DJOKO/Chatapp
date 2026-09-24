'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Conversation, Group, ActiveChat } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import ConversationList from './ConversationList'
import GroupList from './GroupList'
import NewChatModal from './NewChatModal'
import CreateGroupModal from './CreateGroupModal'
import UserAvatar from './UserAvatar'
import ProfileModal from './ProfileModal'
import {
  MessageCircle,
  Plus,
  Search,
  LogOut,
  UserPlus,
  UsersRound,
  Settings,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatSidebarProps {
  activeChat: ActiveChat | null
  onSelectChat: (chat: ActiveChat) => void
  isOpen: boolean
  onClose?: () => void
}

export default function ChatSidebar({
  activeChat,
  onSelectChat,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const { user, logout } = useAuth()
  const { socket, isConnected } = useSocket()
  const [tab, setTab] = useState<'chats' | 'groups'>('chats')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups')
      const data = await res.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    fetchGroups()
  }, [fetchConversations, fetchGroups])

  useEffect(() => {
    if (!socket) return

    socket.on('conversation:updated', () => fetchConversations())
    socket.on('group:updated', () => fetchGroups())
    socket.on('group:new', () => fetchGroups())
    socket.on('group:member:added', () => fetchGroups())

    return () => {
      socket.off('conversation:updated')
      socket.off('group:updated')
      socket.off('group:new')
      socket.off('group:member:added')
    }
  }, [socket, fetchConversations, fetchGroups])

  const handleSelectConversation = (conv: Conversation) => {
    const otherUser = conv.user1Id === user?.id ? conv.user2 : conv.user1
    onSelectChat({
      type: 'conversation',
      id: conv.id,
      name: otherUser.username,
      avatar: otherUser.avatar,
      isOnline: otherUser.isOnline,
      data: conv,
    })
    onClose?.()
  }

  const handleSelectGroup = (group: Group) => {
    onSelectChat({
      type: 'group',
      id: group.id,
      name: group.name,
      avatar: group.avatar,
      data: group,
    })
    onClose?.()
  }

  const handleNewChatCreated = (conversationId: string) => {
    setTimeout(async () => {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
      const newConv = data.conversations?.find(
        (c: Conversation) => c.id === conversationId
      )
      if (newConv) handleSelectConversation(newConv)
    }, 300)
  }

  const handleGroupCreated = (groupId: string) => {
    setTimeout(async () => {
      const res = await fetch('/api/groups')
      const data = await res.json()
      setGroups(data.groups || [])
      const newGroup = data.groups?.find((g: Group) => g.id === groupId)
      if (newGroup) {
        handleSelectGroup(newGroup)
        setTab('groups')
      }
    }, 300)
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnecté avec succès')
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.user1Id === user?.id ? conv.user2 : conv.user1
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-30 w-full max-w-[340px] md:w-80 lg:w-96 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out`}
      >
        {/* === EN-TÊTE UTILISATEUR === */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Avatar + infos */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <UserAvatar
                src={user?.avatar}
                username={user?.username || ''}
                size="md"
                isOnline={true}
              />
              <div className="min-w-0">
                <h1 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                  {user?.username}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {isConnected ? 'En ligne' : 'Déconnecté'}
                  </span>
                </div>
              </div>
            </div>

            {/* Boutons : 1 Settings + 1 Logout uniquement */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                title="Profil & Paramètres"
              >
                <Settings size={20} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                title="Se déconnecter"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Recherche (une seule fois) */}
          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
          </div>
        </div>

        {/* === ONGLETS === */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={() => setTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
              tab === 'chats'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageCircle size={18} />
            <span>Discussions</span>
            {tab === 'chats' && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('groups')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
              tab === 'groups'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <UsersRound size={18} />
            <span>Groupes</span>
            {tab === 'groups' && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>

        {/* === BOUTON D'ACTION === */}
        <div className="px-4 py-3 shrink-0">
          <button
            onClick={() =>
              tab === 'chats' ? setShowNewChat(true) : setShowCreateGroup(true)
            }
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
              tab === 'chats'
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {tab === 'chats' ? (
              <>
                <UserPlus size={16} />
                Nouvelle discussion
              </>
            ) : (
              <>
                <Plus size={16} />
                Créer un groupe
              </>
            )}
          </button>
        </div>

        {/* === LISTE === */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'chats' ? (
            <ConversationList
              conversations={filteredConversations}
              activeId={
                activeChat?.type === 'conversation' ? activeChat.id : undefined
              }
              onSelect={handleSelectConversation}
            />
          ) : (
            <GroupList
              groups={filteredGroups}
              activeId={activeChat?.type === 'group' ? activeChat.id : undefined}
              onSelect={handleSelectGroup}
            />
          )}
        </div>
      </aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onStartChat={handleNewChatCreated}
      />
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  )
}