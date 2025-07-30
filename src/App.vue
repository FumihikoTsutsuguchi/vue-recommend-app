<script setup>
import { ref, computed } from 'vue'
import FoodCard from './components/FoodCard.vue'

const foods = ref([
  [
    { name: '日本食', emoji: '🇯🇵' },
    { name: '洋食', emoji: '🇫🇷' },
  ],
  [
    { name: '創作料理', emoji: '🛠️' },
    { name: '王道料理', emoji: '🍛' },
  ],
  [
    { name: 'ヘルシー', emoji: '🌱' },
    { name: 'こってり', emoji: '🥘' },
  ],
  [
    { name: '米', emoji: '🌾' },
    { name: '麺', emoji: '🍜' },
  ],
  [
    { name: '肉', emoji: '🍖' },
    { name: '魚', emoji: '🐟' },
  ],
  [
    { name: '野菜', emoji: '🥬' },
    { name: '野菜嫌い', emoji: '😠' },
  ],
  [
    { name: '辛味', emoji: '🌶️' },
    { name: '辛味なし', emoji: '🥺' },
  ],
])

const round = ref(0)
const likedFoods = ref([])
const recipes = ref([])
const loading = ref(false)
const errorMsg = ref('')

const currentPair = computed(() => foods.value[round.value] || [])

function choose(food) {
  likedFoods.value.push(food.name)
  round.value += 1
  if (round.value >= foods.value.length) {
    askAI()
  }
}
async function askAI() {
  loading.value = true
  errorMsg.value = ''
  recipes.value = []

  // --- ダミー実装（実際の API 呼び出しに置き換えてください）---
  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likedFoods: likedFoods.value, limit: 3 }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'bad response')

    recipes.value = data.recipes
  } catch (e) {
    errorMsg.value = 'レシピ取得に失敗しました'
  } finally {
    loading.value = false
  }
}

function reset() {
  likedFoods.value = []
  recipes.value = []
  errorMsg.value = ''
  round.value = 0
}
</script>

<template>
  <main>
    <h1 class="title">今日は何を作る？</h1>
    <p class="explanation">ジャンルを選ぶと、おすすめ料理が表示されます。</p>

    <div v-if="round < foods.length" class="battle">
      <FoodCard v-bind="currentPair[0]" @click="choose(currentPair[0])" />
      <p class="vs">vs</p>
      <FoodCard v-bind="currentPair[1]" @click="choose(currentPair[1])" />
      <p class="selected">
        あなたが選んだジャンル：<strong>{{ likedFoods.join('、') }}</strong>
      </p>
    </div>

    <div v-else class="result">
      <p v-if="loading" class="loading">レシピを取得中…</p>
      <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

      <ul v-else class="recipe-list">
        <li v-for="r in recipes" :key="r.url">
          <a :href="r.url" target="_blank" rel="noopener">{{ r.title }}</a>
        </li>
      </ul>

      <button class="reset" @click="reset">最初からやり直す</button>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 500px;
  margin: 100px auto;
  padding: 0 30px;
}
h1 {
  text-align: center;
  font-family: "M PLUS 1p";
}
.explanation {
  text-align: center;
  font-family: "M PLUS 1p";
}
.title {
  margin-bottom: 60px;
}
.battle {
  text-align: center;
}
.loading {
  width: 400px;
  margin: 30px auto;
  font-family: "M PLUS 1p";
}
.recipe-list {
  width: 400px;
  margin: 30px auto;
  a {
    font-size: 18px;
    text-decoration: none;
    color: #1e90ff;
  }
}
.reset {
  width: 200px;
  display: block;
  margin: 60px auto;
  background-color: #696969;
  padding: 10px 20px;
  border-radius: 3px;
  color: white;
}
button {
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
}
.selected {
  font-family: "M PLUS 1p";
}
</style>
