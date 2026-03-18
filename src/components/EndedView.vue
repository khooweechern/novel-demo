<template>
  <div class="ended-view">
    <div class="ended-card card">
      <div class="ended-icon">🎉</div>
      <h2>故事完成！</h2>
      <p class="novel-title-display">《{{ novelTitle }}》</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ chaptersCount }}</div>
          <div class="stat-label">章节</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalWords.toLocaleString() }}</div>
          <div class="stat-label">总字数</div>
        </div>
      </div>
      
      <div class="ended-actions">
        <button class="btn btn-primary btn-lg" @click="exportNovel">
          <span>📥</span> 导出小说
        </button>
        <button class="btn btn-outline" @click="backToBookshelf">
          <span>📚</span> 返回书架
        </button>
        <button class="btn btn-outline" @click="createNew">
          <span>✨</span> 创作新故事
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  chaptersCount: {
    type: Number,
    required: true
  },
  totalWords: {
    type: Number,
    required: true
  },
  novelTitle: {
    type: String,
    default: '未命名小说'
  }
})

const emit = defineEmits([
  'export',
  'back-to-bookshelf',
  'create-new'
])

function exportNovel() {
  emit('export')
}

function backToBookshelf() {
  emit('back-to-bookshelf')
}

function createNew() {
  emit('create-new')
}
</script>

<style scoped>
.ended-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  animation: fadeIn 0.3s ease;
}

.ended-card {
  text-align: center;
  padding: 48px;
  max-width: 500px;
  width: 100%;
}

.ended-icon {
  font-size: 72px;
  margin-bottom: 16px;
}

.ended-card h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.novel-title-display {
  margin: 0 0 32px;
  font-size: 18px;
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-sidebar);
  border-radius: var(--border-radius);
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.ended-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 600px) {
  .ended-card {
    padding: 32px 24px;
  }
  
  .ended-icon {
    font-size: 56px;
  }
  
  .ended-card h2 {
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>
