import { contextBridge, ipcRenderer } from "electron";

const api = {
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke("open-external", url),
};

export type PreloadApi = typeof api;

contextBridge.exposeInMainWorld("api", api);
