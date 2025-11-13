import { useState, useEffect } from 'react'
import { Send, MessageCircle, User, Clock } from 'lucide-react'
import api from '../api/axios.js'

export default function Messaging({ userId, userType }) {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/api/messages/conversations')
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadMessages = async (otherUserId) => {
    try {
      const { data } = await api.get(`/api/messages?conversationId=${otherUserId}`)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setIsLoading(true)
      await api.post('/api/messages', {
        receiverId: selectedConversation.userId,
        content: newMessage.trim()
      })
      
      setNewMessage('')
      // Reload messages to show the new one
      loadMessages(selectedConversation.userId)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-secondary-200 bg-secondary-50">
          <div className="p-4 border-b border-secondary-200">
            <h3 className="font-semibold text-secondary-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Messages
            </h3>
          </div>
          
          <div className="overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-secondary-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-secondary-400" />
                <p className="text-sm">Aucune conversation</p>
              </div>
            ) : (
              conversations.map(conversation => (
                <button
                  key={conversation.userId}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 text-left border-b border-secondary-200 hover:bg-white transition-colors ${
                    selectedConversation?.userId === conversation.userId ? 'bg-white border-r-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 truncate">
                        Utilisateur {conversation.userId}
                      </p>
                      <p className="text-sm text-secondary-500 truncate">
                        {conversation.lastMessage?.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-secondary-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">
                      Utilisateur {selectedConversation.userId}
                    </p>
                    <p className="text-sm text-secondary-500">En ligne</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-secondary-500 py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-secondary-400" />
                    <p className="text-sm">Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === userId
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 text-secondary-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === userId ? 'text-primary-100' : 'text-secondary-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-secondary-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 input"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="btn btn-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-secondary-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-secondary-400" />
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
