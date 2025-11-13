// BrandMind AI - Perplexity AI Integration

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PerplexityRequest {
  model: string
  messages: PerplexityMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
}

export interface PerplexityResponse {
  id: string
  model: string
  created: number
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  choices: Array<{
    index: number
    finish_reason: string
    message: {
      role: string
      content: string
    }
  }>
}

/**
 * Call Perplexity API
 */
export async function callPerplexityAPI(
  apiKey: string,
  messages: PerplexityMessage[],
  options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<PerplexityResponse> {
  const {
    model = 'llama-3.1-sonar-large-128k-online',
    maxTokens = 2000,
    temperature = 0.7
  } = options

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: 0.9,
      stream: false
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API error: ${response.status} - ${error}`)
  }

  return await response.json()
}

/**
 * Generate marketing content using Perplexity
 */
export async function generateMarketingContent(
  apiKey: string,
  businessType: string,
  contentType: string,
  context: string,
  tone: string = 'professional'
): Promise<string> {
  const systemPrompt = `أنت مساعد ذكاء تسويقي متخصص في إنشاء محتوى تسويقي احترافي بالعربية.
المهمة: إنشاء محتوى ${contentType} لنشاط تجاري من نوع ${businessType}.
النبرة المطلوبة: ${tone}
الإرشادات:
- استخدم اللغة العربية الفصحى المبسطة
- اجعل المحتوى جذاباً ومناسباً لمنصات التواصل الاجتماعي
- أضف هاشتاجات مناسبة إذا لزم الأمر
- اجعل الرسالة واضحة ومباشرة
- استخدم الإيموجي بشكل مناسب لإضافة حيوية`

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context }
  ]

  const response = await callPerplexityAPI(apiKey, messages, {
    temperature: 0.8,
    maxTokens: 1000
  })

  return response.choices[0].message.content
}

/**
 * Generate social media post
 */
export async function generateSocialPost(
  apiKey: string,
  businessName: string,
  businessType: string,
  topic: string,
  platform: string,
  tone: string = 'friendly'
): Promise<{content: string; hashtags: string[]}> {
  const platformGuidelines = {
    instagram: 'محتوى جذاب بصرياً، استخدم الهاشتاجات بكثرة (5-10)، أضف دعوة للتفاعل',
    facebook: 'محتوى تفصيلي أكثر، قصص شخصية، أسئلة للتفاعل',
    twitter: 'محتوى مختصر وسريع (280 حرف)، هاشتاجات قليلة (1-2)',
    tiktok: 'محتوى شبابي وترفيهي، تحديات، موسيقى',
    linkedin: 'محتوى مهني، إحصائيات، رؤى صناعية'
  }

  const systemPrompt = `أنت خبير في إنشاء محتوى لمنصة ${platform}.
اتبع هذه الإرشادات: ${platformGuidelines[platform as keyof typeof platformGuidelines] || 'محتوى عام'}
النبرة: ${tone}
نوع النشاط: ${businessType}
اسم النشاط: ${businessName}`

  const userPrompt = `أنشئ منشور جذاب عن: ${topic}

تنسيق الرد:
المحتوى: [اكتب المحتوى هنا]
الهاشتاجات: [#هاشتاج1 #هاشتاج2 #هاشتاج3]`

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const response = await callPerplexityAPI(apiKey, messages, {
    temperature: 0.8,
    maxTokens: 800
  })

  const result = response.choices[0].message.content

  // Parse content and hashtags
  const contentMatch = result.match(/المحتوى:\s*(.+?)(?=الهاشتاجات:|$)/s)
  const hashtagsMatch = result.match(/الهاشتاجات:\s*(.+?)$/s)

  const content = contentMatch ? contentMatch[1].trim() : result
  const hashtagsText = hashtagsMatch ? hashtagsMatch[1] : ''
  const hashtags = hashtagsText
    .split(/[\s,]+/)
    .filter(tag => tag.startsWith('#'))
    .map(tag => tag.replace('#', ''))

  return { content, hashtags: hashtags.length > 0 ? hashtags : ['تسويق', businessType] }
}

/**
 * Generate ad copy
 */
export async function generateAdCopy(
  apiKey: string,
  businessName: string,
  productService: string,
  targetAudience: string,
  goal: string
): Promise<{headline: string; body: string; cta: string}> {
  const systemPrompt = `أنت خبير في كتابة إعلانات تسويقية احترافية بالعربية.
متخصص في إنشاء نسخ إعلانية تحقق معدلات تحويل عالية.`

  const userPrompt = `أنشئ إعلان تسويقي احترافي:
- اسم النشاط: ${businessName}
- المنتج/الخدمة: ${productService}
- الجمهور المستهدف: ${targetAudience}
- الهدف: ${goal}

تنسيق الرد:
العنوان: [عنوان جذاب قصير]
المحتوى: [نص الإعلان الرئيسي]
الدعوة للإجراء: [CTA قوية]`

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const response = await callPerplexityAPI(apiKey, messages, {
    temperature: 0.7,
    maxTokens: 600
  })

  const result = response.choices[0].message.content

  const headlineMatch = result.match(/العنوان:\s*(.+?)$/m)
  const bodyMatch = result.match(/المحتوى:\s*(.+?)(?=الدعوة للإجراء:|$)/s)
  const ctaMatch = result.match(/الدعوة للإجراء:\s*(.+?)$/s)

  return {
    headline: headlineMatch ? headlineMatch[1].trim() : 'عنوان الإعلان',
    body: bodyMatch ? bodyMatch[1].trim() : result,
    cta: ctaMatch ? ctaMatch[1].trim() : 'اطلب الآن'
  }
}

/**
 * Chat with AI assistant
 */
export async function chatWithAI(
  apiKey: string,
  messages: PerplexityMessage[],
  businessContext?: {
    name: string
    type: string
    description?: string
  }
): Promise<{response: string; tokensUsed: number}> {
  let systemPrompt = `أنت BrandMind AI، مساعد ذكاء تسويقي متخصص في مساعدة الأنشطة التجارية على إدارة تسويقها الرقمي.
تتحدث العربية بطلاقة وتقدم نصائح تسويقية احترافية.`

  if (businessContext) {
    systemPrompt += `\n\nمعلومات النشاط التجاري:
- الاسم: ${businessContext.name}
- النوع: ${businessContext.type}
${businessContext.description ? `- الوصف: ${businessContext.description}` : ''}`
  }

  const messagesWithSystem: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages
  ]

  const response = await callPerplexityAPI(apiKey, messagesWithSystem, {
    temperature: 0.7,
    maxTokens: 1500
  })

  return {
    response: response.choices[0].message.content,
    tokensUsed: response.usage.total_tokens
  }
}

/**
 * Analyze trends
 */
export async function analyzeTrends(
  apiKey: string,
  industry: string,
  region: string = 'Saudi Arabia'
): Promise<string> {
  const systemPrompt = `أنت محلل اتجاهات تسويقية متخصص في السوق العربي والخليجي.
مهمتك تحليل الاتجاهات الحالية وتقديم رؤى قابلة للتنفيذ.`

  const userPrompt = `قدم تحليل شامل للاتجاهات التسويقية الحالية في:
- الصناعة: ${industry}
- المنطقة: ${region}

اذكر:
1. أهم 5 اتجاهات حالية
2. الهاشتاجات الرائجة
3. نصائح للاستفادة من هذه الاتجاهات
4. التحديات المحتملة`

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const response = await callPerplexityAPI(apiKey, messages, {
    temperature: 0.7,
    maxTokens: 2000
  })

  return response.choices[0].message.content
}

/**
 * Generate content ideas
 */
export async function generateContentIdeas(
  apiKey: string,
  businessType: string,
  count: number = 10
): Promise<string[]> {
  const systemPrompt = `أنت خبير في توليد أفكار محتوى إبداعية للتسويق الرقمي.`

  const userPrompt = `اقترح ${count} أفكار محتوى مبتكرة لنشاط تجاري من نوع ${businessType}.
قدم كل فكرة في سطر واحد، بدون أرقام أو نقاط.`

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const response = await callPerplexityAPI(apiKey, messages, {
    temperature: 0.9,
    maxTokens: 1000
  })

  const ideas = response.choices[0].message.content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[\d\-\.\)]+\s*/, '').trim())
    .slice(0, count)

  return ideas
}
