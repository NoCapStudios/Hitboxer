const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");

contextBridge.exposeInMainWorld("electronAPI", {
  openImageDialog: () => ipcRenderer.invoke("open-image-dialog"),

  loadImage: (filePath) => {
    const data = fs.readFileSync(filePath);
    const blob = new Blob([data], { type: "image/*" });
    return URL.createObjectURL(blob);
  },
});