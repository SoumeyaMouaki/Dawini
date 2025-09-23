import { useState, useRef } from 'react'
import { Camera, Upload, X, User } from 'lucide-react'
import api from '../api/axios.js'

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
      // Create preview
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
      }

    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setError('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      await api.delete(`/api/users/profile-picture/${userId}`)
      setPreview(null)
      onImageChange(null)
    } catch (error) {
      console.error('Error removing profile picture:', error)
      setError('Erreur lors de la suppression de l\'image')
    }
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

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
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
    </div>
  )
}
