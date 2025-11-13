import { useState, useRef } from 'react'
import { Camera, Upload, X, User, AlertTriangle, CheckCircle } from 'lucide-react'
import api from '../api/axios.js'
import ConfirmModal from './ConfirmModal.jsx'

export default function ProfilePictureUpload({ 
  currentImage, 
  onImageChange, 
  userId, 
  userType = 'patient',
  size = 'lg' 
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const fileInputRef = useRef(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La taille du fichier ne doit pas dépasser 5MB')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      // Create preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('profilePicture', file)
      formData.append('userId', userId)
      formData.append('userType', userType)

      const response = await api.post('/api/users/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        onImageChange(response.data.imageUrl)
        setPreview(response.data.imageUrl)
        setSuccess('Photo de profil mise à jour avec succès !')
        setError('')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      }

    } catch (error) {
      console.error('Error uploading profile picture:', error)
      
      // Provide more specific error messages
      if (error.response?.status === 403) {
        setError('Vous n\'êtes pas autorisé à modifier cette photo de profil')
      } else if (error.response?.status === 413) {
        setError('L\'image est trop volumineuse. Veuillez choisir une image plus petite.')
      } else if (error.response?.status === 400) {
        setError('Format d\'image non supporté. Veuillez choisir une image JPG, PNG ou GIF.')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Problème de connexion. Veuillez vérifier votre connexion internet.')
      } else {
        setError('Erreur lors de l\'upload de l\'image. Veuillez réessayer.')
      }
      setSuccess('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      // Try to delete from server first
      await api.delete(`/api/users/profile-picture/${userId}`)
      setPreview(null)
      onImageChange(null)
      setSuccess('Photo de profil supprimée avec succès !')
      setError('')
      setShowDeleteModal(false)
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error removing profile picture:', error)
      
      // If server deletion fails, still remove locally
      if (error.response?.status === 403 || error.response?.status === 404) {
        // Server doesn't support deletion or user not authorized
        // Remove locally anyway
        setPreview(null)
        onImageChange(null)
        setSuccess('Photo de profil supprimée localement !')
        setError('')
        setShowDeleteModal(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        // Other errors (network, etc.)
        setError('Erreur lors de la suppression. Veuillez réessayer.')
        setShowDeleteModal(false)
      }
    }
  }

  const confirmDelete = () => {
    setShowDeleteModal(true)
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className={`${sizeClasses[size]} relative group`}>
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        )}

        {/* Overlay on hover with camera icon */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
          <Camera className="w-6 h-6 text-white" />
        </div>

        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={openFileDialog}
          disabled={isUploading}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Upload className="w-4 h-4" />
          <span>{preview ? 'Changer' : 'Ajouter'}</span>
        </button>

        {preview && (
          <button
            onClick={confirmDelete}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={handleRemoveImage}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer votre photo de profil ? Cette action est irréversible."
        type="warning"
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  )
}
