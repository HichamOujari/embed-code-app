const { ipcRenderer } = require("electron");
const {resolve} = require('path');
const Axios = require("axios");
window.addEventListener("DOMContentLoaded", async () => {
  ipcRenderer.invoke("get-path");
  document
    .getElementById("helloooo")
    .addEventListener("click", async function (e) {
      const path = document.getElementById("setDefaultDirectory").value;
      if (path.length == 0) alert("enter default directory");
      else {
        document.getElementById("setDefaultDirectory").value = path;
        ipcRenderer.invoke("set-path", path);
      }
    });

  document.getElementById("saveCodeId").addEventListener(
    "click",
    async function (event) {
      var absolutePath = document.getElementById("setDefaultDirectory").value;
      var dataCsv = document.getElementById("dataCsvId").files;
      if (absolutePath.length == 0) alert("Enter directory path");
      else {
        if (dataCsv.length == 0) alert("Selet your csv file");
        else {
          document.getElementById("saveCodeId").setAttribute("disable", true);
          document.getElementById("waitid").style.display = "block";
          var fr = new FileReader();
          fr.onload = function () {
            getData(fr.result, (data) => ipcRenderer.invoke(
              "save-files",
              absolutePath,
              data
            ))
          }
          fr.readAsText(dataCsv[0]);
        }
      }
    },
    false
  );


  document.getElementById("selectFolderId").addEventListener(
    "click",
    async function (event) {
      document.getElementById("directoryId").click();
    },
    false
  );

  document.getElementById("directoryId").addEventListener(
    "change",
    async function (event) {
      var doc = event.target.files[0];
      document.getElementById("setDefaultDirectory").value = doc.path.replaceAll(doc.name,'')
    },
    false
  );
  ipcRenderer.on("asynchronous-message", function (evt, message) {
    alert(message);
    document.getElementById("saveCodeId").removeAttribute("disable");
    document.getElementById("waitid").style.display = "none";
  });
  ipcRenderer.on("geting-path", function (evt, path) {
    document.getElementById("setDefaultDirectory").value = path
  });
});


function getData(data, call) {
  var embdedCodes = [];
  data = data.split('</div>\r\n\r\n');
  data.forEach((ele) => {
    let filenmae = ele.split(' -->\r\n')[0].replaceAll('<!-- ','');
    let embededCode = ele.split(' -->\r\n')[1];
    embededCode += (data.indexOf(ele) == data.length - 1)?'':'</div>';
    let videoId = embededCode
      .split('<iframe src="https://cdn.viqeo.tv/embed/?vid=')[1]
      .split('"')[0]
    embdedCodes.push({
      embdedCode: embededCode,
      filename: filenmae,
      videoId: videoId
    })
  })
  call(embdedCodes)
}