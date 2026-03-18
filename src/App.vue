<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <h1 @click="goToBookshelf" class="app-title">
          <span class="title-icon">✨</span>
          <span class="title-text">AI 小说互动创作台</span>
        </h1>
        <p class="app-subtitle">让故事随你的选择而生长</p>
      </div>
      <div class="header-actions" v-if="stage === 'writing' || stage === 'ended'">
        <button class="btn btn-ghost btn-sm" @click="goToBookshelf">
          <span>📚</span> 书架
        </button>
        <button class="btn btn-primary btn-sm" @click="handleExport">
          <span>📥</span> 导出
        </button>
      </div>
    </header>

    <main class="main-container">
      <transition name="fade" mode="out-in">
        <Bookshelf 
          v-if="stage === 'bookshelf'"
          key="bookshelf"
          :novel-list="novelList"
          @create-novel="createNewNovel"
          @open-novel="openNovel"
          @export-novel="handleExportNovel"
          @confirm-delete="confirmDelete"
        />

        <SetupForm 
          v-else-if="stage === 'setup'"
          key="setup"
          :novel="novel"
          :show-back-button="true"
          @submit="startWriting"
          @back="goToBookshelf"
        />

        <WritingView
          v-else-if="stage === 'writing'"
          key="writing"
          :chapters="chapters"
          :current-chapter="currentChapter"
          :chapter-title="chapterTitle"
          :current-content="currentContent"
          :next-options="nextOptions"
          :custom-choice="customChoice"
          :is-generating="isGenerating"
          :error-message="errorMessage"
          @jump-to-chapter="jumpToChapter"
          @save="saveNovel"
          @choose="chooseOption"
          @submit-custom="submitCustomChoice"
          @update:custom-choice="updateCustomChoice"
          @rewrite-chapter="rewriteChapter"
        />

        <EndedView
          v-else-if="stage === 'ended'"
          key="ended"
          :chapters-count="chapters.length"
          :total-words="totalWords"
          :novel-title="novel.title"
          @export="handleExport"
          @back-to-bookshelf="goToBookshelf"
          @create-new="createNewNovel"
        />
      </transition>
    </main>

    <transition name="fade">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
        <div class="modal" @click.stop>
          <div class="modal-icon">⚠️</div>
          <h3>确认删除</h3>
          <p>确定要删除《{{ novelToDelete?.title }}》吗？此操作不可恢复。</p>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="showDeleteConfirm = false">取消</button>
            <button class="btn btn-danger" @click="doDelete">确认删除</button>
          </div>
        </div>
      </div>
    </transition>

    <footer class="footer">
      <p>AI 小说互动创作 · 基于 Vue 3 构建</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { initDB, getAllNovels, saveNovel as saveNovelToDB, deleteNovel as deleteNovelFromDB, downloadNovel } from './utils/db.js'

import Bookshelf from './components/Bookshelf.vue'
import SetupForm from './components/SetupForm.vue'
import WritingView from './components/WritingView.vue'
import EndedView from './components/EndedView.vue'

import './styles/global.css'
import { generateChapterWithAI } from './utils/aiUtils.js'

const stage = ref('bookshelf')
const novel = ref({
  id: null,
  title: '',
  protagonist: '',
  protagonistPersonality: '',
  protagonistMotivation: '',
  protagonistGrowth: '',
  characters: '',
  outline: '',
  coreConflict: '',
  climaxPreset: '',
  timeSetting: '',
  locationSetting: '',
  socialBackground: '',
  atmosphere: '',
  style: '',
  theme: '',
  themeDescription: '',
  narrativeStructure: '',
  writingStyle: '',
  dialogueStyle: ''
})
const chapters = ref([])
const currentChapter = ref(1)
const chapterTitle = ref('')
const currentContent = ref('')
const customChoice = ref('')
const isGenerating = ref(false)
const nextOptions = ref([])
const errorMessage = ref('')

const novelList = ref([])
const showDeleteConfirm = ref(false)
const novelToDelete = ref(null)

const historySummary = computed(() => {
  if (chapters.value.length <= 1) return '暂无前情。'
  return chapters.value.slice(0, -1).map((c, i) =>
    `第${i + 1}章《${c.title}》：${c.summary || '（无摘要）'}`
  ).join('\n')
})

const totalWords = computed(() => {
  return chapters.value.reduce((sum, c) => sum + c.content.length, 0)
})

function updateCustomChoice(value) {
  customChoice.value = value
}

async function loadBookshelf() {
  try {
    await initDB()
    novelList.value = await getAllNovels()
  } catch (error) {
    console.error('加载书架失败:', error)
  }
}

function goToBookshelf() {
  loadBookshelf()
  stage.value = 'bookshelf'
}

function createNewNovel() {
  novel.value = {
    id: null,
    title: '',
    protagonist: '',
    protagonistPersonality: '',
    protagonistMotivation: '',
    protagonistGrowth: '',
    characters: '',
    outline: '',
    coreConflict: '',
    climaxPreset: '',
    timeSetting: '',
    locationSetting: '',
    socialBackground: '',
    atmosphere: '',
    style: '',
    theme: '',
    themeDescription: '',
    narrativeStructure: '',
    writingStyle: '',
    dialogueStyle: ''
  }
  chapters.value = []
  currentChapter.value = 1
  currentContent.value = ''
  chapterTitle.value = ''
  nextOptions.value = []
  stage.value = 'setup'
}

async function openNovel(novelData) {
  novel.value = {
    id: novelData.id,
    title: novelData.title || '',
    protagonist: novelData.protagonist || '',
    protagonistPersonality: novelData.protagonistPersonality || '',
    protagonistMotivation: novelData.protagonistMotivation || '',
    protagonistGrowth: novelData.protagonistGrowth || '',
    characters: novelData.characters || '',
    outline: novelData.outline || '',
    coreConflict: novelData.coreConflict || '',
    climaxPreset: novelData.climaxPreset || '',
    timeSetting: novelData.timeSetting || '',
    locationSetting: novelData.locationSetting || '',
    socialBackground: novelData.socialBackground || '',
    atmosphere: novelData.atmosphere || '',
    style: novelData.style || '',
    theme: novelData.theme || '',
    themeDescription: novelData.themeDescription || '',
    narrativeStructure: novelData.narrativeStructure || '',
    writingStyle: novelData.writingStyle || '',
    dialogueStyle: novelData.dialogueStyle || ''
  }
  chapters.value = novelData.chapters || []
  
  if (chapters.value.length > 0) {
    currentChapter.value = chapters.value.length
    chapterTitle.value = chapters.value[chapters.value.length - 1].title
    currentContent.value = chapters.value[chapters.value.length - 1].content
    nextOptions.value = chapters.value[chapters.value.length - 1].options || []
    stage.value = 'writing'
  } else {
    stage.value = 'setup'
  }
}

function jumpToChapter(chapterNum) {
  if (chapterNum < 1 || chapterNum > chapters.value.length) return
  currentChapter.value = chapterNum
  chapterTitle.value = chapters.value[chapterNum - 1].title
  currentContent.value = chapters.value[chapterNum - 1].content
  nextOptions.value = chapters.value[chapterNum - 1].options || []
}

async function saveNovel() {
  try {
    const novelData = {
      ...novel.value,
      chapters: chapters.value
    }
    const id = await saveNovelToDB(novelData)
    if (!novel.value.id) {
      novel.value.id = id
    }
    return true
  } catch (error) {
    console.error('保存失败:', error)
    errorMessage.value = '保存失败：' + error.message
    return false
  }
}

watch(chapters, () => {
  if (novel.value.id && chapters.value.length > 0) {
    saveNovel()
  }
}, { deep: true })

function handleExport() {
  if (!novel.value.title) return
  downloadNovel({
    ...novel.value,
    chapters: chapters.value
  })
}

function handleExportNovel(novelData) {
  downloadNovel(novelData)
}

function confirmDelete(novelData) {
  novelToDelete.value = novelData
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!novelToDelete.value) return
  try {
    await deleteNovelFromDB(novelToDelete.value.id)
    novelList.value = novelList.value.filter(n => n.id !== novelToDelete.value.id)
    showDeleteConfirm.value = false
    novelToDelete.value = null
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败：' + error.message)
  }
}

async function startWriting() {
  if (!novel.value.title || !novel.value.protagonist) {
    alert('请填写小说名称和主角名字！')
    return
  }

  stage.value = 'writing'
  currentChapter.value = 1
  isGenerating.value = true
  errorMessage.value = ''
  currentContent.value = 'AI 正在构思第一章...'

  try {
    const first = await generateChapterWithAI(
      novel.value, 
      '', 
      '', 
      1, 
      true,
      (content) => {
        currentContent.value = content
      },
      (error) => {
        errorMessage.value = error
      }
    )
    chapters.value = [first]
    currentContent.value = first.content
    chapterTitle.value = first.title
    nextOptions.value = first.options.length > 0 ? first.options : [
      { text: "A. 继续前进", id: "continue_a" },
      { text: "B. 仔细观察周围", id: "observe" },
      { text: "C. 做出不同选择", id: "different" }
    ]
    
    await saveNovel()
  } catch (error) {
    console.error('生成第一章失败:', error)
    errorMessage.value = error.message
    currentContent.value = '生成失败，请刷新页面重试。\n错误信息：' + errorMessage.value
  } finally {
    isGenerating.value = false
  }
}

