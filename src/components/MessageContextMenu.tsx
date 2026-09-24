'use client'

import React, { useEffect, useRef } from 'react'
import { Reply, Copy, Edit, Trash2, Share2 } from 'lucide-react'
import { Message } from '@/types'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

interface MessageContextMenuProps {
  x: number
  y: number
  message: Message
  isOwn: boolean
  onClose: () => void
  onReply: (message: Message) => void
  onReact: (emoji: string) => void
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
  onCopy: (content: string) => void
  onForward: (message: Message) => void
}

export default function MessageContextMenu({
  x,
  y,
  message,
  isOwn,
  onClose,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onCopy,
  onForward,
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Ajustement pour ne pas dépasser de l'écran
  const adjustedX = Math.min(x, window.innerWidth - 220)
  const adjustedY = Math.min(y, window.innerHeight - 280)

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 w-56 animate-fade-in text-sm"
    >
      {/* Barre de réactions rapides */}
      <div className="flex items-center justify-around px-2 pb-2 mb-1 border-b border-gray-100 dark:border-gray-700">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onReact(emoji)
              onClose()
            }}
            className="text-xl hover:scale-125 transition-transform p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Actions */}
      <button
        onClick={() => {
          onReply(message)
          onClose()
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Reply size={16} className="text-primary-500" />
        <span>Répondre</span>
      </button>

      <button
        onClick={() => {
          onCopy(message.content)
          onClose()
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Copy size={16} className="text-gray-500" />
        <span>Copier le texte</span>
      </button>

      <button
        onClick={() => {
          onForward(message)
          onClose()
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Share2 size={16} className="text-emerald-500" />
        <span>Transférer</span>
      </button>

      {/* Éditer & Supprimer seulement pour l'auteur du message */}
      {isOwn && !message.isDeleted && (
        <>
          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
          <button
            onClick={() => {
              onEdit?.(message)
              onClose()
            }}
            className="w-full px-4 py-2 flex items-center gap-3 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          >
            <Edit size={16} />
            <span>Modifier</span>
          </button>

          <button
            onClick={() => {
              onDelete?.(message.id)
              onClose()
            }}
            className="w-full px-4 py-2 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </button>
        </>
      )}
    </div>
  )
}