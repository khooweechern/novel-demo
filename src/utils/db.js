/**
 * IndexedDB 数据库封装
 * 用于本地存储小说数据
 */

const DB_NAME = 'NovelWriterDB'
const DB_VERSION = 1
const STORE_NAME = 'novels'

let db = null

/**
 * 初始化数据库
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('数据库打开失败:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      console.log('数据库连接成功')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      
      // 创建小说存储对象
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('title', 'title', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
        console.log('小说存储表创建成功')
      }
    }
  })
}

/**
 * 获取所有小说列表
 */
export async function getAllNovels() {
  await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      // 按更新时间倒序排列
      const novels = request.result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      resolve(novels)
    }

    request.onerror = () => {
      console.error('获取小说列表失败:', request.error)
      reject(request.error)
    }
  })
}

/**
 * 根据 ID 获取单个小说
 */
export async function getNovelById(id) {
  await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      console.error('获取小说失败:', request.error)
      reject(request.error)
    }
  })
}

/**
 * 保存小说（新增或更新）
 */
export async function saveNovel(novel) {
  await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    // 转换为普通对象（Vue 响应式对象是 Proxy，无法直接存储）
    const plainNovel = JSON.parse(JSON.stringify(novel))
    
    // 更新时间戳
    plainNovel.updatedAt = new Date().toISOString()
    if (!plainNovel.createdAt) {
      plainNovel.createdAt = plainNovel.updatedAt
    }
    
    // 如果 id 无效，删除它让 IndexedDB 自动生成
    const hasValidId = plainNovel.id !== null && plainNovel.id !== undefined
    if (!hasValidId) {
      delete plainNovel.id
    }
    
    // 使用 put 方法：有 id 则更新，无 id 则新增
    const request = store.put(plainNovel)

    request.onsuccess = () => {
      resolve(request.result) // 返回 ID
    }

    request.onerror = () => {
      console.error('保存小说失败:', request.error)
      reject(request.error)
    }
  })
}

/**
 * 删除小说
 */
export async function deleteNovel(id) {
  await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve(true)
    }

    request.onerror = () => {
      console.error('删除小说失败:', request.error)
      reject(request.error)
    }
  })
}

/**
 * 导出小说为文本
 */
export function exportNovelAsTxt(novel) {
  let content = `${'='.repeat(50)}\n`
  content += `《${novel.title}》\n`
  content += `总字数：${calculateTotalWords(novel)} 字\n`
  content += `创作时间：${formatDate(novel.createdAt)}\n`
  content += `${'='.repeat(50)}\n\n`
  
  content += `【基本信息】\n`
  content += `小说风格：${novel.style || '未设定'}\n\n`
  
  content += `【人物设定】\n`
  content += `主角：${novel.protagonist}\n`
  content += `主角性格：${novel.protagonistPersonality || '未设定'}\n`
  content += `主角动机：${novel.protagonistMotivation || '未设定'}\n`
  content += `成长方向：${novel.protagonistGrowth || '未设定'}\n`
  content += `配角设定：${novel.characters || '未设定'}\n\n`
  
  content += `【环境设定】\n`
  content += `时间背景：${novel.timeSetting || '未设定'}\n`
  content += `地点设定：${novel.locationSetting || '未设定'}\n`
  content += `社会背景：${novel.socialBackground || '未设定'}\n`
  content += `故事氛围：${novel.atmosphere || '未设定'}\n\n`
  
  content += `【情节设定】\n`
  content += `故事大纲：${novel.outline || '暂无大纲'}\n`
  content += `核心冲突：${novel.coreConflict || '未设定'}\n`
  content += `高潮预设：${novel.climaxPreset || '未设定'}\n\n`
  
  content += `【主题设定】\n`
  content += `核心主题：${novel.theme || '未设定'}\n`
  content += `主题阐述：${novel.themeDescription || '未设定'}\n\n`
  
  content += `【语言与结构】\n`
  content += `叙事结构：${novel.narrativeStructure || '未设定'}\n`
  content += `文风特点：${novel.writingStyle || '未设定'}\n`
  content += `对话风格：${novel.dialogueStyle || '未设定'}\n\n`
  
  content += `${'─'.repeat(50)}\n\n`

  if (novel.chapters && novel.chapters.length > 0) {
    novel.chapters.forEach((chapter, index) => {
      content += `\n${'★'.repeat(20)}\n`
      content += `第${index + 1}章：${chapter.title}\n`
      content += `${'★'.repeat(20)}\n\n`
      content += chapter.content + '\n\n'
    })
  }

  return content
}

/**
 * 下载小说为 txt 文件
 */
export function downloadNovel(novel) {
  const content = exportNovelAsTxt(novel)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${novel.title}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 计算总字数
 */
function calculateTotalWords(novel) {
  if (!novel.chapters || novel.chapters.length === 0) return 0
  return novel.chapters.reduce((sum, chapter) => sum + (chapter.content?.length || 0), 0)
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default {
  initDB,
  getAllNovels,
  getNovelById,
  saveNovel,
  deleteNovel,
  exportNovelAsTxt,
  downloadNovel
}
