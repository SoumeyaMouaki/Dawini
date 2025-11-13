import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react'

const Toast = ({ 
  type = 'success', 
  message, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-green-50 border-green-200 text-green-800'
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-lg border p-4 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose?.(), 300)
            }}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast
