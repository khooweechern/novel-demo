<template>
  <div class="chapter-section card">
    <div class="chapter-header">
      <div class="chapter-title-row">
        <span class="chapter-badge">第 {{ currentChapter }} 章</span>
        <h2 class="chapter-title">{{ chapterTitle }}</h2>
      </div>
      <div class="chapter-meta">
        <span class="word-count">
          <span class="meta-icon">📝</span>
          {{ content.length }} 字
        </span>
      </div>
    </div>

    <div class="chapter-content" v-html="renderedContent"></div>

    <div v-if="isGenerating" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>AI 正在构思...</p>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  currentChapter: {
    type: Number,
    required: true
  },
  chapterTitle: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isGenerating: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const renderedContent = computed(() => {
  return props.content.replace(/\n/g, '<br/>')
})
</script>

<style scoped>
.chapter-section {
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.chapter-title-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chapter-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: var(--gradient-primary);
  color: white;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.chapter-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.chapter-meta {
  display: flex;
  gap: 16px;
}

.word-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.meta-icon {
  font-size: 14px;
}

.chapter-content {
  line-height: 1.8;
  font-size: 16px;
  color: var(--text-primary);
  white-space: pre-line;
  min-height: 200px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
}

.loading-content {
  text-align: center;
}

.loading-content p {
  margin: 16px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  margin-top: 16px;
  font-size: 14px;
}

.error-icon {
  font-size: 16px;
}

@media (max-width: 600px) {
  .chapter-section {
    padding: 16px;
  }
  
  .chapter-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .chapter-title {
    font-size: 18px;
  }
}
</style>
