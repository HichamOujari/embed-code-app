const path = window.location.pathname.split("/")
document.getElementById("setDefaultDirectory").value = path[0]+path.slice(1, -1).join("/")