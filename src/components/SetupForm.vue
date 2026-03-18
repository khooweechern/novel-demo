<template>
  <div class="setup-stage">
    <div class="stage-nav" v-if="showBackButton">
      <button class="btn btn-ghost" @click="goBack">
        <span>←</span> 返回书架
      </button>
    </div>
    <h2 class="page-title">设定故事基础</h2>
    <p class="form-hint">带 * 为必填项，其他为可选项，填写越详细，AI 生成的故事越精彩</p>
    
    <form @submit.prevent="submitForm" class="setup-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <h3 class="section-title">📖 基本信息</h3>
        <div class="form-row">
          <div class="form-group">
            <label>小说名称 *</label>
            <input v-model="novel.title" type="text" placeholder="例如：《星尘旅人》" required />
          </div>
          <div class="form-group">
            <label>小说风格</label>
            <select v-model="novel.style">
              <option value="">请选择风格</option>
              <option value="玄幻仙侠">玄幻仙侠</option>
              <option value="都市言情">都市言情</option>
              <option value="悬疑推理">悬疑推理</option>
              <option value="科幻未来">科幻未来</option>
              <option value="历史武侠">历史武侠</option>
              <option value="奇幻冒险">奇幻冒险</option>
              <option value="恐怖惊悚">恐怖惊悚</option>
              <option value="轻松搞笑">轻松搞笑</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 人物设定 -->
      <div class="form-section">
        <h3 class="section-title">👤 人物设定</h3>
        <div class="form-row">
          <div class="form-group">
            <label>主角名字 *</label>
            <input v-model="novel.protagonist" type="text" placeholder="例如：林夜" required />
          </div>
          <div class="form-group">
            <label>主角性格</label>
            <input v-model="novel.protagonistPersonality" type="text" placeholder="例如：冷静、内敛、重情重义" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>主角动机</label>
            <input v-model="novel.protagonistMotivation" type="text" placeholder="例如：寻找失踪的亲人、复仇、追求力量" />
          </div>
          <div class="form-group">
            <label>成长方向</label>
            <input v-model="novel.protagonistGrowth" type="text" placeholder="例如：从懦弱到勇敢、从自私到无私" />
          </div>
        </div>
        <div class="form-group">
          <label>配角设定</label>
          <textarea v-model="novel.characters" rows="3" placeholder="描述重要配角，如：导师、伙伴、对手、爱人等，可包含名字和简短描述"></textarea>
        </div>
      </div>

      <!-- 环境设定 -->
      <div class="form-section">
        <h3 class="section-title">🌍 环境设定</h3>
        <div class="form-row">
          <div class="form-group">
            <label>时间背景</label>
            <input v-model="novel.timeSetting" type="text" placeholder="例如：架空古代、现代都市、未来3000年" />
          </div>
          <div class="form-group">
            <label>地点设定</label>
            <input v-model="novel.locationSetting" type="text" placeholder="例如：修仙界、现代都市、星际联邦" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>社会背景</label>
            <input v-model="novel.socialBackground" type="text" placeholder="例如：门派林立、现代都市、星际战争时代" />
          </div>
          <div class="form-group">
            <label>故事氛围</label>
            <select v-model="novel.atmosphere">
              <option value="">请选择氛围</option>
              <option value="紧张刺激">紧张刺激</option>
              <option value="温馨治愈">温馨治愈</option>
              <option value="神秘诡异">神秘诡异</option>
              <option value="热血激昂">热血激昂</option>
              <option value="轻松幽默">轻松幽默</option>
              <option value="悲伤沉重">悲伤沉重</option>
              <option value="浪漫唯美">浪漫唯美</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 情节设定 -->
      <div class="form-section">
        <h3 class="section-title">📜 情节设定</h3>
        <div class="form-group">
          <label>故事大纲 *</label>
          <textarea v-model="novel.outline" rows="4" placeholder="简述故事的起承转合，包括开端、发展、高潮方向..." required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>核心冲突</label>
            <input v-model="novel.coreConflict" type="text" placeholder="例如：主角与命运的对抗、正邪之战" />
          </div>
          <div class="form-group">
            <label>高潮预设</label>
            <input v-model="novel.climaxPreset" type="text" placeholder="例如：最终决战、真相揭露、生死抉择" />
          </div>
        </div>
      </div>

      <!-- 主题设定 -->
      <div class="form-section">
        <h3 class="section-title">💡 主题设定</h3>
        <div class="form-group">
          <label>核心主题</label>
          <select v-model="novel.theme">
            <option value="">请选择主题</option>
            <option value="成长蜕变">成长蜕变</option>
            <option value="爱情">爱情</option>
            <option value="友情">友情</option>
            <option value="复仇">复仇</option>
            <option value="探索未知">探索未知</option>
            <option value="正义与邪恶">正义与邪恶</option>
            <option value="人性探讨">人性探讨</option>
            <option value="自由与束缚">自由与束缚</option>
            <option value="命运抗争">命运抗争</option>
            <option value="家国情怀">家国情怀</option>
          </select>
        </div>
        <div class="form-group">
          <label>主题阐述</label>
          <textarea v-model="novel.themeDescription" rows="2" placeholder="你想通过故事传达什么思想或情感？"></textarea>
        </div>
      </div>

      <!-- 语言与结构 -->
      <div class="form-section">
        <h3 class="section-title">✍️ 语言与结构</h3>
        <div class="form-row">
          <div class="form-group">
            <label>叙事结构</label>
            <select v-model="novel.narrativeStructure">
              <option value="">请选择结构</option>
              <option value="顺叙">顺叙（按时间顺序）</option>
              <option value="倒叙">倒叙（从结局开始）</option>
              <option value="插叙">插叙（穿插回忆）</option>
              <option value="多线叙事">多线叙事</option>
            </select>
          </div>
          <div class="form-group">
            <label>文风特点</label>
            <select v-model="novel.writingStyle">
              <option value="">请选择文风</option>
              <option value="简洁明快">简洁明快</option>
              <option value="细腻唯美">细腻唯美</option>
              <option value="幽默诙谐">幽默诙谐</option>
              <option value="深沉厚重">深沉厚重</option>
              <option value="热血激昂">热血激昂</option>
              <option value="诗意浪漫">诗意浪漫</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>对话风格</label>
          <select v-model="novel.dialogueStyle">
            <option value="">请选择对话风格</option>
            <option value="古风典雅">古风典雅</option>
            <option value="现代口语">现代口语</option>
            <option value="幽默风趣">幽默风趣</option>
            <option value="简洁有力">简洁有力</option>
            <option value="诗意含蓄">诗意含蓄</option>
          </select>
        </div>
      </div>

      <div class="submit-section">
        <button type="submit" class="btn btn-primary btn-lg">
          <span>✨</span> 开始创作第一章
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  novel: {
    type: Object,
    required: true
  },
  showBackButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'submit',
  'back'
])

