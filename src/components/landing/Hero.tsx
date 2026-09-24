'use client'

import Link from 'next/link'
import { ArrowRight, MessageSquare, Users, Shield, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Hero() {
  const { user } = useAuth()

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 dark:bg-primary-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium text-sm mb-8 border border-primary-100 dark:border-primary-800/50">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          Version 2.0 est disponible
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
          La messagerie qui vous <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-500">
            rapproche de l'essentiel
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
          Discutez en temps réel, créez des groupes, partagez des fichiers et exprimez-vous avec vos amis et collègues. Le tout dans une interface simple et sécurisée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={user ? "/chat" : "/register"}
            className="w-full sm:w-auto px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 text-lg transform hover:-translate-y-1"
          >
            {user ? 'Aller aux messages' : 'Commencer gratuitement'}
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Stats / Trust */}
        <div className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center gap-2">
            <Zap className="text-amber-500" size={28} />
            <span className="font-semibold text-gray-900 dark:text-white">Temps réel</span>
            <span className="text-sm text-gray-500">Zéro latence</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="text-emerald-500" size={28} />
            <span className="font-semibold text-gray-900 dark:text-white">Sécurisé</span>
            <span className="text-sm text-gray-500">Données protégées</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="text-primary-500" size={28} />
            <span className="font-semibold text-gray-900 dark:text-white">Groupes</span>
            <span className="text-sm text-gray-500">Illimités</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MessageSquare className="text-purple-500" size={28} />
            <span className="font-semibold text-gray-900 dark:text-white">Intuitif</span>
            <span className="text-sm text-gray-500">Design moderne</span>
          </div>
        </div>
      </div>
    </div>
  )
}