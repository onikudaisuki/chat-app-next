// src/pages/login.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/chat') // ログイン成功 → チャットページへ
    }
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>ログイン</h1>

      <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>メールアドレス</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.5rem', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>パスワード</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.5rem', width: '100%' }}
        />
      </div>

      <button onClick={handleLogin} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>ログイン</button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  )
}