const localNovel = ref({ ...props.novel })

watch(() => props.novel, (newNovel) => {
  localNovel.value = { ...newNovel }
}, { deep: true })

function submitForm() {
  if (!localNovel.value.title || !localNovel.value.protagonist) {
    alert('请填写小说名称和主角名字！')
    return
  }
  emit('submit', localNovel.value)
}

function goBack() {
  emit('back')
}
</script>

<style scoped>
.setup-stage {
  animation: fadeIn 0.3s ease;
}

.stage-nav {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.form-hint {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}

.setup-form .form-section {
  background: var(--bg-card);
  border-radius: var(--border-radius);
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.setup-form .form-group {
  margin-bottom: 16px;
}

.setup-form .form-group:last-child {
  margin-bottom: 0;
}

.setup-form .form-row {
  display: flex;
  gap: 16px;
}

.setup-form .form-row .form-group {
  flex: 1;
}

.setup-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.setup-form input,
.setup-form textarea,
.setup-form select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  box-sizing: border-box;
  transition: var(--transition);
  background: var(--bg-card);
  color: var(--text-primary);
}

.setup-form input:focus,
.setup-form textarea:focus,
.setup-form select:focus {
  outline: none;
  border-color: var(--primary);
}

.setup-form input::placeholder,
.setup-form textarea::placeholder {
  color: var(--text-muted);
}

.setup-form select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.setup-form textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.6;
}

.submit-section {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 600px) {
  .setup-form .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .setup-form .form-section {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
