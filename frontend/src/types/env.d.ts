// Universal Agent Platform - Environment Types
// This file provides type definitions for Vite environment variables

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_ELEVENLABS_API_KEY?: string
  readonly VITE_AZURE_SPEECH_KEY?: string
  readonly VITE_AZURE_SPEECH_REGION?: string
  readonly VITE_QDRANT_URL?: string
  readonly VITE_QDRANT_API_KEY?: string
  readonly VITE_ENABLE_DEMO_MODE?: string
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}