'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Mic } from 'lucide-react'

interface VoicePlayerProps {
  audioUrl: string
  duration?: number | null
  isOwn: boolean
}

export default function VoicePlayer({ audioUrl, duration = 0, isOwn }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
        setCurrentTime(audio.currentTime)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[200px] max-w-[260px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Bouton Play / Pause */}
      <button
        onClick={togglePlay}
        className={`p-2.5 rounded-full transition-transform active:scale-95 shrink-0 ${
          isOwn
            ? 'bg-white text-primary-600 shadow-sm'
            : 'bg-primary-500 text-white'
        }`}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </button>

      {/* Onde audio / Barre de progression */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="relative w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              isOwn ? 'bg-white' : 'bg-primary-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] opacity-80 font-medium">
          <span className="flex items-center gap-1">
            <Mic size={10} /> Vocal
          </span>
          <span>
            {isPlaying ? formatTime(currentTime) : formatTime(duration || 0)}
          </span>
        </div>
      </div>
    </div>
  )
}