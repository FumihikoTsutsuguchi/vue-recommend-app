import 'dotenv/config'
import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const app = express()
app.use(express.json())

const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

console.log('KEY?', process.env.GEMINI_API_KEY?.slice(0, 6))

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
app.post('/api/recipes', async (req, res) => {
  try {
    const { likedFoods, limit = 3 } = req.body
    const prompt = `
あなたは料理研究家です。
以下の単語はユーザーが好む料理ジャンルです: ${likedFoods.join('、')}
これらの好みを考慮して、日本語タイトルでレシピを${limit}件だけ箇条書きで提案してください。
    `.trim()

    const result = await model.generateContent(prompt)
    const text   = result.response.text()
    const recipes = text
      .split('\n')
      .map((s) => s.replace(/^[-*\d.]+\s*/, '').trim())
      .filter(Boolean)
      .slice(0, limit)

    return res.json({ recipes })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Gemini API error' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log('API server on', PORT))
