import { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Pill,
  MapPin,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react'

export default function PatientNotifications({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock notifications data
  const mockNotifications = [
    {
      _id: 'notif1',
      type: 'prescription_ready',
      title: 'Vos médicaments sont prêts !',
      message: 'Votre ordonnance a été préparée par la Pharmacie du Centre. Vous pouvez venir les récupérer.',
      pharmacy: {
        name: 'Pharmacie du Centre',
        address: '123 Rue de la Santé, Alger Centre',
        phone: '+213 555 123 456'
      },
      prescription: {
        id: 'pres_001',
        medications: ['Aspirine 100mg', 'Atorvastatine 20mg'],
        doctor: 'Dr. Sarah Khelil'
      },
      createdAt: new Date().toISOString(),
      isRead: false,
      priority: 'high'
    },
    {
      _id: 'notif2',
      type: 'prescription_sent',
      title: 'Ordonnance envoyée à votre pharmacie',
      message: 'Dr. Sarah Khelil a envoyé votre ordonnance à la Pharmacie du Centre.',
      pharmacy: {
        name: 'Pharmacie du Centre',
        address: '123 Rue de la Santé, Alger Centre',
        phone: '+213 555 123 456'
      },
      prescription: {
        id: 'pres_001',
        medications: ['Aspirine 100mg', 'Atorvastatine 20mg'],
        doctor: 'Dr. Sarah Khelil'
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
      priority: 'normal'
    },
    {
      _id: 'notif3',
      type: 'appointment_reminder',
      title: 'Rappel de rendez-vous',
      message: 'Vous avez un rendez-vous demain à 14h00 avec Dr. Mohamed Amine.',
      appointment: {
        date: '2024-01-15',
        time: '14:00',
        doctor: 'Dr. Mohamed Amine',
        reason: 'Consultation de suivi'
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRead: false,
      priority: 'medium'
    }
  ]

  useEffect(() => {
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length)
  }, [])

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId) => {
    const notification = notifications.find(n => n._id === notificationId)
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifications(prev => prev.filter(n => n._id !== notificationId))
  }

  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-6 h-6 ${
      priority === 'high' ? 'text-red-600' :
      priority === 'medium' ? 'text-yellow-600' :
      'text-blue-600'
    }`

    switch (type) {
      case 'prescription_ready':
        return <CheckCircle className={iconClass} />
      case 'prescription_sent':
        return <FileText className={iconClass} />
      case 'appointment_reminder':
        return <Clock className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'À l\'instant'
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-100 hover:text-white transition-colors"
                  >
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-primary-100 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {/* Additional Info */}
                            {notification.type === 'prescription_ready' && notification.pharmacy && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin className="w-4 h-4 text-green-600" />
                                  <span className="font-medium text-gray-900">{notification.pharmacy.name}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{notification.pharmacy.address}</p>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">{notification.pharmacy.phone}</span>
                                </div>
                                
                                {notification.prescription && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <h5 className="font-medium text-gray-900 mb-2">Médicaments préparés :</h5>
                                    <div className="space-y-1">
                                      {notification.prescription.medications.map((med, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <Pill className="w-3 h-3 text-primary-600" />
                                          <span className="text-sm text-gray-700">{med}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {notification.type === 'prescription_sent' && notification.pharmacy && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Pharmacie :</strong> {notification.pharmacy.name}
                                </p>
                                <p className="text-sm text-blue-700">
                                  <strong>Médecin :</strong> {notification.prescription?.doctor}
                                </p>
                              </div>
                            )}
                            
                            {notification.type === 'appointment_reminder' && notification.appointment && (
                              <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  <strong>Date :</strong> {new Date(notification.appointment.date).toLocaleDateString('fr-FR')} à {notification.appointment.time}
                                </p>
                                <p className="text-sm text-yellow-700">
                                  <strong>Médecin :</strong> {notification.appointment.doctor}
                                </p>
                                <p className="text-sm text-yellow-700">
                                  <strong>Motif :</strong> {notification.appointment.reason}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Marquer comme lu"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Supprimer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
