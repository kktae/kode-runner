/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UPSTASH_REDIS_REST_URL?: string;
  readonly VITE_UPSTASH_REDIS_REST_TOKEN?: string;
  readonly VITE_PARTYKIT_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
