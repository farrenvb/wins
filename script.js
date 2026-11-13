// ---- Edit these to change the track ----
const TRACK = {
  src: "lagu.mp3",      // your audio file
  cover: "winston.jpg",  // your cover image
  title: "Toy Story",
  artist: "Winston Bugil",
};
// ----------------------------------------

const audio = new Audio(TRACK.src);
audio.preload = "metadata";
audio.volume = 0.8;

const $ = (id) => document.getElementById(id);
const player = $("player");
const playBtn = $("play");
const seek = $("seek");
const volume = $("volume");
const currentEl = $("current");
const durationEl = $("duration");
const loopBtn = $("loop");
const muteBtn = $("mute");
const errorEl = $("error");

$("cover").src = TRACK.cover;
$("title").textContent = TRACK.title;
$("artist").textContent = TRACK.artist;
document.title = `${TRACK.title} – ${TRACK.artist}`;

const fmt = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

let seeking = false;

const setProgress = (pct) => player.style.setProperty("--progress", pct + "%");
const setVolumeFill = () =>
  player.style.setProperty("--vol", (audio.muted ? 0 : audio.volume) * 100 + "%");

function togglePlay() {
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}
playBtn.addEventListener("click", togglePlay);

audio.addEventListener("play", () => {
  player.classList.add("playing");
  playBtn.setAttribute("aria-label", "Pause");
});
audio.addEventListener("pause", () => {
  player.classList.remove("playing");
  playBtn.setAttribute("aria-label", "Play");
});
audio.addEventListener("ended", () => {
  player.classList.remove("playing");
  seek.value = 0;
  setProgress(0);
  currentEl.textContent = fmt(0);
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = fmt(audio.duration);
});
audio.addEventListener("timeupdate", () => {
  if (seeking || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  seek.value = pct;
  setProgress(pct);
  currentEl.textContent = fmt(audio.currentTime);
});

// seeking
seek.addEventListener("input", () => {
  seeking = true;
  const pct = parseFloat(seek.value);
  setProgress(pct);
  if (audio.duration) currentEl.textContent = fmt((pct / 100) * audio.duration);
});
seek.addEventListener("change", () => {
  if (audio.duration) audio.currentTime = (parseFloat(seek.value) / 100) * audio.duration;
  seeking = false;
});

// skip
const skip = (s) => {
  if (!audio.duration) return;
  audio.currentTime = Math.min(Math.max(audio.currentTime + s, 0), audio.duration);
};
$("back").addEventListener("click", () => skip(-10));
$("forward").addEventListener("click", () => skip(10));

// loop
loopBtn.addEventListener("click", () => {
  audio.loop = !audio.loop;
  loopBtn.setAttribute("aria-pressed", audio.loop);
});

// volume + mute
volume.addEventListener("input", () => {
  audio.volume = parseFloat(volume.value);
  audio.muted = audio.volume === 0;
  muteBtn.classList.toggle("muted", audio.muted);
  setVolumeFill();
});
muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.classList.toggle("muted", audio.muted);
  setVolumeFill();
});

// keyboard: space = play/pause, arrows = skip 5s
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  if (e.code === "ArrowRight") skip(5);
  if (e.code === "ArrowLeft") skip(-5);
});

// helpful errors
audio.addEventListener("error", () => {
  errorEl.hidden = false;
  errorEl.textContent = `Couldn't load "${TRACK.src}". Check that the file is in the same folder and the name matches.`;
});
$("cover").addEventListener("error", () => {
  $("cover").alt = `${TRACK.cover} not found`;
});

setVolumeFill();