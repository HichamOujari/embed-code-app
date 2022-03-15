const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveCodeId").addEventListener(
    "click",
    async function (event) {
      var absolutePath = document.getElementById("setDefaultDirectory").value;
      var embdedCode = document.getElementById("textareaId").value;
      var filename = document.getElementById("filenameId").value;
      if (absolutePath.length == 0) alert("Enter directory path");
      else {
        if (embdedCode.length == 0) alert("Enter your embed code");
        else {
          if (filename.length == 0) alert("Enter File name");
          else {
            const videoId = embdedCode
              .split('<iframe src="https://cdn.viqeo.tv/embed/?vid=')[1]
              .split('"')[0];
            document.getElementById("saveCodeId").setAttribute("disable", true);
            document.getElementById("waitid").style.display="block"
            ipcRenderer.invoke(
              "save-files",
              absolutePath,
              filename,
              embdedCode,
              videoId
            );
          }
        }
      }
    },
    false
  );
  ipcRenderer.on("asynchronous-message", function (evt, message) {
    alert(message);
    document.getElementById("saveCodeId").removeAttribute("disable");
    document.getElementById("waitid").style.display="none"
  });
});
