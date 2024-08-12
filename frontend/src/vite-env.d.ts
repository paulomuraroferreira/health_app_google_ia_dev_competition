/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_EMULATOR: string;
  readonly VITE_DISEASE_PROBABILITY_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
