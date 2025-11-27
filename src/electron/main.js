import { app, BrowserWindow, ipcMain, dialog, screen } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      hardwareAcceleration: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });
  mainWindow.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})

app.on("window-all-closed", function () {
  if (process.platform !== 'darwin') app.quit();
})

ipcMain.handle("open-image-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp"] }
    ]
  });

  if (result.canceled) return null;
  return result.filePaths[0];
});
