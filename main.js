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
    icon: "./logo.ico",
    webPreferences: {
      preload: path.join(__dirname, "src/preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("./src/index.html");
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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
  async (event, absolutePath, data) => {
    data.forEach(async file => {
      await saveFiles(absolutePath + "/" + file.filename, file.embdedCode, file.videoId, event,data.indexOf(file) == data.length - 1);
    })
  }
);
ipcMain.handle("set-path", async (event, absolutePath) => {
  await savePath(absolutePath, event);
});

ipcMain.handle("get-path", async (event) => {
  event.sender.send("geting-path", await getPath());
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

async function saveFiles(filename, code, videoId, event, islAST) {
  var imagePath = "https://cdn.viqeo.tv/preview/" + videoId + ".jpg";
  const codeSource = await Axios({
    method: "GET",
    url: 'https://cdn.viqeo.tv/embed/?vid='+videoId,
  })
  if(codeSource.data.includes('preview highQuality')) imagePath = 'https://cdn.viqeo.tv/storage' + codeSource.data.split('preview highQuality')[0].split('<img src="https://cdn.viqeo.tv/storage')[1].replaceAll('" class="','')
  await fs.writeFile(
    filename + ".txt",
    code,
    { flag: "wx" },
    async function (err) {
      if (err) saveFiles(filename+' (1)', code, videoId, event, islAST);
      else {
        const response = await Axios({
          method: "GET",
          url: imagePath,
          responseType: "stream",
        });

        const w = response.data.pipe(fs.createWriteStream(filename + ".jpg"));
        w.on("finish", () => {
          if(islAST) {
            event.sender.send("asynchronous-message", "done")
          }
        });
      }
    }
  );
}

async function getPath() {
  const rsp = await Axios.get(
    "https://moviestream-2f6d0-default-rtdb.firebaseio.com/saving-file.json"
  );
  if(rsp.data) {
    const keys = Object.keys(rsp.data);
    return rsp.data[keys.pop()]["path"];
  }
  return "";
}

async function savePath(path, event) {
  await Axios.post(
    "https://moviestream-2f6d0-default-rtdb.firebaseio.com/saving-file.json",
    {
      path: path,
    }
  );
  event.sender.send("geting-path", path);
}
