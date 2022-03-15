document.getElementById("setDefaultDirectory").innerHTML = '/Users/allah/Desktop/uploads'
  //window.location.pathname.split("/").slice(0, -1).join("/");
document.getElementById("defaultDirectory").addEventListener(
  "click",
  async function (event) {
    const folder = await window.showDirectoryPicker();
    console.log(folder);
  },
  false
);
