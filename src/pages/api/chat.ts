// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const openaiApiKey = process.env.OPENAI_API_KEY!
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ 405 対応：POSTメソッド以外は拒否
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { message, model = 'gpt-3.5-turbo', user_id } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    // ✅ OpenAI 呼び出し
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }]
      })
    })

    const gptData = await gptRes.json()

    if (!gptRes.ok) {
      console.error('OpenAI API error:', gptData)
      return res.status(500).json({ error: 'OpenAI API error' })
    }

    const reply = gptData.choices?.[0]?.message?.content?.trim() || 'No response from OpenAI'

    // ✅ Supabase にログ保存
    const { error: insertError } = await supabase.from('messages').insert([
      { role: 'user', message, model, user_id },
      { role: 'bot', message: reply, model, user_id }
    ])

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return res.status(500).json({ error: 'Failed to save messages' })
    }

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
