// src/pages/chat.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/router'

export default function ChatPage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: string; message: string }[]>([])
  const [model, setModel] = useState('gpt-3.5-turbo')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
    }
    checkAuth()
  }, [router])

  const handleSend = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!message.trim() || !user) return

    const newMessages = [...messages, { role: 'user', message }]
    setMessages(newMessages)
    setMessage('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, user_id: user.id })
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('API error:', text)
        throw new Error(`HTTP ${res.status}: ${text}`)
      }

      const data = await res.json()
      setMessages([...newMessages, { role: 'bot', message: data.reply || 'エラーです' }])
    } catch (err) {
      console.error('fetch error:', err)
      setMessages([...newMessages, { role: 'bot', message: 'サーバーエラーが発生しました。' }])
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Chat with GPT 🤖</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="model"
            value="gpt-3.5-turbo"
            checked={model === 'gpt-3.5-turbo'}
            onChange={() => setModel('gpt-3.5-turbo')}
          />
          GPT-3.5
        </label>
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="radio"
            name="model"
            value="gpt-4"
            checked={model === 'gpt-4'}
            onChange={() => setModel('gpt-4')}
          />
          GPT-4
        </label>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', minHeight: '300px' }}>
        {messages.map((m, i) => (
          <p key={i}><strong>{m.role}:</strong> {m.message}</p>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力"
          style={{ padding: '0.5rem', width: '80%' }}
        />
        <button onClick={handleSend} style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>送信</button>
      </div>
    </div>
  )
}
