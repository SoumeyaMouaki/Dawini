import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { MessageSquare, Send, Search } from 'lucide-react'

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeUserId, setActiveUserId] = useState('')
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (activeUserId) fetchMessages(activeUserId)
  }, [activeUserId])

  const fetchConversations = async () => {
    const { data } = await api.get('/api/messages/conversations')
    setConversations(data.conversations || [])
  }

  const fetchMessages = async (otherUserId) => {
    const { data } = await api.get('/api/messages')
    const thread = (data.messages || []).filter(m => m.senderId === otherUserId || m.receiverId === otherUserId || m.senderId === user.id || m.receiverId === user.id)
    setMessages(thread.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)))
  }

  const sendMessage = async () => {
    if (!content.trim() || !activeUserId) return
    await api.post('/api/messages', { receiverId: activeUserId, content })
    setContent('')
    fetchMessages(activeUserId)
  }

  const filteredConvos = conversations.filter(c => (c.userId || '').toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Conversations</h2>
            <MessageSquare className="w-5 h-5 text-primary-600" />
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <input className="input pl-9" placeholder="Rechercher..." value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {filteredConvos.map(c => (
              <button key={c.userId} onClick={() => setActiveUserId(c.userId)} className={`w-full text-left p-3 rounded-lg border ${activeUserId === c.userId ? 'border-primary-300 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-secondary-900">{c.userId}</div>
                  {c.unreadCount > 0 && (
                    <span className="badge badge-primary">{c.unreadCount}</span>
                  )}
                </div>
                <div className="text-xs text-secondary-500 truncate">{c.lastMessage?.content}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card md:col-span-2">
          {activeUserId ? (
            <div className="flex flex-col h-[70vh]">
              <div className="flex-1 overflow-auto space-y-2 mb-4">
                {messages.map((m, idx) => (
                  <div key={idx} className={`max-w-[80%] p-3 rounded-lg ${m.senderId === user.id ? 'ml-auto bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-900'}`}>
                    <div className="text-sm">{m.content}</div>
                    <div className="text-xs opacity-70 mt-1">{new Date(m.createdAt).toLocaleString('fr-FR')}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Votre message..." value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage() }} />
                <button onClick={sendMessage} className="btn"><Send className="w-4 h-4 mr-2" />Envoyer</button>
              </div>
            </div>
          ) : (
            <div className="h-[70vh] flex items-center justify-center text-secondary-500">Sélectionnez une conversation</div>
          )}
        </div>
      </div>
    </div>
  )
}


