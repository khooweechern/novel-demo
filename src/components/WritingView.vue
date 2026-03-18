<template>
  <div class="writing-stage">
    <div class="writing-layout">
      <TableOfContents 
        :chapters="chapters"
        :current-chapter="currentChapter"
        @jump-to-chapter="jumpToChapter"
        @save="save"
      />
      
      <div class="main-content">
        <ChapterContent
          :current-chapter="currentChapter"
          :chapter-title="chapterTitle"
          :content="currentContent"
          :is-generating="isGenerating"
          :error-message="errorMessage"
        />
        
        <div class="chapter-actions" v-if="!isGenerating && currentContent">
          <button class="btn btn-outline" @click="rewriteChapter">
            <span>🔄</span> 重写本章
          </button>
        </div>
        
        <ChoiceOptions
          :options="nextOptions"
          :custom-choice="customChoice"
          :is-generating="isGenerating"
          @choose="chooseOption"
          @submit-custom="submitCustomChoice"
          @update:custom-choice="updateCustomChoice"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import TableOfContents from './TableOfContents.vue'
import ChapterContent from './ChapterContent.vue'
import ChoiceOptions from './ChoiceOptions.vue'

const props = defineProps({
  chapters: {
    type: Array,
    required: true
  },
  currentChapter: {
    type: Number,
    required: true
  },
  chapterTitle: {
    type: String,
    required: true
  },
  currentContent: {
    type: String,
    required: true
  },
  nextOptions: {
    type: Array,
    required: true
  },
  customChoice: {
    type: String,
    default: ''
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

const emit = defineEmits([
  'jump-to-chapter',
  'save',
  'choose',
  'submit-custom',
  'update:custom-choice',
  'rewrite-chapter'
])

function jumpToChapter(chapterNum) {
  emit('jump-to-chapter', chapterNum)
}

function save() {
  emit('save')
}

function chooseOption(option) {
  emit('choose', option)
}

function submitCustomChoice() {
  emit('submit-custom')
}

function updateCustomChoice(value) {
  emit('update:custom-choice', value)
}

function rewriteChapter() {
  emit('rewrite-chapter')
}
</script>

<style scoped>
.writing-stage {
  animation: fadeIn 0.3s ease;
}

.writing-layout {
  display: flex;
  gap: 24px;
  min-height: 600px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.chapter-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .writing-layout {
    flex-direction: column;
  }
}
</style>
