(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))l(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&l(s)}).observe(document,{childList:!0,subtree:!0});function i(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function l(t){if(t.ep)return;t.ep=!0;const n=i(t);fetch(t.href,n)}})();const o=document.querySelector("input"),d=document.querySelector("button.start"),u=document.querySelector("button.dev");function a(r){const e=r.target.classList.contains("dev");window.ipcRenderer.submitToken(o.value,e),o.value=""}o.addEventListener("keyup",r=>{r.key==="Enter"&&o.value&&d.click()});d.addEventListener("click",a);u.addEventListener("click",a);window.addEventListener("DOMContentLoaded",()=>{const r=window;r.ipcRenderer.onSendToken(e=>{o.value=e}),r.ipcRenderer.onLocaleChange(e=>{document.querySelector(".intl__circle > img").src=`${e}.webp`,o.placeholder=c[e].placeholder,d.innerText=c[e].startBtn,u.innerText=c[e].startDevBtn,document.querySelector("p").innerHTML=c[e].comment})});const f=document.querySelectorAll(".intl__dropdown__item");f.forEach(r=>{r.addEventListener("click",()=>{const e=window,i=r.getAttribute("id");e.ipcRenderer.setIntl(i)})});const c={"he-il":{placeholder:"קוד שיעור",startBtn:"התחלת השיעור",startDevBtn:"בדיקת השיעור",comment:"לחץ ctrl+v בשדה שמעל"},"en-us":{placeholder:"Lesson Code",startBtn:"Start Lesson",startDevBtn:"Start Lesson (Dev)",comment:"Press ctrl+v in the field above"}};