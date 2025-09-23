import { Bell, MessageSquare } from 'lucide-react'

export default function NotificationBadge({ 
  count, 
  type = 'message', 
  size = 'md',
  showZero = false,
  className = ''
}) {
  if (count === 0 && !showZero) return null

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  }

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {type === 'message' ? (
        <MessageSquare className={`${iconSizeClasses[size]} text-gray-600`} />
      ) : (
        <Bell className={`${iconSizeClasses[size]} text-gray-600`} />
      )}
      
      {count > 0 && (
        <span className={`
          absolute -top-2 -right-2 
          ${badgeSizeClasses[size]}
          bg-red-500 text-white 
          rounded-full 
          flex items-center justify-center 
          font-bold
          animate-pulse
          shadow-lg
          border-2 border-white
        `}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}
