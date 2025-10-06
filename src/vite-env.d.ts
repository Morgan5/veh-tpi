/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string
  readonly VITE_HUGGINGFACE_API_KEY: string
  readonly VITE_PLAYHT_API_KEY: string
  readonly VITE_PLAYHT_USER_ID: string
  readonly VITE_STORAGE_TYPE: string
  readonly VITE_AWS_ACCESS_KEY_ID: string
  readonly VITE_AWS_SECRET_ACCESS_KEY: string
  readonly VITE_AWS_BUCKET_NAME: string
  readonly VITE_AWS_REGION: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_API_KEY: string
  readonly VITE_CLOUDINARY_API_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
