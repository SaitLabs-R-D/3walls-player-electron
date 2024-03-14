
const updateButton = document.querySelector("button.update");

function update(e) {
  const win = window;
  updateButton.disabled = true
  updateButton.innerText = dictionary["he-il"].loading

  win.ipcRenderer.update();  
}
updateButton.addEventListener("click", update);

window.addEventListener("DOMContentLoaded", () => {
  const win = window;
  document.querySelector("p").innerHTML = dictionary["he-il"].comment;
  updateButton.innerText = dictionary["he-il"].download;
});


const dictionary = {
  "he-il": {
    comment: "קיימת גרסא חדשה, אנא עדכן כדי להמשיך",
    download: "הורדה",
    loading: "טוען",
  },
  "en-us": {
    comment: "A new version is available, please update.",
    download: "Download",
    loading: "Loading",
  },
};
