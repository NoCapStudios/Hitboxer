import { app, BrowserWindow, ipcMain, dialog, screen } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, 
      nodeIntegration: true
    }
  });

// mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  mainWindow.loadURL("http://localhost:5173");
});

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

ipcMain.handle("get-screen-size", () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { width, height };
});

function getScreenSize() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { width, height };
}