/**
 * AI 相关工具函数
 */
import { streamChat } from './bailian.js'

/**
 * 构建生成章节的提示词
 */
export function buildChapterPrompt(novel, prevSummary, userChoice, chapterNum, isFirstChapter) {
  const parts = []
  
  parts.push(`小说名称：《${novel.title}》`)
  
  if (novel.style) parts.push(`小说风格：${novel.style}`)
  
  parts.push(`\n【人物设定】`)
  parts.push(`主角：${novel.protagonist}`)
  if (novel.protagonistPersonality) parts.push(`主角性格：${novel.protagonistPersonality}`)
  if (novel.protagonistMotivation) parts.push(`主角动机：${novel.protagonistMotivation}`)
  if (novel.protagonistGrowth) parts.push(`成长方向：${novel.protagonistGrowth}`)
  if (novel.characters) parts.push(`配角设定：${novel.characters}`)
  
  parts.push(`\n【环境设定】`)
  if (novel.timeSetting) parts.push(`时间背景：${novel.timeSetting}`)
  if (novel.locationSetting) parts.push(`地点设定：${novel.locationSetting}`)
  if (novel.socialBackground) parts.push(`社会背景：${novel.socialBackground}`)
  if (novel.atmosphere) parts.push(`故事氛围：${novel.atmosphere}`)
  
  parts.push(`\n【情节设定】`)
  parts.push(`故事大纲：${novel.outline}`)
  if (novel.coreConflict) parts.push(`核心冲突：${novel.coreConflict}`)
  if (novel.climaxPreset) parts.push(`高潮预设：${novel.climaxPreset}`)
  
  parts.push(`\n【主题设定】`)
  if (novel.theme) parts.push(`核心主题：${novel.theme}`)
  if (novel.themeDescription) parts.push(`主题阐述：${novel.themeDescription}`)
  
  parts.push(`\n【语言与结构】`)
  if (novel.narrativeStructure) parts.push(`叙事结构：${novel.narrativeStructure}`)
  if (novel.writingStyle) parts.push(`文风特点：${novel.writingStyle}`)
  if (novel.dialogueStyle) parts.push(`对话风格：${novel.dialogueStyle}`)
  
  const novelInfo = parts.join('\n')
  
  if (isFirstChapter) {
    return `你是一位专业的小说创作助手。现在请为以下小说创作第一章的内容。

${novelInfo}

要求：
1. 章节标题要吸引人，符合故事风格
2. 正文内容必须不少于800字，要有画面感和悬念，字数不足将被拒绝
3. 结尾必须提供3个分支选项供读者选择故事走向
4. 章节摘要必须包含以下要素（150字以内）：
   - 出场人物及其状态
   - 当前所在地点
   - 剧情发展关键点
   摘要格式示例："【人物】张三受伤、李四失踪；【地点】破败的古庙；【剧情】张三在古庙发现神秘石碑，触发机关后与李四失散"

请严格按照以下JSON格式返回：
{
  "title": "章节标题",
  "content": "章节正文内容（不少于800字）...",
  "summary": "【人物】...；【地点】...；【剧情】...",
  "options": [
    {"text": "A. 选项描述", "id": "option_a"},
    {"text": "B. 选项描述", "id": "option_b"},
    {"text": "C. 选项描述", "id": "option_c"}
  ]
}

只返回JSON，不要其他内容。`
  }

  return `你是一位专业的小说创作助手。现在请继续创作以下小说的第${chapterNum}章。

${novelInfo}

前情回顾：
${prevSummary}

读者在上一步选择了：${userChoice}

要求：
1. 章节标题要吸引人，符合故事风格
2. 正文内容必须不少于800字，承接读者选择，推进剧情发展，字数不足将被拒绝
3. 结尾必须提供3个分支选项供读者选择故事走向
4. 章节摘要必须包含以下要素（150字以内）：
   - 出场人物及其状态
   - 当前所在地点
   - 剧情发展关键点
   摘要格式示例："【人物】张三受伤、李四失踪；【地点】破败的古庙；【剧情】张三在古庙发现神秘石碑，触发机关后与李四失散"
5. 如果是第10章或之后，可以考虑给出一个合理的结局

请严格按照以下JSON格式返回：
{
  "title": "章节标题",
  "content": "章节正文内容（不少于800字）...",
  "summary": "【人物】...；【地点】...；【剧情】...",
  "options": [
    {"text": "A. 选项描述", "id": "option_a"},
    {"text": "B. 选项描述", "id": "option_b"},
    {"text": "C. 选项描述", "id": "option_c"}
  ],
  "isEnded": false
}

只返回JSON，不要其他内容。如果故事已完结，将isEnded设为true。`
}

/**
 * 解析 AI 返回的 JSON
 */
export function parseAIResponse(text) {
  try {
    // 尝试提取 JSON 块
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || '未命名章节',
        content: parsed.content || '',
        summary: parsed.summary || '',
        options: parsed.options || [],
        isEnded: parsed.isEnded || false
      }
    }
  } catch (e) {
    console.error('解析 AI 响应失败:', e)
  }
  
  // 解析失败时的降级处理
  return {
    title: '章节生成中...',
    content: text,
    summary: '',
    options: [
      { text: 'A. 继续探索', id: 'continue_a' },
      { text: 'B. 寻找线索', id: 'continue_b' },
      { text: 'C. 返回原地', id: 'continue_c' }
    ],
    isEnded: false
  }
}

/**
 * 使用 AI 生成章节
 */
export async function generateChapterWithAI(novel, prevSummary, userChoice, chapterNum, isFirstChapter, onContentUpdate, onError) {
  const prompt = buildChapterPrompt(novel, prevSummary, userChoice, chapterNum, isFirstChapter)
  
  const systemPrompt = `你是一位专业的小说创作助手，擅长创作引人入胜的互动小说。
你的任务是：
1. 根据用户提供的故事设定创作章节内容
2. 正文内容必须不少于800字，字数不足将被拒绝
3. 内容要生动有趣，有画面感和悬念
4. 每章结尾提供分支选项供读者选择
5. 章节摘要必须严格按照格式：【人物】...；【地点】...；【剧情】...
   摘要必须包含出场人物、当前地点、剧情关键点，以便后续章节能够准确衔接
6. 严格按照要求的JSON格式返回

请始终保持创意和专业性，确保故事连贯性。`
  
  let fullResponse = ''
  
  return new Promise((resolve, reject) => {
    streamChat(
      prompt,
      [],  // 不使用历史对话，每章独立生成
      (chunk) => {
        fullResponse += chunk
        // 回调更新内容预览
        if (onContentUpdate) onContentUpdate(fullResponse)
      },
      () => {
        const result = parseAIResponse(fullResponse)
        resolve(result)
      },
      (error) => {
        if (onError) onError(error)
        reject(new Error(error))
      },
      systemPrompt
    )
  })
}