async function chooseOption(option) {
  if (isGenerating.value) return
  isGenerating.value = true
  customChoice.value = ''
  errorMessage.value = ''
  currentContent.value = 'AI 正在构思下一章...'

  try {
    const prevSummary = historySummary.value
    const newChapterNum = currentChapter.value + 1
    const userChoice = option.text

    const newChapter = await generateChapterWithAI(
      novel.value,
      prevSummary,
      userChoice,
      newChapterNum,
      false,
      (content) => {
        currentContent.value = content
      },
      (error) => {
        errorMessage.value = error
      }
    )
    
    chapters.value.push(newChapter)
    currentChapter.value = newChapterNum
    currentContent.value = newChapter.content
    chapterTitle.value = newChapter.title

    if (newChapter.isEnded || newChapterNum >= 10) {
      stage.value = 'ended'
    } else {
      nextOptions.value = newChapter.options.length > 0 ? newChapter.options : [
        { text: "A. 继续探索", id: "continue_a" },
        { text: "B. 寻找线索", id: "find_clues" },
        { text: "C. 返回原地", id: "go_back" }
      ]
    }
    
    await saveNovel()
  } catch (error) {
    console.error('生成章节失败:', error)
    errorMessage.value = error.message
    currentContent.value = '生成失败，请重试。\n错误信息：' + errorMessage.value
  } finally {
    isGenerating.value = false
  }
}

function submitCustomChoice() {
  if (!customChoice.value.trim()) return
  chooseOption({ text: `自定义：${customChoice.value}` })
}

async function rewriteChapter() {
  if (isGenerating.value || currentChapter.value < 1) return
  
  const chapterIndex = currentChapter.value - 1
  const isRewritingFirstChapter = currentChapter.value === 1
  
  isGenerating.value = true
  errorMessage.value = ''
  currentContent.value = 'AI 正在重新创作本章...'

  try {
    const prevSummary = isRewritingFirstChapter ? '' : chapters.value
      .slice(0, chapterIndex)
      .map((c, i) => `第${i + 1}章《${c.title}》：${c.summary || '（无摘要）'}`)
      .join('\n')

    const rewrittenChapter = await generateChapterWithAI(
      novel.value,
      prevSummary,
      '',
      currentChapter.value,
      isRewritingFirstChapter,
      (content) => {
        currentContent.value = content
      },
      (error) => {
        errorMessage.value = error
      }
    )
    
    chapters.value[chapterIndex] = rewrittenChapter
    currentContent.value = rewrittenChapter.content
    chapterTitle.value = rewrittenChapter.title
    
    if (!isRewritingFirstChapter && chapterIndex < chapters.value.length - 1) {
      chapters.value = chapters.value.slice(0, chapterIndex + 1)
      nextOptions.value = rewrittenChapter.options.length > 0 ? rewrittenChapter.options : [
        { text: "A. 继续探索", id: "continue_a" },
        { text: "B. 寻找线索", id: "find_clues" },
        { text: "C. 返回原地", id: "go_back" }
      ]
    } else if (isRewritingFirstChapter) {
      nextOptions.value = rewrittenChapter.options.length > 0 ? rewrittenChapter.options : [
        { text: "A. 继续前进", id: "continue_a" },
        { text: "B. 仔细观察周围", id: "observe" },
        { text: "C. 做出不同选择", id: "different" }
      ]
    }
    
    await saveNovel()
  } catch (error) {
    console.error('重写章节失败:', error)
    errorMessage.value = error.message
    currentContent.value = chapters.value[chapterIndex]?.content || '重写失败，请重试。'
  } finally {
    isGenerating.value = false
  }
}

onMounted(async () => {
  await loadBookshelf()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
}

.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.app-title:hover {
  color: var(--primary);
}

.title-icon {
  font-size: 24px;
}

.app-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.main-container {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

.footer {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: 13px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .header-content {
    align-items: center;
    text-align: center;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .main-container {
    padding: 16px;
  }
}
</style>
