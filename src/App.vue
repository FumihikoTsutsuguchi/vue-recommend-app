<script setup>
import { ref } from 'vue'
import FoodCard from './components/FoodCard.vue'
const foods = ref([
  { name: '日本食', emoji: '🇯🇵' },
  { name: '洋食', emoji: '🇫🇷' },
  { name: 'ヘルシー', emoji: '🌱' },
  { name: 'コッテリ', emoji: '🥘' },
  { name: '寿司', emoji: '🍣' },
  { name: 'ハンバーガー', emoji: '🍔' },
  { name: '焼肉', emoji: '🥩' }
  // { name: 'おでん', emoji: '🍢' },
  // { name: '丼もの', emoji: '🍚' },
  // { name: '炒め物', emoji: '🥬' },
  // { name: 'カレー', emoji: '🍛' },
  // { name: '麺類', emoji: '🍜' },
  // { name: '卵料理', emoji: '🥚' },
  // { name: '鍋', emoji: '🍲' },
])

const pickedFoodIndex = ref(0)
const newFoodIndex = ref(1)
function pickFood(index) {
  pickedFoodIndex.value = index
  newFoodIndex.value++
}
</script>

<template>
  <main>
    <h1 class="title">今日は何を作る？</h1>
    <FoodCard
      :name="foods[pickedFoodIndex].name"
      :emoji="foods[pickedFoodIndex].emoji"
      @click="pickFood(pickedFoodIndex)"
    />

    <template v-if="newFoodIndex < foods.length">
      <p>vs</p>
      <FoodCard
        :name="foods[newFoodIndex].name"
        :emoji="foods[newFoodIndex].emoji"
        @click="pickFood(newFoodIndex)"
      />
    </template>
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
