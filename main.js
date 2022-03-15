// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const Axios = require("axios").default;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    icon: './logo.ico',
    webPreferences: {
      preload: path.join(__dirname, "src/preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("./src/index.html");
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle(
  "save-files",
  async (event, absolutePath, filename, code, videoId) => {
    await saveFiles(absolutePath + "/" + filename, code, videoId, event);
  }
);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

async function saveFiles(filename, code, videoId, event) {
  await fs.writeFile(
    filename + ".txt",
    code,
    { flag: "wx" },
    async function (err) {
      if (err)
        event.sender.send(
          "asynchronous-message",
          "File already exist! change the name"
        );
      else {
        const response = await Axios({
          method: "GET",
          url: "https://cdn.viqeo.tv/preview/" + videoId + ".jpg",
          responseType: "stream",
        });

        const w = response.data.pipe(fs.createWriteStream(filename + ".jpg"));
        w.on("finish", () =>
          event.sender.send("asynchronous-message", "done")
        );
      }
    }
  );
}
