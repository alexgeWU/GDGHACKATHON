/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_SPOONACULAR_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
