'use client'

import React, { useState } from 'react'
import { Smile } from 'lucide-react'

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
  '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
  '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔',
  '😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔',
  '😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶',
  '🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟',
  '🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰',
  '😥','😢','😭','😱','😖','😣','😞','😓','😩','😫',
  '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞',
  '🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎',
  '✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕',
  '💞','💓','💗','💖','💘','💝','🔥','⭐','🎉','🎊',
  '🎁','🎈','✨','💫','🌟','⚡','💥','💢','💯','🏆',
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Smile size={20} />
      </button>

      {isOpen && (
        <>
          {/* Fond transparent pour fermer */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panneau d'emojis */}
          <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-72 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelect(emoji)
                    setIsOpen(false)
                  }}
                  className="p-1.5 text-xl hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}