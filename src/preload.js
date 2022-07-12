const { ipcRenderer } = require("electron");
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
  var spliter = '</div>';
  var embdedCodes = [];
  data = data.split('\n<script');
  data.forEach((ele) => {
    if (data.indexOf(ele) != 0) {
      let embededCode = '<script' + ele.split(spliter)[0] + '</div>';
      //embededCode = embededCode.replaceAll('""', '"')
      let filenmae = ele.split(spliter)[1].replaceAll('\r', '');
      filenmae = filenmae.replaceAll('\n\n<!-- ','').replaceAll(' -->','')
      let videoId = embededCode
        .split('<iframe src="https://cdn.viqeo.tv/embed/?vid=')[1]
        .split('"')[0]
      embdedCodes.push({
        embdedCode: embededCode,
        filename: filenmae,
        videoId: videoId
      })
    }
  })
  call(embdedCodes)
}