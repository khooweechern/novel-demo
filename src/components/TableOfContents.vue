<template>
  <aside class="toc-sidebar card">
    <div class="toc-header">
      <h3>📑 目录</h3>
      <span class="chapter-count">{{ chapters.length }} 章</span>
    </div>
    <div class="toc-list">
      <div 
        v-for="(chapter, index) in chapters" 
        :key="index"
        :class="['toc-item', { active: currentChapter === index + 1 }]"
        @click="jumpToChapter(index + 1)"
      >
        <span class="toc-num">第{{ index + 1 }}章</span>
        <span class="toc-title">{{ chapter.title }}</span>
      </div>
    </div>
    <div class="toc-footer">
      <button class="btn btn-outline btn-block" @click="saveProgress">
        <span>💾</span> 保存进度
      </button>
    </div>
  </aside>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  chapters: {
    type: Array,
    required: true
  },
  currentChapter: {
    type: Number,
    required: true
  }
})

const emit = defineEmits([
  'jump-to-chapter',
  'save'
])

function jumpToChapter(chapterNum) {
  if (chapterNum >= 1 && chapterNum <= props.chapters.length) {
    emit('jump-to-chapter', chapterNum)
  }
}

function saveProgress() {
  emit('save')
}
</script>

<style scoped>
.toc-sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  position: sticky;
  top: 100px;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.toc-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chapter-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-sidebar);
  padding: 2px 8px;
  border-radius: 9999px;
}

.toc-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.toc-item {
  padding: 12px 14px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  margin-bottom: 4px;
  transition: var(--transition);
  border: 2px solid transparent;
}

.toc-item:hover {
  background: var(--bg-sidebar);
}

.toc-item.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
}

.toc-item.active .toc-num,
.toc-item.active .toc-title {
  color: var(--primary);
}

.toc-num {
  font-size: 11px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toc-title {
  font-size: 14px;
  color: var(--text-primary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.toc-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 900px) {
  .toc-sidebar {
    width: 100%;
    max-height: none;
    position: static;
  }
  
  .toc-list {
    display: flex;
    overflow-x: auto;
    padding: 12px;
    gap: 8px;
  }
  
  .toc-item {
    flex-shrink: 0;
    min-width: 140px;
  }
}
</style>
