<template>
  <div class="bookshelf">
    <div class="bookshelf-header">
      <div class="header-left">
        <h2>📚 我的书架</h2>
        <span class="novel-count">{{ novelList.length }} 部作品</span>
      </div>
      <button class="btn btn-primary" @click="createNewNovel">
        <span>✨</span> 创作新小说
      </button>
    </div>
    
    <div v-if="novelList.length === 0" class="empty-shelf">
      <div class="empty-icon">📖</div>
      <h3>书架空空如也</h3>
      <p>开始创作你的第一部小说吧！</p>
      <button class="btn btn-primary btn-lg" @click="createNewNovel">
        <span>✨</span> 开始创作
      </button>
    </div>
    
    <div v-else class="novel-grid">
      <div 
        v-for="novel in novelList" 
        :key="novel.id" 
        class="novel-card card"
        @click="openNovel(novel)"
      >
        <div class="novel-cover">
          <div class="cover-gradient"></div>
          <span class="novel-icon">📖</span>
          <div class="novel-style-badge" v-if="novel.style">{{ novel.style }}</div>
        </div>
        <div class="novel-info">
          <h3 class="novel-title">{{ novel.title }}</h3>
          <p class="novel-protagonist">
            <span class="label-icon">👤</span>
            {{ novel.protagonist }}
          </p>
          <div class="novel-stats">
            <span class="stat-item">
              <span class="stat-icon">📄</span>
              {{ novel.chapters?.length || 0 }} 章
            </span>
            <span class="stat-item">
              <span class="stat-icon">📝</span>
              {{ calculateWords(novel) }} 字
            </span>
          </div>
          <p class="novel-date">{{ formatDate(novel.updatedAt) }}</p>
        </div>
        <div class="novel-actions" @click.stop>
          <button class="btn btn-ghost btn-sm" @click="handleExportNovel(novel)">
            <span>📥</span> 导出
          </button>
          <button class="btn btn-ghost btn-sm btn-danger-text" @click="confirmDelete(novel)">
            <span>🗑️</span> 删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  novelList: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'create-novel',
  'open-novel',
  'export-novel',
  'confirm-delete'
])

function calculateWords(novel) {
  if (!novel.chapters || novel.chapters.length === 0) return 0
  return novel.chapters.reduce((sum, c) => sum + (c.content?.length || 0), 0)
}

function formatDate(dateString) {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString('zh-CN')
}

function createNewNovel() {
  emit('create-novel')
}

function openNovel(novel) {
  emit('open-novel', novel)
}

function handleExportNovel(novel) {
  emit('export-novel', novel)
}

function confirmDelete(novel) {
  emit('confirm-delete', novel)
}
</script>

<style scoped>
.bookshelf {
  animation: fadeIn 0.3s ease;
}

.bookshelf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.bookshelf-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.novel-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-shelf {
  text-align: center;
  padding: 80px 20px;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 2px dashed var(--border-color);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-shelf h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--text-primary);
}

.empty-shelf p {
  margin: 0 0 24px;
  color: var(--text-secondary);
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.novel-card {
  cursor: pointer;
  overflow: hidden;
  transition: var(--transition);
}

.novel-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.novel-cover {
  position: relative;
  height: 120px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
}

.novel-icon {
  font-size: 48px;
  position: relative;
  z-index: 1;
}

.novel-style-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: white;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.novel-info {
  padding: 16px;
}

.novel-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.novel-protagonist {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 12px;
}

.label-icon {
  font-size: 14px;
}

.novel-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 12px;
}

.novel-date {
  color: var(--text-muted);
  font-size: 12px;
  margin: 0;
}

.novel-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-sidebar);
}

.btn-danger-text:hover {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 768px) {
  .bookshelf-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: center;
  }
  
  .novel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
