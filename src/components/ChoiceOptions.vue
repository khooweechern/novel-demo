<template>
  <div class="choices-section card">
    <h3 class="choices-title">
      <span class="title-icon">🔮</span>
      下一步，故事将如何发展？
    </h3>
    
    <div class="choice-options">
      <button 
        v-for="(opt, i) in options" 
        :key="i" 
        class="choice-btn" 
        @click="chooseOption(opt)"
        :disabled="isGenerating"
      >
        <span class="choice-letter">{{ String.fromCharCode(65 + i) }}</span>
        <span class="choice-text">{{ opt.text.replace(/^[A-C]\.\s*/, '') }}</span>
      </button>
    </div>
    
    <div class="divider"></div>
    
    <div class="custom-input-section">
      <label class="custom-label">或者输入你的独特想法</label>
      <div class="custom-input">
        <input 
          v-model="localCustomChoice"
          type="text" 
          placeholder="描述你想要的故事走向..." 
          @keyup.enter="submitCustomChoice"
          :disabled="isGenerating"
        />
        <button 
          class="btn btn-primary" 
          @click="submitCustomChoice"
          :disabled="isGenerating || !localCustomChoice.trim()"
        >
          <span>✨</span> 提交
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  options: {
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
  }
})

const emit = defineEmits([
  'choose',
  'submit-custom',
  'update:custom-choice'
])

const localCustomChoice = ref(props.customChoice)

watch(() => props.customChoice, (newValue) => {
  localCustomChoice.value = newValue
})

watch(localCustomChoice, (newValue) => {
  emit('update:custom-choice', newValue)
})

function chooseOption(option) {
  if (props.isGenerating) return
  emit('choose', option)
}

function submitCustomChoice() {
  if (props.isGenerating || !localCustomChoice.value.trim()) return
  emit('submit-custom')
}
</script>

<style scoped>
.choices-section {
  padding: 24px;
}

.choices-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  font-size: 20px;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: var(--bg-sidebar);
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
}

.choice-btn:hover:not(:disabled) {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.choice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--gradient-primary);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.choice-text {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.5;
}

.divider {
  margin: 24px 0;
}

.custom-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.custom-input {
  display: flex;
  gap: 12px;
}

.custom-input input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 15px;
  transition: var(--transition);
}

.custom-input input:focus {
  outline: none;
  border-color: var(--primary);
}

.custom-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .choices-section {
    padding: 16px;
  }
  
  .custom-input {
    flex-direction: column;
  }
  
  .custom-input .btn {
    width: 100%;
  }
}
</style>
