import { MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="text-white" size={18} />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">ChatApp</span>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} ChatApp. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}