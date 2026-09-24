'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { MessageCircle, Moon, Sun, LogIn, UserPlus } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  // Si l'utilisateur est déjà connecté, on l'envoie direct sur le chat
  useEffect(() => {
    if (!loading && user) {
      router.replace('/chat')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors p-4 relative">
      
      {/* Bouton Mode Sombre (Haut Droite) */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Carte Centrale Minimaliste */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center animate-fade-in">
        
        {/* Logo */}
        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <MessageCircle className="text-primary-500 w-10 h-10" />
        </div>

        {/* Textes */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Espace Privé
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm px-4">
          Réseau de messagerie restreint. Veuillez vous identifier pour accéder aux discussions.
        </p>

        {/* Boutons */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            <LogIn size={18} />
            Se connecter
          </Link>
          
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UserPlus size={18} />
            Créer un compte
          </Link>
        </div>
      </div>
      
      {/* Footer très discret */}
      <p className="absolute bottom-6 text-xs text-gray-400 dark:text-gray-600">
        Accès strictement réservé aux membres.
      </p>
    </div>
  )
}