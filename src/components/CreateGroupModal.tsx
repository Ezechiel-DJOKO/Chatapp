'use client'

import React, { useState, useEffect } from 'react'
import { User } from '@/types'
import { X, Search, Check, Users, Plus } from 'lucide-react'
import UserAvatar from './UserAvatar'
import { useSocket } from '@/context/SocketContext'
import toast from 'react-hot-toast'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: (groupId: string) => void
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
}: CreateGroupModalProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { onlineUsers, socket } = useSocket()

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      setStep(1)
      setName('')
      setDescription('')
      setSelectedUsers([])
      setSearch('')
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) fetchUsers()
  }, [search])

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(search)}`
      )
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const createGroup = async () => {
    if (!name.trim()) {
      toast.error('Le nom du groupe est requis')
      return
    }
    if (selectedUsers.length === 0) {
      toast.error('Ajoutez au moins un membre')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          memberIds: selectedUsers,
        }),
      })
      const data = await res.json()
      if (data.group) {
        socket?.emit('group:created', {
          ...data.group,
          members: selectedUsers,
        })
        onGroupCreated(data.group.id)
        toast.success('Groupe créé avec succès !')
        onClose()
      }
    } catch {
      toast.error('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === 1 ? 'Créer un groupe' : 'Ajouter des membres'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          /* ÉTAPE 1 : Infos du groupe */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Users size={32} className="text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du groupe *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Famille, Travail, Amis..."
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du groupe..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant →
            </button>
          </div>
        ) : (
          /* ÉTAPE 2 : Sélection des membres */
          <>
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
              </div>

              {/* Tags des utilisateurs sélectionnés */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedUsers.map((uid) => {
                    const u = users.find((u) => u.id === uid)
                    return u ? (
                      <span
                        key={uid}
                        onClick={() => toggleUser(uid)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs cursor-pointer hover:bg-primary-200"
                      >
                        {u.username}
                        <X size={12} />
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>

            {/* Liste des utilisateurs */}
            <div className="flex-1 overflow-y-auto px-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <UserAvatar
                    src={u.avatar}
                    username={u.username}
                    isOnline={onlineUsers.includes(u.id)}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 text-sm">
                      {u.username}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedUsers.includes(u.id)
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedUsers.includes(u.id) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Boutons */}
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={createGroup}
                disabled={loading || selectedUsers.length === 0}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Plus size={18} />
                    Créer ({selectedUsers.length})
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}