import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, MessageSquare, Check, CheckCheck, Clock } from 'lucide-react'
import api from '../api/axios.js'
import NotificationBadge from './NotificationBadge.jsx'
import { messageRateLimiter, makeRateLimitedRequest } from '../utils/rateLimiter.js'

export default function ChatSystem({ 
  currentUser, 
  selectedConversation, 
  onConversationSelect,
  onUnreadCountChange
}) {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [unreadCounts, setUnreadCounts] = useState({})
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/api/messages/conversations')
        const conversationsData = response.data.conversations || []
        setConversations(conversationsData)
        
        // Calculate unread counts for each conversation
        const counts = {}
        for (const conversation of conversationsData) {
          try {
            const messagesResponse = await api.get(`/api/messages/${conversation._id}`)
            const conversationMessages = messagesResponse.data.messages || []
            const unreadCount = conversationMessages.filter(msg => 
              msg.senderId._id !== currentUser._id && 
              msg.senderId._id !== currentUser.id &&
              !msg.readBy?.some(read => read.userId === currentUser._id || read.userId === currentUser.id)
            ).length
            counts[conversation._id] = unreadCount
          } catch (error) {
            console.error('Error loading messages for conversation:', conversation._id, error)
            counts[conversation._id] = 0
          }
        }
        setUnreadCounts(counts)
        
        // Calculate total unread count
        const totalUnread = Object.values(counts).reduce((sum, count) => sum + count, 0)
        if (onUnreadCountChange) {
          onUnreadCountChange(totalUnread)
        }
        
        // Select first conversation if none selected
        if (!selectedConversation && conversationsData.length > 0) {
          onConversationSelect(conversationsData[0])
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
        setError('Erreur lors du chargement des conversations')
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUser) {
      loadConversations()
    }
  }, [currentUser, onConversationSelect, selectedConversation])

  // Load messages for selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return

      try {
        const response = await api.get(`/api/messages/${selectedConversation._id}`)
        setMessages(response.data.messages || [])
        
        // Mark conversation as read when messages are loaded
        markConversationAsRead(selectedConversation._id)
      } catch (error) {
        console.error('Error loading messages:', error)
        setError('Erreur lors du chargement des messages')
      }
    }

    loadMessages()
  }, [selectedConversation])

  // Mark conversation as read
  const markConversationAsRead = async (conversationId) => {
    try {
      // Get messages for this conversation
      const response = await api.get(`/api/messages/${conversationId}`)
      const messages = response.data.messages || []
      
      // Mark all unread messages as read
      const unreadMessages = messages.filter(msg => {
        const isFromOtherUser = msg.senderId._id !== currentUser._id && 
                               msg.senderId._id !== currentUser.id
        const isNotRead = !msg.readBy?.some(read => 
          read.userId === currentUser._id || read.userId === currentUser.id
        )
        return isFromOtherUser && isNotRead
      })

      // Mark each unread message as read
      for (const message of unreadMessages) {
        try {
          await api.put(`/api/messages/${message._id}/read`)
        } catch (error) {
          console.error('Error marking message as read:', error)
        }
      }

      // Update local unread counts
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }))
      
      // Update total unread count
      const newTotal = Object.values({
        ...unreadCounts,
        [conversationId]: 0
      }).reduce((sum, count) => sum + count, 0)
      
      if (onUnreadCountChange) {
        onUnreadCountChange(newTotal)
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-refresh messages every 30 seconds (reduced frequency)
  useEffect(() => {
    if (!selectedConversation) return

    const interval = setInterval(async () => {
      try {
        const response = await makeRateLimitedRequest(
          messageRateLimiter,
          () => api.get(`/api/messages/${selectedConversation._id}`)
        )
        setMessages(response.data.messages || [])
      } catch (error) {
        console.error('Error refreshing messages:', error)
        // Stop refreshing on error to prevent spam
        clearInterval(interval)
      }
    }, 30000) // Increased from 5s to 30s

    return () => clearInterval(interval)
  }, [selectedConversation])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || isSending) return

    try {
      setIsSending(true)
      setError('')

      const response = await api.post('/api/messages', {
        conversationId: selectedConversation._id,
        content: newMessage.trim(),
        type: 'text'
      })

      // Add message to local state
      setMessages(prev => [...prev, response.data.message])
      setNewMessage('')

      // Update conversation in list
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, lastMessage: response.data.message, updatedAt: new Date() }
            : conv
        )
      )

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Erreur lors de l\'envoi du message')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }
  }

  const getOtherParticipant = (conversation) => {
    if (!conversation) return null
    
    if (conversation.patient) return conversation.patient
    if (conversation.doctor) return conversation.doctor
    if (conversation.pharmacist) return conversation.pharmacist
    
    return null
  }

  const getParticipantName = (conversation) => {
    const participant = getOtherParticipant(conversation)
    if (!participant) return 'Utilisateur inconnu'
    
    return participant.userId?.fullName || 'Utilisateur'
  }

  const getParticipantType = (conversation) => {
    if (conversation.patient) return 'Patient'
    if (conversation.doctor) return 'Médecin'
    if (conversation.pharmacist) return 'Pharmacien'
    return 'Utilisateur'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Aucune conversation</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(conversation => (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 group ${
                    selectedConversation?._id === conversation._id 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 shadow-sm' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                      unreadCounts[conversation._id] > 0 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <span className={`font-bold text-sm ${
                        unreadCounts[conversation._id] > 0 
                          ? 'text-white' 
                          : 'text-gray-600'
                      }`}>
                        {getParticipantName(conversation).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getParticipantName(conversation)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">
                            {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                          </p>
                          {unreadCounts[conversation._id] > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse shadow-lg">
                              {unreadCounts[conversation._id] > 99 ? '99+' : unreadCounts[conversation._id]}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {getParticipantType(conversation)}
                      </p>
                      {conversation.lastMessage && (
                        <p className={`text-xs truncate mt-1 ${
                          unreadCounts[conversation._id] > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {getParticipantName(selectedConversation).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {getParticipantName(selectedConversation)}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {getParticipantType(selectedConversation)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Aucun message dans cette conversation</p>
                  <p className="text-sm">Envoyez le premier message !</p>
                </div>
              ) : (
                messages.map(message => {
                  const isCurrentUser = message.senderId._id === currentUser._id || message.senderId._id === currentUser.id;
                  const senderName = message.senderId?.fullName || 'Utilisateur inconnu';
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                        {!isCurrentUser && (
                          <p className="text-xs text-gray-500 mb-1 px-2">{senderName}</p>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className={`flex items-center justify-between mt-2 ${
                            isCurrentUser
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatTime(message.createdAt)}
                            </span>
                            {isCurrentUser && (
                              <div className="flex items-center space-x-1">
                                {message.status === 'read' ? (
                                  <CheckCheck className="w-3 h-3 text-blue-200" />
                                ) : message.status === 'delivered' ? (
                                  <CheckCheck className="w-3 h-3 text-blue-200" />
                                ) : (
                                  <Check className="w-3 h-3 text-blue-200" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    disabled={isSending}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}