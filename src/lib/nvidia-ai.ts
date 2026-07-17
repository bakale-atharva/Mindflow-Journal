import 'server-only'
import OpenAI from 'openai'
import { getNvidiaAiConfig as getNvidiaAiConfiguration } from './nvidia-ai-config'

export function getNvidiaAiConfig() {
  const config = getNvidiaAiConfiguration()
  const apiKey = process.env.NVIDIA_API_KEY
  if (!config || !apiKey) return null

  return {
    ...config,
    client: new OpenAI({ apiKey, baseURL: 'https://integrate.api.nvidia.com/v1', maxRetries: 0 }),
  }
}
