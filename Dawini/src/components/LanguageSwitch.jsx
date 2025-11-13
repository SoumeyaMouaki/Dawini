import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'

export default function LanguageSwitch() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇩🇿' }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
        title="Changer la langue"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                i18n.language === lang.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
              } ${lang.code === languages[0].code ? 'rounded-t-lg' : ''} ${
                lang.code === languages[languages.length - 1].code ? 'rounded-b-lg' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="ml-auto text-primary-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
