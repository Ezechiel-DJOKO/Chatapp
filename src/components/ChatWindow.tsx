'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ActiveChat, Message, TypingUser, Group } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import EmojiPicker from './EmojiPicker'
import UserAvatar from './UserAvatar'
import MessageContextMenu from './MessageContextMenu'
import ForwardModal from './ForwardModal'
import { ArrowLeft, Mic, Trash2 } from 'lucide-react'
import { compressImage } from '@/lib/imageCompressor'
import { useNotificationSound } from '@/hooks/useNotificationSound'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import {
  Send,
  Menu,
  X,
  MessageCircle,
  Check,
  Edit2,
  Paperclip,
  Image as ImageIcon,
  File,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  activeChat: ActiveChat | null
  onToggleSidebar: () => void
}

export default function ChatWindow({ activeChat, onToggleSidebar }: ChatWindowProps) {
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder()

  const { playReceiveSound, playSendSound } = useNotificationSound()

  const { user } = useAuth()
  const { socket, onlineUsers } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  // États des fonctionnalités
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null)
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    })
  }, [])

  // Charger les messages
  useEffect(() => {
    if (!activeChat) return
    setMessages([])
    setLoading(true)
    setTypingUsers([])
    setReplyTo(null)
    setEditingMessage(null)

    const fetchMessages = async () => {
      try {
        const endpoint =
          activeChat.type === 'conversation'
            ? `/api/conversations/${activeChat.id}/messages`
            : `/api/groups/${activeChat.id}/messages`

        const res = await fetch(endpoint)
        const data = await res.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    if (socket) {
      if (activeChat.type === 'conversation') socket.emit('conversation:join', activeChat.id)
      else socket.emit('group:join', activeChat.id)
    }

    return () => {
      if (socket) {
        if (activeChat.type === 'conversation') socket.emit('conversation:leave', activeChat.id)
        else socket.emit('group:leave', activeChat.id)
      }
    }
  }, [activeChat?.id, activeChat?.type, socket])

  useEffect(() => {
    if (messages.length > 0) scrollToBottom(!loading)
  }, [messages.length, loading, scrollToBottom])

  // Événements Socket Temps Réel
  useEffect(() => {
    if (!socket || !activeChat) return

        
const handleNewMessage = (data: { conversationId?: string; groupId?: string; message: Message }) => {
  if (
    (activeChat.type === 'conversation' && data.conversationId === activeChat.id) ||
    (activeChat.type === 'group' && data.groupId === activeChat.id)
  ) {
    setMessages((prev) => [...prev, data.message])
    
    // Si c'est quelqu'un d'autre -> Son de réception, sinon -> Son d'envoi
    if (data.message.senderId !== user?.id) {
      playReceiveSound()
    } else {
      playSendSound()
    }
  }
}

    const handleEditedMessage = (updatedMsg: Message) => {
      setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)))
    }

    const handleDeletedMessage = (deletedMsg: Message) => {
      setMessages((prev) => prev.map((m) => (m.id === deletedMsg.id ? deletedMsg : m)))
    }

    const handleReactionUpdate = ({ messageId, reactions }: { messageId: string; reactions: any[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      )
    }

    const handleTypingStart = (data: { conversationId?: string; groupId?: string; user: TypingUser }) => {
      const matchId = activeChat.type === 'conversation' ? data.conversationId : data.groupId
      if (matchId === activeChat.id && data.user.id !== user?.id) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.id === data.user.id)) return prev
          return [...prev, data.user]
        })
      }
    }

    const handleTypingStop = (data: { conversationId?: string; groupId?: string; user: TypingUser }) => {
      const matchId = activeChat.type === 'conversation' ? data.conversationId : data.groupId
      if (matchId === activeChat.id) {
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.user.id))
      }
    }

    socket.on('message:receive', handleNewMessage)
    socket.on('message:group:receive', handleNewMessage)
    socket.on('message:edited', handleEditedMessage)
    socket.on('message:deleted', handleDeletedMessage)
    socket.on('message:reaction:update', handleReactionUpdate)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('message:receive', handleNewMessage)
      socket.off('message:group:receive', handleNewMessage)
      socket.off('message:edited', handleEditedMessage)
      socket.off('message:deleted', handleDeletedMessage)
      socket.off('message:reaction:update', handleReactionUpdate)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [socket, activeChat?.id, activeChat?.type, user?.id])

  // Envoi de message vocal corrigé
    const handleSendVoice = async () => {
    if (!activeChat) return

    const { blob, duration, mimeType } = await stopRecording()
    if (!blob || duration < 1) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', blob, `voice_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (uploadData.url) {
        const endpoint =
          activeChat.type === 'conversation'
            ? `/api/conversations/${activeChat.id}/messages`
            : `/api/groups/${activeChat.id}/messages`

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: '',
            type: 'voice',
            fileUrl: uploadData.url,
            fileName: 'Message vocal',
            fileSize: uploadData.size,
            fileMime: uploadData.mime || mimeType,
            duration,
          }),
        })

        const data = await res.json()
        if (data.message) {
          setMessages((prev) => [...prev, data.message])
          if (socket) {
            if (activeChat.type === 'conversation')
              socket.emit('message:send', { conversationId: activeChat.id, message: data.message })
            else
              socket.emit('message:group:send', { groupId: activeChat.id, message: data.message })
          }
        }
      }
    } catch (e) {
      toast.error("Erreur lors de l'envoi du vocal")
    } finally {
      setIsUploading(false)
    }
  }

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Gestion de l'indicateur de frappe
  const handleTyping = () => {
    if (!socket || !activeChat || !user) return

    socket.emit('typing:start', {
      conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
      groupId: activeChat.type === 'group' ? activeChat.id : undefined,
      user: { id: user.id, username: user.username },
    })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', {
        conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
        groupId: activeChat.type === 'group' ? activeChat.id : undefined,
        user: { id: user.id, username: user.username },
      })
    }, 2000)
  }

  // Actions Réactions & Suppression
  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })
      const data = await res.json()
      if (data.reactions) {
        socket?.emit('message:reaction', {
          conversationId: activeChat?.type === 'conversation' ? activeChat.id : undefined,
          groupId: activeChat?.type === 'group' ? activeChat.id : undefined,
          messageId,
          reactions: data.reactions,
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.message) {
        socket?.emit('message:delete', {
          conversationId: activeChat?.type === 'conversation' ? activeChat.id : undefined,
          groupId: activeChat?.type === 'group' ? activeChat.id : undefined,
          message: data.message,
        })
        toast.success('Message supprimé')
      }
    } catch (e) {
      toast.error('Erreur lors de la suppression')
    }
  }

    // Envoi de message ou fichier
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !activeChat || !user || isUploading) return

    setIsUploading(true)
    let fileData = null

    if (selectedFile) {
      try {
        // Compression automatique si c'est une photo
        const fileToUpload = await compressImage(selectedFile)

        const formData = new FormData()
        formData.append('file', fileToUpload)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          fileData = uploadData
        } else {
          toast.error(uploadData.error || "Échec de l'envoi de l'image")
          setIsUploading(false)
          return
        }
      } catch (e) {
        toast.error("Erreur lors de l'upload")
        setIsUploading(false)
        return
      }
    }

    const messageContent = newMessage.trim()
    setNewMessage('')
    setSelectedFile(null)

    if (socket) {
      socket.emit('typing:stop', {
        conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
        groupId: activeChat.type === 'group' ? activeChat.id : undefined,
        user: { id: user.id, username: user.username },
      })
    }

    if (editingMessage) {
      try {
        const res = await fetch(`/api/messages/${editingMessage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageContent }),
        })
        const data = await res.json()
        if (data.message) {
          socket?.emit('message:edit', {
            conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
            groupId: activeChat.type === 'group' ? activeChat.id : undefined,
            message: data.message,
          })
          toast.success('Message modifié')
        }
      } catch (e) {
        toast.error('Erreur modification')
      } finally {
        setEditingMessage(null)
        setIsUploading(false)
      }
      return
    }

    setReplyTo(null)
    try {
      const endpoint =
        activeChat.type === 'conversation'
          ? `/api/conversations/${activeChat.id}/messages`
          : `/api/groups/${activeChat.id}/messages`

      const isImage = fileData?.mime.startsWith('image/')
      const msgType = fileData ? (isImage ? 'image' : 'file') : 'text'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          type: msgType,
          replyToId: replyTo?.id,
          fileUrl: fileData?.url,
          fileName: fileData?.name,
          fileSize: fileData?.size,
          fileMime: fileData?.mime,
        }),
      })

      const data = await res.json()
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
        if (socket) {
          if (activeChat.type === 'conversation')
            socket.emit('message:send', { conversationId: activeChat.id, message: data.message })
          else
            socket.emit('message:group:send', { groupId: activeChat.id, message: data.message })
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
      inputRef.current?.focus()
    }
  }

  const isOtherOnline =
    activeChat?.type === 'conversation'
      ? (() => {
          const conv = activeChat.data as any
          const otherId = conv.user1Id === user?.id ? conv.user2Id : conv.user1Id
          return onlineUsers.includes(otherId)
        })()
      : false

    if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* Mini header mobile même sans chat */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-3 flex items-center gap-3 shrink-0 md:hidden">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200"
          >
            <Menu size={22} />
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Discussions</h2>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-5">
            <MessageCircle className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenue sur ChatApp
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-6">
            Sélectionnez une discussion pour commencer à chatter.
          </p>
          <button
            onClick={onToggleSidebar}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors md:hidden"
          >
            Voir mes discussions
          </button>
        </div>
      </div>
    )
  }

    return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* En-tête */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shrink-0">
        {/* Bouton retour (Flèche) pour mobile */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden text-gray-600 dark:text-gray-300"
          title="Retour"
        >
          <ArrowLeft size={22} />
        </button>

        <UserAvatar
          src={activeChat.avatar}
          username={activeChat.name}
          size="md"
          isOnline={isOtherOnline}
          showStatus={activeChat.type === 'conversation'}
        />

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {activeChat.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeChat.type === 'conversation'
              ? isOtherOnline
                ? '🟢 En ligne'
                : '⚪ Hors ligne'
              : `👥 ${(activeChat.data as Group).members?.length || 0} membres`}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === user?.id}
              isGroup={activeChat.type === 'group'}
              onContextMenu={(e, message) => setContextMenu({ x: e.clientX, y: e.clientY, message })}
              onReact={handleReact}
            />
          ))
        )}
        <TypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Aperçu Réponse / Édition */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700 flex items-center gap-3">
          <div className="w-1 h-8 bg-primary-500 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary-500">Réponse à {replyTo.sender.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <Edit2 size={16} className="text-amber-500" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Modification du message</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{editingMessage.content}</p>
          </div>
          <button onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded">
            <X size={16} className="text-amber-600" />
          </button>
        </div>
      )}

            {/* Barre d'envoi - CORRIGÉE POUR MOBILE ET PC */}
      <div className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3 shrink-0 safe-bottom">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          
          {/* Menu Fichier / Trombone */}
          <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]) }} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 sm:p-2.5 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          >
            <Paperclip size={22} />
          </button>

          {/* Emoji */}
          <div className="shrink-0 mb-0.5">
            <EmojiPicker onSelect={(emoji) => setNewMessage((prev) => prev + emoji)} />
          </div>

          {/* Champ de texte */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl min-h-[44px] flex items-center px-4 shadow-inner">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={editingMessage ? 'Modifier le message...' : 'Message'}
              className="w-full bg-transparent text-gray-900 dark:text-white text-sm sm:text-base focus:outline-none placeholder-gray-500 py-2.5"
            />
          </div>

          {/* Bouton Envoyer ou Micro */}
          <div className="shrink-0 mb-0.5">
            {newMessage.trim() || selectedFile ? (
              <button
                onClick={sendMessage}
                disabled={isUploading}
                className="w-11 h-11 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 transition-all flex items-center justify-center shadow-md"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editingMessage ? (
                  <Check size={20} />
                ) : (
                  <Send size={20} className="ml-1" />
                )}
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-11 h-11 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all flex items-center justify-center shadow-md"
              >
                <Mic size={22} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Clic Droit */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          isOwn={contextMenu.message.senderId === user?.id}
          onClose={() => setContextMenu(null)}
          onReply={(m) => setReplyTo(m)}
          onReact={(emoji) => handleReact(contextMenu.message.id, emoji)}
          onEdit={(m) => {
            setEditingMessage(m)
            setNewMessage(m.content)
            inputRef.current?.focus()
          }}
          onDelete={handleDelete}
          onCopy={(content) => {
            navigator.clipboard.writeText(content)
            toast.success('Texte copié !')
          }}
          onForward={(m) => setForwardMessage(m)}
        />
      )}

      {/* Modal de Transfert */}
      <ForwardModal
        isOpen={!!forwardMessage}
        message={forwardMessage}
        onClose={() => setForwardMessage(null)}
      />
    </div>
  )
}