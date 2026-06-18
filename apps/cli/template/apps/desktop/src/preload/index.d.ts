import type { PreloadApi } from "./index";

declare global {
  // biome-ignore lint/style/useConsistentTypeDefinitions: interface required for global Window augmentation
  interface Window {
    api: PreloadApi;
  }
}
