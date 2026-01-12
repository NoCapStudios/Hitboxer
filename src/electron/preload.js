const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");

contextBridge.exposeInMainWorld("electronAPI", {
  openImageDialog: () => ipcRenderer.invoke("open-image-dialog"),

  onAddImage: (cb) => ipcRenderer.on("menu:add-image", cb),
  offAddImage: (cb) => ipcRenderer.removeListener("menu:add-image", cb),
  
  onRemoveImage: (cb) => ipcRenderer.on("menu:remove-image", cb),
  offRemoveImage: (cb) => ipcRenderer.removeListener("menu:remove-image", cb),
  
  onOpenFolder: (cb) => ipcRenderer.on("menu:open-folder", cb),
  offOpenFolder: (cb) => ipcRenderer.removeListener("menu:open-folder", cb),
  
  loadImage: (filePath) => {
    const data = fs.readFileSync(filePath);
    const blob = new Blob([data], { type: "image/*" });
    return URL.createObjectURL(blob);
  },
});