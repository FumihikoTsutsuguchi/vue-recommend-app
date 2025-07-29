<script setup>
import { ref, computed } from 'vue'
import FoodCard from './components/FoodCard.vue'

const foods = ref([
  [
    { name: '日本食', emoji: '🇯🇵' },
    { name: '洋食', emoji: '🇫🇷' },
  ],
  [
    { name: 'ヘルシー', emoji: '🌱' },
    { name: 'コッテリ', emoji: '🥘' },
  ],
  [
    { name: '寿司', emoji: '🍣' },
    { name: 'ハンバーガー', emoji: '🍔' },
  ],
  [
    { name: '卵料理', emoji: '🥚' },
    { name: '鍋', emoji: '🍲' },
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
    <FoodCard v-for="food in currentPair" :key="food.name" v-bind="food" @click="choose(food)" />

    <template v-if="round < foods.length">
      <p>vs</p>
      <FoodCard
        :name="foods[newFoodIndex].name"
        :emoji="foods[newFoodIndex].emoji"
        @click="pickFood(newFoodIndex)"
      />
    </template>

    <div v-else class="result">
      <p>
        あなたが選んだジャンル：<strong>{{ likedFoods.join('、') }}</strong>
      </p>

      <p v-if="loading">レシピを取得中…</p>
      <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>

      <ul v-else class="recipe-list">
        <li v-for="r in recipes" :key="r">{{ r }}</li>
      </ul>

      <button class="reset" @click="reset">最初からやり直す</button>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 500px;
  margin: 100px auto;
  text-align: center;
}

.title {
  margin-bottom: 60px;
}
</style>
