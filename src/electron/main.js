import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createMenu(mainWindow) {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Add Image",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            mainWindow.webContents.send("menu:add-image");
          },
        },
        {
          label: "Remove Image",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            mainWindow.webContents.send("menu:remove-image");
          },
        },
        { type: "separator" },
        {
          role: "quit",
        },
      ],
    },
    {
      label: "Folder",
      submenu: [
        {
          label: "Open Folder",
          click: () => {
            console.log("Menu: open-folder clicked");
            mainWindow.webContents.send("menu:open-folder");
          },
        },
        {
          label: "Clear Folder",
          click: () => {
            mainWindow.webContents.send("menu:clear-folder");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
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
  createMenu(mainWindow)
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
