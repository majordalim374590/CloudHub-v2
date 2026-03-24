<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CloudHub Ultra</title>

<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

<style>
body {
  margin:0;
  background:#0a0a0a;
  color:white;
  font-family:sans-serif;
}
.container {
  padding:20px;
}
.card {
  display:inline-block;
  width:150px;
  margin:10px;
  cursor:pointer;
}
.card img {
  width:100%;
  border-radius:8px;
}
.player {
  position:fixed;
  inset:0;
  background:black;
  display:none;
  flex-direction:column;
}
video, iframe {
  width:100%;
  height:70vh;
}
.topbar {
  padding:10px;
}
button {
  padding:10px;
  background:red;
  border:none;
  color:white;
  cursor:pointer;
}
</style>
</head>

<body>

<div class="container">
  <h2>Anime</h2>
  <div id="anime-list"></div>
</div>

<div class="player" id="player">
  <div class="topbar">
    <button onclick="closePlayer()">Back</button>
    <span id="title"></span>
  </div>
  <div id="video-area"></div>
</div>

<script>
// =======================
// CONFIG
// =======================
const API = "https://consumet-api.onrender.com";
const SOURCES = [
  "https://vidsrc.me/embed/anime/",
  "https://vidsrc.xyz/embed/anime/",
  "https://2embed.cc/embed/"
];

// =======================
// LOAD ANIME LIST
// =======================
async function loadAnime() {
  let res = await fetch(API + "/anime/gogoanime/top-airing");
  let data = await res.json();

  let container = document.getElementById("anime-list");

  data.results.forEach(anime => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${anime.image}">
      <p>${anime.title}</p>
    `;

    div.onclick = () => loadEpisodes(anime.id, anime.title);

    container.appendChild(div);
  });
}

// =======================
// LOAD EPISODES
// =======================
async function loadEpisodes(id, title) {
  let res = await fetch(API + "/anime/gogoanime/info/" + id);
  let data = await res.json();

  let ep = data.episodes[0]; // first episode
  playAnime(id, ep.number, title);
}

// =======================
// SMART PLAYER
// =======================
async function playAnime(id, ep, title) {
  document.getElementById("player").style.display = "flex";
  document.getElementById("title").innerText = title;

  let area = document.getElementById("video-area");
  area.innerHTML = "Loading...";

  // try consumet stream first
  try {
    let res = await fetch(API + `/anime/gogoanime/watch/${id}-episode-${ep}`);
    let data = await res.json();

    let stream = data.sources.find(s => s.quality === "default") || data.sources[0];

    if (stream && stream.url.includes(".m3u8")) {
      let video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;

      area.innerHTML = "";
      area.appendChild(video);

      if (Hls.isSupported()) {
        let hls = new Hls();
        hls.loadSource(stream.url);
        hls.attachMedia(video);
      } else {
        video.src = stream.url;
      }

      return;
    }
  } catch(e) {}

  // fallback embeds
  for (let src of SOURCES) {
    let iframe = document.createElement("iframe");
    iframe.src = src + id + "?ep=" + ep;
    iframe.allowFullscreen = true;

    area.innerHTML = "";
    area.appendChild(iframe);

    await wait(3000);

    // if loads, stop trying others
    return;
  }

  area.innerHTML = "No source available.";
}

// =======================
// UTIL
// =======================
function closePlayer() {
  document.getElementById("player").style.display = "none";
  document.getElementById("video-area").innerHTML = "";
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// =======================
loadAnime();
</script>

</body>
</html>
