import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning', // 'info', 'success', 'warning', 'error'
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false
}) {
  if (!isOpen) return null

  const typeClasses = {
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      confirmButtonClass: 'bg-blue-600 hover:bg-blue-700'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      confirmButtonClass: 'bg-green-600 hover:bg-green-700'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700'
    },
    error: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700'
    }
  }

  const { icon: Icon, iconColor, confirmButtonClass } = typeClasses[type]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Icon className={`w-6 h-6 mr-3 ${iconColor}`} />
            <h3 className="text-lg font-semibold text-secondary-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-secondary-600 mb-6">
          {message}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 font-semibold disabled:opacity-50 ${confirmButtonClass}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                Traitement...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}