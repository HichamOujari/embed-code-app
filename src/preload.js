const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveCodeId").addEventListener(
    "click",
    async function (event) {
      var absolutePath = document.getElementById(
        "setDefaultDirectory"
      ).innerHTML;
      var embdedCode = document.getElementById("textareaId").value;
      var filename = document.getElementById("filenameId").value;
      if (embdedCode.length == 0) alert("Enter your embed code");
      else {
        if (filename.length == 0) alert("Enter File name");
        else {
          const videoId = embdedCode
            .split('<iframe src="https://cdn.viqeo.tv/embed/?vid=')[1]
            .split('"')[0];
          ipcRenderer.invoke(
            "save-files",
            absolutePath,
            filename,
            embdedCode,
            videoId
          );
        }
      }
    },
    false
  );
  ipcRenderer.on("asynchronous-message", function (evt, message) {
    alert(message);
  });
});
