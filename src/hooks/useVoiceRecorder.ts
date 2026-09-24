'use client'

import { useState, useRef } from 'react'

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Détection du meilleur format audio supporté par le téléphone (iOS/Android)
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
    ]
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()

      const options = mimeType ? { mimeType } : undefined
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start(100) // Récupère des données toutes les 100ms
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Erreur accès micro:', err)
      alert('Veuillez autoriser l\'accès au microphone dans votre navigateur.')
    }
  }

  const stopRecording = (): Promise<{ blob: Blob; duration: number; mimeType: string }> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/mp4'

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mimeType })
          setAudioBlob(blob)
          if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
          }
          resolve({ blob, duration: recordingTime, mimeType })
        }

        mediaRecorderRef.current.stop()
        if (timerRef.current) clearInterval(timerRef.current)
        setIsRecording(false)
      } else {
        resolve({ blob: new Blob(), duration: 0, mimeType: '' })
      }
    })
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setRecordingTime(0)
    setAudioBlob(null)
  }

  return {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}