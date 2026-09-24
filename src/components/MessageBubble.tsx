'use client'

import React from 'react'
import { Message } from '@/types'
import UserAvatar from './UserAvatar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCheck, FileText, Download } from 'lucide-react'
import VoicePlayer from './VoicePlayer'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  isGroup?: boolean
  onContextMenu: (e: React.MouseEvent, message: Message) => void
  onReact: (messageId: string, emoji: string) => void
}

export default function MessageBubble({ message, isOwn, showAvatar = true, isGroup = false, onContextMenu, onReact }: MessageBubbleProps) {
  const reactionsMap = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4 animate-fade-in`}>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-400 italic border dark:border-gray-700">Message supprimé</div>
      </div>
    )
  }

  // Formatage de la taille du fichier
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, message); }} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-4 group animate-fade-in select-none`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%] md:max-w-[65%]`}>
        {!isOwn && showAvatar && <UserAvatar src={message.sender.avatar} username={message.sender.username} size="sm" showStatus={false} />}
        {!isOwn && !showAvatar && <div className="w-8" />}

        <div className="flex flex-col relative">
          {message.replyTo && (
            <div className={`text-xs px-3 py-1.5 mb-0.5 rounded-t-xl border-l-4 ${isOwn ? 'bg-primary-600 text-primary-100 border-primary-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 border-primary-500'}`}>
              <span className="font-semibold block text-[11px]">{message.replyTo.sender?.username}</span>
              <p className="truncate">{message.replyTo.content || (message.replyTo.type === 'image' ? '📷 Image' : '📎 Fichier')}</p>
            </div>
          )}

          <div className={`relative p-2 rounded-2xl ${isOwn ? 'bg-primary-500 text-white rounded-br-xs' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-xs'}`}>
            {isGroup && !isOwn && <p className="text-xs font-semibold mb-1 px-1 text-primary-500">{message.sender.username}</p>}

            {/* SI C'EST UNE IMAGE */}
            {message.type === 'image' && message.fileUrl && (
              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                <img src={message.fileUrl} alt="Image envoyée" className="rounded-xl max-w-full h-auto max-h-64 object-cover cursor-zoom-in mb-1" />
              </a>
            )}

            {/* SI C'EST UN FICHIER */}
            {message.type === 'file' && message.fileUrl && (
              <a href={message.fileUrl} download={message.fileName || 'fichier'} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors ${isOwn ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                <div className={`p-2 rounded-lg ${isOwn ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <FileText size={20} className={isOwn ? 'text-white' : 'text-gray-600 dark:text-gray-300'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                  <p className={`text-xs opacity-70`}>{formatFileSize(message.fileSize)} • {message.fileMime?.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                </div>
                <Download size={18} className="opacity-70" />
              </a>
            )}

            {/* SI C'EST UN VOCAL */}
            {message.type === 'voice' && message.fileUrl && (
              <VoicePlayer audioUrl={message.fileUrl} duration={message.duration} isOwn={isOwn} />
            )}

            {/* TEXTE DU MESSAGE */}
            {message.content && <p className="text-sm whitespace-pre-wrap break-words px-1.5">{message.content}</p>}

            <div className={`flex items-center justify-end gap-1 mt-1 px-1 ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
              <span className="text-[10px]">{format(new Date(message.createdAt), 'HH:mm', { locale: fr })}</span>
              {message.isEdited && <span className="text-[10px] italic">(modifié)</span>}
              {isOwn && <CheckCheck size={14} />}
            </div>
          </div>

          {/* RÉACTIONS */}
          {Object.keys(reactionsMap).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(reactionsMap).map(([emoji, count]) => (
                <button key={emoji} onClick={() => onReact(message.id, emoji)} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs shadow-sm hover:scale-110 transition-transform">
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-[10px] font-bold text-gray-500">{count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}