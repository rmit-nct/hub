export const models: {
  value: string;
  label: string;
  provider: string;
  description?: string;
  context?: number;
  disabled?: boolean;
}[] = [
  {
    value: 'gemini-3.1-pro-preview',
    label: 'gemini-3.1-pro-preview',
    provider: 'Google',
    description:
      'Gemini 3.1 Pro Preview is a multimodal reasoning model optimized for software engineering, agentic workflows, precise tool use, and complex multi-step tasks.',
    context: 1024 * 1024,
  },
  {
    value: 'gemini-2.5-pro-exp-03-25',
    label: 'gemini-2.5-pro-exp-03-25',
    provider: 'Google',
    description:
      'Gemini 2.5 Pro Exp 03-25 is a multimodal model that supports up to 1 million tokens and excels at long-context tasks.',
    context: 1024 * 1024,
  },
  {
    value: 'gemini-2.0-pro-exp-02-05',
    label: 'gemini-2.0-pro-exp-02-05',
    provider: 'Google',
    description:
      'Gemini 2.0 Pro Exp 02-05 is a multimodal model that supports up to 1 million tokens and excels at long-context tasks.',
    context: 1024 * 1024,
  },
  {
    value: 'gemini-3.6-flash',
    label: 'gemini-3.6-flash',
    provider: 'Google',
    description:
      'Gemini 3.6 Flash is Google’s latest workhorse multimodal model that balances speed and intelligence. It excels at agentic workflows, coding, multimodal reasoning, and long-context tasks with a 1M token context window and improved token efficiency.',
    context: 1024 * 1024,
  },
  {
    value: 'gemini-3.5-flash',
    label: 'gemini-3.5-flash',
    provider: 'Google',
    description:
      'Gemini 3.5 Flash is a multimodal model optimized for agentic execution, coding, long-horizon tasks, and complex workflows. It supports thinking and a 1M token context window.',
    context: 1024 * 1024,
  },
  {
    value: 'gemini-3.1-flash-lite',
    label: 'gemini-3.1-flash-lite',
    provider: 'Google',
    description:
      'Gemini 3.1 Flash-Lite is a low-latency, cost-effective multimodal model optimized for high-frequency lightweight tasks, data extraction, and high-volume workflows.',
    context: 1024 * 1024,
  },

  {
    value: 'imagen-3.0-generate-001',
    label: 'imagen-3.0-generate-001',
    provider: 'Google Vertex',
    description:
      'Imagen 3.0 helps you generate high-quality images from text descriptions.',
    disabled: true,
  },
  {
    value: 'imagen-3.0-fast-generate-001',
    label: 'imagen-3.0-fast-generate-001',
    provider: 'Google Vertex',
    description:
      'Imagen 3.0 helps you generate high-quality images from text descriptions.',
    disabled: true,
  },
  {
    value: 'qwen/qwen3.7-plus',
    label: 'Qwen 3.7 Plus',
    provider: 'Alibaba',
    description:
      'Qwen 3.7 Plus is a cost-effective multimodal model from Alibaba that supports text and image input. It excels at agentic workflows, coding, tool use, GUI interaction, and productivity tasks with a 1M token context window.',
    context: 1000000,
  },
  {
    value: 'XiaomiMiMo/MiMo-V2.5-Pro',
    label: 'Mimo V2.5 Pro',
    provider: 'Xiaomi',
    description:
      'MiMo V2.5 Pro is Xiaomi’s flagship 1.02T-parameter Mixture-of-Experts model (42B active) designed for demanding agentic workflows, complex software engineering, and long-horizon tasks spanning thousands of tool calls, with a 1M token context window.',
    context: 1024 * 1024,
  },
  {
    value: 'google/gemma-4-31B-it',
    label: 'gemma-4-31b',
    provider: 'Google Vertex',
    description:
      'Gemma 4 31B is Google’s open-weight multimodal model that handles text and image input with configurable thinking modes, native function-calling, native system prompt support, and a 256K token context window.',
    context: 256 * 1024,
  },
  {
    value: 'deepseek-ai/DeepSeek-V4-Pro',
    label: 'Deepseek V4 Pro',
    provider: 'Deepseek',
    description:
      'DeepSeek V4 Pro is a 1.6T-parameter (49B active) Mixture-of-Experts model designed for advanced reasoning, coding, and long-horizon agentic workflows. It features a hybrid attention architecture with three configurable reasoning modes (Non-think, Think High, Think Max) and a 1M token context window.',
    context: 1000000,
  },

  {
    value: 'claude-sonnet-5',
    label: 'claude-5-sonnet (latest)',
    provider: 'Anthropic',
    description:
      'Claude 5 Sonnet strikes the ideal balance between intelligence and speed—particularly for enterprise workloads. It delivers strong performance at a lower cost compared to its peers, and is engineered for high endurance in large-scale AI deployments.',
    context: 1000000,
    disabled: true,
  },
  {
    value: 'claude-haiku-4-5',
    label: 'claude-4.5-haiku',
    provider: 'Anthropic',
    description:
      'Claude 4.5 Haiku is a high-performance model that excels at generating high-quality text. It is ideal for tasks that require a high level of creativity and language understanding.',
    context: 200000,
    disabled: true,
  },

  {
    value: 'meta-llama/llama-4-scout-17b-16e-instruct',
    label: 'llama-4-scout',
    provider: 'Meta',
    description:
      'Llama 4 Scout is a natively multimodal 17B active parameter open-weight model by Meta with 16 experts, an industry-leading 10M token context window, and support for multilingual tasks, coding, tool-calling, and agentic workflows.',
    context: 10 * 1000 * 1000,
    disabled: true,
  },
  {
    value: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    label: 'llama-4-maverick',
    provider: 'Meta',
    description:
      'Llama 4 Maverick is a natively multimodal 17B active parameter open-weight model by Meta with 128 experts and 400B total parameters, excelling at reasoning, coding, image understanding, and agentic tasks with a 1M token context window.',
    context: 1000000,
    disabled: true,
  },

  {
    value: 'mistral-small',
    label: 'mistral-small',
    provider: 'Mistral',
    description:
      'Mistral Small is the ideal choice for simple tasks that one can do in bulk - like Classification, Customer Support, or Text Generation. It offers excellent performance at an affordable price point.',
    context: 32000,
    disabled: true,
  },
  {
    value: 'mistral-medium-3-5',
    label: 'mistral-medium-3.5',
    provider: 'Mistral',
    description:
      'Mistral Medium 3.5 is a frontier-class multimodal model optimized for agentic and coding use cases.',
    context: 256 * 1024,

  },
  {
    value: 'mistral-large',
    label: 'mistral-large',
    provider: 'Mistral',
    description:
      'Mistral Large is ideal for complex tasks that require large reasoning capabilities or are highly specialized - like Synthetic Text Generation, Code Generation, RAG, or Agents.',
    context: 32000,
    disabled: true,
  },
  {
    value: 'mistral-codestral',
    label: 'mistral-codestral',
    provider: 'Mistral',
    description:
      'Mistral Codestral 22B is an open-weight generative AI model explicitly designed for code generation tasks. It helps developers write and interact with code through a shared instruction and completion API endpoint. As it masters code and English, it can be used to design advanced AI applications for software developers.',
    context: 32000,
    disabled: true,
  },

  {
    value: 'gpt-oss-120b',
    label: 'gpt-oss-120b',
    provider: 'OpenAI',
    description:
      'GPT-OSS 120B is OpenAI’s most powerful open-weight reasoning model, featuring 117 billion total parameters, 5.1 billion active parameters, configurable reasoning effort, tool use, and structured output support.',
    context: 128 * 1024,
    disabled: true,
  },
  {
    value: 'hy3',
    label: 'Tencent Hy3',
    provider: 'Tencent',
    description:
      'Tencent Hy3 is a hybrid fast-and-slow-thinking Mixture-of-Experts model designed for reasoning, coding, long-context tasks, tool use, and agentic workflows.',
    context: 256 * 1024,
    disabled: true,
  },
].sort(
  // Sort by provider (ones that have all models disabled should be at the end)
  (a, b) => {
    if (a.disabled && b.disabled) return 0;
    if (a.disabled) return 1;
    if (b.disabled) return -1;
    return a.provider.localeCompare(b.provider);
  }
);

const fallbackModel = models.find((model) => !model.disabled);
export const defaultModel: Model | undefined =
  models.find(
    (model) =>
      model.value === 'gemini-3.1-pro-preview' && model.provider === 'Google'
  ) || fallbackModel;

export const providers: Provider[] = models.reduce((acc, model) => {
  if (!acc.includes(model.provider)) acc.push(model.provider);
  return acc;
}, [] as Provider[]);

export type Model = (typeof models)[number];
export type ModelName = Model['value'];

export type Provider = (typeof models)[number]['provider'];
