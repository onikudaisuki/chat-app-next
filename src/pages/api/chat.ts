// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const openaiApiKey = process.env.OPENAI_API_KEY!
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { message, model, user_id } = req.body

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }]
      })
    })

    const gptData = await gptRes.json()
    const reply = gptData.choices?.[0]?.message?.content?.trim() || 'No response from OpenAI'

    await supabase.from('messages').insert([
      { role: 'user', message, model, user_id },
      { role: 'bot', message: reply, model, user_id }
    ])

    res.status(200).json({ reply })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
}
