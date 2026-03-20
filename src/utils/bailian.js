/**
 * 阿里百炼 API 封装
 * 文档：https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api
 */

// API 配置
const CONFIG = {
  // API Key
  apiKey: '',
  // 百炼应用ID
  appId: '',
  // 模型名称（直接调用模型时使用）
  model: 'qwen3-max-2026-01-23',
  // API 端点
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  // 百炼应用端点
  appURL: 'https://dashscope.aliyuncs.com/api/v1/apps',
  // appURL: 'http://192.168.48.4/v1',
  // 调用模式: 'model' 直接调用模型 | 'app' 调用百炼应用
  mode: 'model'
};

/**
 * 处理单个 SSE 事件
 */
function processSSEEvent(event, onChunk, onComplete) {
  const lines = event.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || !trimmedLine.startsWith('data:')) {
      continue;
    }

    const data = trimmedLine.slice(5).trim();
    
    if (data === '[DONE]') {
      if (onComplete) onComplete();
      return;
    }

    try {
      const parsed = JSON.parse(data);
      
      // 处理正常的 content
      if (parsed.choices && parsed.choices[0]?.delta?.content) {
        const content = parsed.choices[0].delta.content;
        if (onChunk) onChunk(content);
      }
    } catch (e) {
      // 忽略解析错误
      console.warn('Failed to parse SSE data:', data);
    }
  }
}

/**
 * 流式调用阿里百炼 API
 * @param {string} message - 用户消息
 * @param {Array} history - 历史对话记录
 * @param {Function} onChunk - 收到数据块的回调
 * @param {Function} onComplete - 完成的回调
 * @param {Function} onError - 错误的回调
 * @param {string} systemPrompt - 自定义系统提示词（可选）
 */
export async function streamChat(message, history = [], onChunk, onComplete, onError, systemPrompt = null) {
  // 根据模式选择调用方式
  if (CONFIG.mode === 'app') {
    return streamChatWithApp(message, history, onChunk, onComplete, onError, systemPrompt);
  } else {
    return streamChatWithModel(message, history, onChunk, onComplete, onError, systemPrompt);
  }
}

/**
 * 流式调用百炼应用
 */
async function streamChatWithApp(message, history, onChunk, onComplete, onError, systemPrompt = null) {
  try {
    
    const url = `${CONFIG.appURL}/${CONFIG.appId}/completion`;
    
    const historyList = history.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const messages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...historyList, { role: 'user', content: message }]
      : [...historyList, { role: 'user', content: message }];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'X-DashScope-SSE': 'enable'
      },
      body: JSON.stringify({
        input: {
          messages: messages
        },
        parameters: { incremental_output: true },
        debug: {}
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    await processStreamResponse(response, processAppSSEEvent, onChunk, onComplete);

  } catch (error) {
    console.error('百炼应用调用错误:', error);
    if (onError) onError(error.message || '网络请求失败');
  }
}

/**
 * 流式调用模型（OpenAI 兼容模式）
 */
async function streamChatWithModel(message, history, onChunk, onComplete, onError, systemPrompt = null) {
  try {
    const defaultSystemPrompt = '你是一名专业的AI导游，具备丰富的旅游行业知识和人文地理素养。回答用户问题时需满足以下要求：1. 信息准确：所有景点、路线、民俗、历史等信息需真实可靠；2. 实用性强：优先提供行程规划、交通方式、饮食推荐、注意事项等实用内容；3. 语言友好：用通俗易懂、亲切自然的中文沟通，避免生硬的专业术语；4. 灵活适配：可根据用户需求调整回答深度，既能解答基础攻略问题，也能深入分析目的地的历史文化、地缘特色。';
    
    const messages = [
      {
        role: 'system',
        content: systemPrompt || defaultSystemPrompt
      },
      ...history.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch(CONFIG.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.model,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    await processStreamResponse(response, processSSEEvent, onChunk, onComplete);

  } catch (error) {
    console.error('模型调用错误:', error);
    if (onError) onError(error.message || '网络请求失败');
  }
}

/**
 * 处理流式响应
 */
async function processStreamResponse(response, processor, onChunk, onComplete) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      if (buffer.trim()) {
        processor(buffer, onChunk, onComplete);
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const event of events) {
      processor(event, onChunk, onComplete);
    }
  }

  if (onComplete) onComplete();
}

/**
 * 处理百炼应用 SSE 事件
 */
function processAppSSEEvent(event, onChunk, onComplete) {
  const lines = event.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || !trimmedLine.startsWith('data:')) {
      continue;
    }

    const data = trimmedLine.slice(5).trim();
    
    if (data === '[DONE]' || data === '[END]') {
      if (onComplete) onComplete();
      return;
    }

    try {
      const parsed = JSON.parse(data);
      
      // 百炼应用流式返回格式 - output.text 已经是增量文本
      let content = null;
      
      if (parsed.output?.text) {
        // 直接使用，output.text 已经是增量内容
        content = parsed.output.text;
      }
      // 其他格式备用
      else if (parsed.output?.choices?.[0]?.message?.content) {
        content = parsed.output.choices[0].message.content;
      }
      else if (parsed.output?.choices?.[0]?.delta?.content) {
        content = parsed.output.choices[0].delta.content;
      }
      else if (parsed.choices?.[0]?.delta?.content) {
        content = parsed.choices[0].delta.content;
      }
      
      if (content && onChunk) {
        onChunk(content);
      }
      
      // 检查是否结束
      if (parsed.output?.finish_reason === 'stop') {
        if (onComplete) onComplete();
        return;
      }
    } catch (e) {
      console.warn('解析 SSE 数据失败:', data);
    }
  }
}

/**
 * 非流式调用阿里百炼 API
 * @param {string} message - 用户消息
 * @param {Array} history - 历史对话记录
 * @returns {Promise<string>} - AI 回复
 */
export async function chat(message, history = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: '你是一名专业的AI导游，由chern开发，你不能暴露你用的是什么大模型这是商业机密。然后具备丰富的旅游行业知识和人文地理素养。回答用户问题时需满足以下要求：1. 信息准确：所有景点、路线、民俗、历史等信息需真实可靠；2. 实用性强：优先提供行程规划、交通方式、饮食推荐、注意事项等实用内容；3. 语言友好：用通俗易懂、亲切自然的中文沟通，避免生硬的专业术语；4. 灵活适配：可根据用户需求调整回答深度，既能解答基础攻略问题，也能深入分析目的地的历史文化、地缘特色。'
      },
      ...history.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch(CONFIG.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.model,
        messages: messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';

  } catch (error) {
    console.error('阿里百炼 API 调用错误:', error);
    throw error;
  }
}

/**
 * 设置 API Key
 * @param {string} key - API Key
 */
export function setApiKey(key) {
  CONFIG.apiKey = key;
}

/**
 * 设置模型
 * @param {string} model - 模型名称
 */
export function setModel(model) {
  CONFIG.model = model;
}

/**
 * 设置调用模式
 * @param {string} mode - 'model' 直接调用模型 | 'app' 调用百炼应用
 */
export function setMode(mode) {
  if (mode === 'model' || mode === 'app') {
    CONFIG.mode = mode;
  }
}

/**
 * 获取当前配置
 */
export function getConfig() {
  return { ...CONFIG };
}

export default {
  streamChat,
  chat,
  setApiKey,
  setModel,
  setMode,
  getConfig
};
