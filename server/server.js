import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import retry from 'async-retry'
import OpenAI from 'openai'

const app = express()
app.use(cors())
app.use(express.json())
console.log(process.env.OPENAI_API_KEY?.slice(0, 6))

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
const MODEL_ID = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

const buildPrompt = (foods, limit) =>
  `
あなたは料理研究家です。
ユーザーが好む料理ジャンル: 【${foods.join('、')}】
ユーザーが好む料理ジャンルを参考に、おすすめのレシピのタイトルとURLを出力してください。

[出力形式]
必ず **JSON 配列** で、要素は ${limit} 件ちょうど。
各要素は
  { "title": "<レシピ名>", "url": "<実在するレシピページ URL>" }
のみを含めてください。
日本語のレシピに限定し、そのレシピに紐づくURLを出力します。URLは重複させません。
404エラーになるURLではダメです。
URLは必ず次のドメインのいずれかを使い、 実在するレシピページのみを選択してください。
「cookpad.com、kurashiru.com、delishkitchen.tv、park.ajinomoto.co.jp、sirogohan.com、kikkoman.co.jp、youtube.comのドメインのみ可」

例:
[
  {
    "title": "レンジで簡単♪ささみとアボカドの和風サラダ",
    "url": "https://delishkitchen.tv/recipes/308512152539365817"
  },
  {
    "title": "鶏胸肉の照り焼きチキン",
    "url": "https://cookpad.com/jp/recipes/19154447"
  },
  {
    "title": "インド人シェフの本格チキンカレー",
    "url": "https://mi-journey.jp/foodie/39923/"
  }
]
`.trim()

const callChatGPT = async (prompt) => {
  const chat = await openai.chat.completions.create({
    model: MODEL_ID,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })
  return chat.choices[0].message.content
}

app.post('/api/recipes', async (req, res) => {
  const { likedFoods = [], limit = 3 } = req.body
  const prompt = buildPrompt(likedFoods, limit)
  try {
    const text = await retry(async () => callChatGPT(prompt), {
      retries: 4,
      minTimeout: 800,
      factor: 2,
    })

    let recipes = []

    // text: LLM が返した全文
    console.log('----- raw LLM response -----\n', text, '\n---------------------------')

    try {
      // server/server.js  ← JSON.parse の前に追加
      let jsonText = text.trim()
      const m = jsonText.match(/```(?:json)?([\s\S]*?)```/i)
      if (m) jsonText = m[1].trim()

      recipes = JSON.parse(jsonText)
        .filter((o) => o?.title)
        .map((o) => ({
          title: o.title,
          url: o.url ?? `https://www.google.com/search?q=${encodeURIComponent(o.title)} レシピ`,
        }))
        .slice(0, limit)

      // recipes: パース結果（ JSON->object or 箇条書き fallback ）
      console.log('parsed recipes =>', recipes)

      // 足りない場合は throw して fallback へ
      if (recipes.length < limit) throw new Error('not enough items')
    } catch {
      // 箇条書き fallback
      recipes = text
        .split('\n')
        .map((s) => s.replace(/^[\s\-*・\d.)]+/, '').trim())
        .filter(Boolean)
        .slice(0, limit)
    }
    res.json({ recipes })
  } catch (e) {
    console.error(e)
    res.status(503).json({ message: 'OpenAI API error / rate-limit exceeded' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API server on http://localhost:${PORT}  (model=${MODEL_ID})`))
