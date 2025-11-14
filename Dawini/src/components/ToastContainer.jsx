import { MessageSquare, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

const Toast = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case 'message':
        return <MessageSquare className="w-6 h-6 text-blue-600" />
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-600" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900 shadow-green-200'
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-900 shadow-red-200'
      case 'message':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400 text-blue-900 shadow-blue-300 ring-2 ring-blue-200'
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-300 text-blue-900 shadow-blue-200'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] max-w-md w-full ${getStyles()} rounded-2xl shadow-2xl border-2 p-5 transform transition-all duration-500 mb-3 animate-bounce-in`}
      style={{ 
        animation: 'slideInRight 0.5s ease-out, pulse 2s ease-in-out infinite',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 animate-pulse">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold leading-tight break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200 p-1 hover:bg-white/50 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-0 right-0 z-[9999] p-4 pointer-events-none">
      <div className="flex flex-col items-end space-y-3">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              animationDelay: `${index * 0.1}s`,
              transform: `translateY(${index * 10}px)`
            }}
          >
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}

