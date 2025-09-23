import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios.js'
import { unreadCountRateLimiter, makeRateLimitedRequest } from '../utils/rateLimiter.js'

export function useUnreadMessages(currentUser) {
  const [unreadCounts, setUnreadCounts] = useState({})
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadUnreadCounts = useCallback(async () => {
    if (!currentUser) {
      setUnreadCounts({})
      setTotalUnreadCount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // Use rate limiter to prevent too many requests
      const conversationsResponse = await makeRateLimitedRequest(
        unreadCountRateLimiter,
        () => api.get('/api/messages/conversations')
      )
      const conversations = conversationsResponse.data.conversations || []
      
      const counts = {}
      let totalUnread = 0

      // Calculate unread counts for each conversation
      for (const conversation of conversations) {
        try {
          const messagesResponse = await makeRateLimitedRequest(
            unreadCountRateLimiter,
            () => api.get(`/api/messages/${conversation._id}`)
          )
          const messages = messagesResponse.data.messages || []
          
          const unreadCount = messages.filter(msg => {
            const isFromOtherUser = msg.senderId._id !== currentUser._id && 
                                   msg.senderId._id !== currentUser.id
            const isNotRead = !msg.readBy?.some(read => 
              read.userId === currentUser._id || read.userId === currentUser.id
            )
            return isFromOtherUser && isNotRead
          }).length

          counts[conversation._id] = unreadCount
          totalUnread += unreadCount
        } catch (error) {
          console.error('Error loading unread count for conversation:', conversation._id, error)
          counts[conversation._id] = 0
        }
      }

      setUnreadCounts(counts)
      setTotalUnreadCount(totalUnread)
    } catch (error) {
      console.error('Error loading unread counts:', error)
      setUnreadCounts({})
      setTotalUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  // Load unread counts on mount and when user changes
  useEffect(() => {
    loadUnreadCounts()
  }, [loadUnreadCounts])

  // Auto-refresh every 60 seconds (reduced frequency)
  useEffect(() => {
    if (!currentUser) return

    const interval = setInterval(() => {
      loadUnreadCounts()
    }, 60000) // Increased from 10s to 60s

    return () => clearInterval(interval)
  }, [currentUser, loadUnreadCounts])

  const markAsRead = useCallback(async (conversationId) => {
    try {
      // Get messages for this conversation
      const messagesResponse = await api.get(`/api/messages/${conversationId}`)
      const messages = messagesResponse.data.messages || []
      
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

      // Update local state
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }))
      
      // Recalculate total
      const newTotal = Object.values({
        ...unreadCounts,
        [conversationId]: 0
      }).reduce((sum, count) => sum + count, 0)
      setTotalUnreadCount(newTotal)
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }, [currentUser, unreadCounts])

  const refreshUnreadCounts = useCallback(() => {
    loadUnreadCounts()
  }, [loadUnreadCounts])

  return {
    unreadCounts,
    totalUnreadCount,
    isLoading,
    markAsRead,
    refreshUnreadCounts
  }
}
