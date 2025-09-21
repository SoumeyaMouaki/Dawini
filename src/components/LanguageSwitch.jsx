import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LanguageSwitch() {
  const { i18n } = useTranslation()
  const toggle = () => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en')
  
  return (
    <button 
      onClick={toggle} 
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
      title={`Changer la langue - ${i18n.language === 'en' ? 'Switch to French' : 'Switch to English'}`}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {i18n.language === 'en' ? 'FR' : 'EN'}
      </span>
    </button>
  )
}
