import { useState, useEffect, useRef } from 'react'
import { 
  Bell, 
  CheckCircle, 
  X, 
  Package, 
  Clock,
  AlertCircle,
  Info
} from 'lucide-react'
import api from '../api/axios.js'
import { useToast } from '../context/ToastContext.jsx'

export default function PatientPrescriptionNotifications({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const previousStatusesRef = useRef({})
  const { showInfo } = useToast()

  const getPrescriptionMessage = (prescription) => {
    if (prescription.status === 'filled') {
      const pharmacyName = prescription.pharmacyId?.pharmacyName || 'Votre pharmacie'
      const notes = prescription.pharmacy?.notes || ''
      return `✅ Votre ordonnance (${prescription.prescriptionCode}) est prête à être récupérée à ${pharmacyName}.${notes ? '\n\n' + notes : ''}`
    }
    switch (prescription.status) {
      case 'sent_by_doctor':
        return `Votre médecin a envoyé une nouvelle ordonnance à votre pharmacie.`
      case 'pending':
        return `Votre pharmacie prépare actuellement vos médicaments.`
      case 'completed':
        return `🎉 Vos médicaments sont prêts ! Vous pouvez les récupérer à la pharmacie.`
      case 'cancelled':
        return `Votre ordonnance a été annulée. Contactez votre médecin si nécessaire.`
      default:
        return `Mise à jour de votre ordonnance.`
    }
  }

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Charger les ordonnances depuis l'API backend
        const response = await api.get('/api/prescriptions')
        const allPrescriptions = response.data.prescriptions || response.data || []
        
        // Filtrer les ordonnances du patient
        const patientPrescriptions = allPrescriptions.filter(p => 
          p.patientId?.userId?._id?.toString() === userId?.toString() ||
          p.patientId?.userId?.toString() === userId?.toString() ||
          p.patientId?._id?.toString() === userId?.toString()
        )

        // Créer des notifications pour les changements de statut
        const newNotifications = []
        const currentStatuses = {}
        
        patientPrescriptions.forEach(prescription => {
          const prescId = prescription._id.toString()
          currentStatuses[prescId] = prescription.status
          
          // Si le statut a changé vers "filled", créer une notification
          if (prescription.status === 'filled' && previousStatusesRef.current[prescId] !== 'filled') {
            const notificationMessage = getPrescriptionMessage(prescription)
            
            // Afficher une notification toast visible
            showInfo(notificationMessage, 8000)
            
            newNotifications.push({
              id: `notif_${prescId}_${Date.now()}`,
              type: 'prescription_ready',
              title: 'Vos médicaments sont prêts !',
              message: notificationMessage,
              timestamp: prescription.pharmacy?.filledAt || prescription.updatedAt || prescription.createdAt,
              isRead: false,
              prescriptionId: prescription._id,
              status: prescription.status,
              pharmacy: prescription.pharmacyId,
              notes: prescription.pharmacy?.notes
            })
          }
        })
        
        previousStatusesRef.current = currentStatuses
        
        // Ajouter les nouvelles notifications aux existantes
        if (newNotifications.length > 0) {
          setNotifications(prev => {
            const combined = [...prev, ...newNotifications]
            // Garder seulement les 20 dernières notifications
            return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20)
          })
          
          setUnreadCount(prev => prev + newNotifications.length)
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    loadNotifications()
    
    // Rafraîchir toutes les 30 secondes pour détecter les nouveaux changements
    const interval = setInterval(loadNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [userId])

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
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

  const getNotificationIcon = (type, status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Package className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'cancelled':
        return 'bg-red-50 border-red-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse ring-2 ring-red-300 shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {notifications
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${getNotificationColor(notification.status)} ${
                        !notification.isRead ? 'ring-4 ring-primary-300 shadow-lg animate-pulse' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700 mt-1">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
