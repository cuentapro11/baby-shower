// =============================================================
// Invitación Baby Shower — lógica de interacción
// =============================================================

/* -------------------------------------------------------------
   1. CONFIGURACIÓN DEL EVENTO
   EDITAR estos valores con los datos reales antes de publicar.
------------------------------------------------------------- */
const EVENT = {
  // Fecha y hora exacta del evento (formato: AAAA-MM-DDTHH:MM:SS)
  dateISO: "2026-12-12T16:00:00",
  // Link real de Google Maps del salón
  mapsUrl: "https://maps.google.com/?q=Salon+La+Aurora+Santo+Domingo",
  // EDITAR: ID del video de YouTube que se usará como música de fondo.
  // Se obtiene de la URL del video, ej: youtube.com/watch?v=XXXXXXXXXXX
  musicVideoId: "ks689l5ohhw",
};

/* -------------------------------------------------------------
   2. CONTEO REGRESIVO
------------------------------------------------------------- */
function startCountdown() {
  const target = new Date(EVENT.dateISO).getTime();

  const elDays = document.getElementById("t-days");
  const elHours = document.getElementById("t-hours");
  const elMin = document.getElementById("t-min");
  const elSec = document.getElementById("t-sec");

  if (!elDays) return;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMin.textContent = "00";
      elSec.textContent = "00";
      clearInterval(timerId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMin.textContent = pad(minutes);
    elSec.textContent = pad(seconds);
  }

  tick();
  const timerId = setInterval(tick, 1000);
}

/* -------------------------------------------------------------
   2.5 MÚSICA DE FONDO (modal de bienvenida con/sin música)
   Mismo sistema que la invitación de boda: se precarga el player
   de YouTube oculto desde el inicio para que playVideo() se pueda
   ejecutar de forma síncrona dentro del click del invitado (esto
   es lo que exige iOS Safari para permitir audio/video).
------------------------------------------------------------- */
let isPlaying = false;
let player = null;
let playerReady = false;
let enableMusic = false;

function setupWelcomeModal() {
  const modal = document.getElementById("welcomeModal");
  const enterWithMusicBtn = document.getElementById("enterWithMusic");
  const enterWithoutMusicBtn = document.getElementById("enterWithoutMusic");

  if (!modal) return;

  function hideModal() {
    modal.style.display = "none";
  }

  if (enterWithMusicBtn) {
    enterWithMusicBtn.addEventListener("click", () => {
      enableMusic = true;
      hideModal();
      if (playerReady && player) {
        const musicPlayer = document.getElementById("musicPlayer");
        if (musicPlayer) musicPlayer.style.display = "flex";
        player.playVideo();
        isPlaying = true;
        updateMusicIcon();
      }
    });
  }

  if (enterWithoutMusicBtn) {
    enterWithoutMusicBtn.addEventListener("click", () => {
      enableMusic = false;
      hideModal();
    });
  }
}

function loadYouTubeAPI() {
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(script);
  window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
}

function initializeYouTubePlayer() {
  if (player) return; // evita crear el player dos veces

  player = new YT.Player("youtube-player", {
    height: "1",
    width: "1",
    videoId: EVENT.musicVideoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      loop: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      playlist: EVENT.musicVideoId,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function onPlayerReady(event) {
  playerReady = true;
  const musicToggle = document.getElementById("musicToggle");
  if (musicToggle) musicToggle.addEventListener("click", toggleMusic);

  enableMusicButton();

  if (enableMusic && !isPlaying) {
    const musicPlayer = document.getElementById("musicPlayer");
    if (musicPlayer) musicPlayer.style.display = "flex";
    event.target.playVideo();
    isPlaying = true;
    updateMusicIcon();
  }
}

// Habilita el botón "Ingresar con música" una vez el player está listo
// (o tras un tiempo máximo de espera, para no dejar al invitado atascado
// si YouTube tarda o falla en cargar).
function enableMusicButton() {
  const btn = document.getElementById("enterWithMusic");
  const label = document.getElementById("enterWithMusicLabel");
  if (btn && btn.disabled) btn.disabled = false;
  if (label) label.textContent = "Ingresar con música";
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
  }
  updateMusicIcon();
}

function onPlayerError() {
  const musicPlayer = document.getElementById("musicPlayer");
  if (musicPlayer) musicPlayer.style.display = "flex";
  isPlaying = false;
  updateMusicIcon();
  enableMusicButton();
}

function toggleMusic() {
  if (!player) return;
  if (isPlaying) {
    player.pauseVideo();
    isPlaying = false;
  } else {
    player.playVideo();
    isPlaying = true;
  }
  updateMusicIcon();
}

function updateMusicIcon() {
  const volumeIcon = document.getElementById("volumeIcon");
  if (!volumeIcon) return;

  if (isPlaying) {
    volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#ffffff" stroke="#4d7aa8" stroke-width="1"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08" stroke="#ffffff" stroke-width="2"></path>
      <circle cx="6.5" cy="12" r="1" fill="#cba667"/>
    `;
  } else {
    volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#ffffff" stroke="#4d7aa8" stroke-width="1"></polygon>
      <line x1="19" y1="9" x2="17" y2="11" stroke="#e6796b" stroke-width="2"></line>
      <line x1="17" y1="9" x2="19" y2="11" stroke="#e6796b" stroke-width="2"></line>
      <circle cx="6.5" cy="12" r="1" fill="#e6796b"/>
    `;
  }
}

/* -------------------------------------------------------------
   3. LINK DE GOOGLE MAPS
------------------------------------------------------------- */
function setupMapsLink() {
  const link = document.getElementById("maps-link");
  if (link) link.href = EVENT.mapsUrl;
}

/* -------------------------------------------------------------
   4. CARRUSEL DE GALERÍA
------------------------------------------------------------- */
function setupCarousel() {
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  if (!track) return;

  const slides = Array.from(track.children);
  let current = 0;

  // construir puntos del carrusel
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "cdot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Ir a foto " + (i + 1));
    dot.addEventListener("click", () => { goTo(i); restartAutoplay(); });
    dotsWrap.appendChild(dot);
  });

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    Array.from(dotsWrap.children).forEach((d, i) =>
      d.classList.toggle("active", i === current)
    );
  }

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    update();
  }

  // avance automático cada 2.5s (se reinicia si el usuario interactúa)
  let autoplayId = null;
  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => goTo(current + 1), 2500);
  }
  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }
  function restartAutoplay() {
    startAutoplay();
  }
  startAutoplay();

  prevBtn.addEventListener("click", () => { goTo(current - 1); restartAutoplay(); });
  nextBtn.addEventListener("click", () => { goTo(current + 1); restartAutoplay(); });

  // deslizar con el dedo (touch) en móvil
  let startX = 0;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });
  track.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 40) { goTo(current - 1); restartAutoplay(); }
    else if (diff < -40) { goTo(current + 1); restartAutoplay(); }
  });
}

/* -------------------------------------------------------------
   5. CONFIRMACIÓN DE ASISTENCIA (RSVP)
------------------------------------------------------------- */
function setupRSVP() {
  const yesBtn = document.getElementById("rsvpYes");
  const feedback = document.getElementById("rsvpFeedback");

  if (!yesBtn) return;

  yesBtn.addEventListener("click", () => {
    yesBtn.classList.add("is-selected");
    feedback.textContent = "¡Gracias por confirmar! Te esperamos 💙";

    // Aquí se podría enviar la respuesta a una base de datos
    // (por ejemplo Supabase) si se quiere llevar un conteo real
    // de invitados. Por ahora solo queda guardado en esta sesión.
  });
}

/* -------------------------------------------------------------
   6. MODAL DE IDEAS DE REGALOS
------------------------------------------------------------- */
function setupGiftModal() {
  const openBtn = document.getElementById("giftBtn");
  const closeBtn = document.getElementById("closeGiftModal");
  const modal = document.getElementById("giftModal");

  if (!openBtn || !modal) return;

  openBtn.addEventListener("click", () => modal.classList.add("is-open"));
  closeBtn.addEventListener("click", () => modal.classList.remove("is-open"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("is-open");
  });
}

/* -------------------------------------------------------------
   7. NAVEGACIÓN POR PUNTOS LATERALES
------------------------------------------------------------- */
function setupDotsNav() {
  const dots = Array.from(document.querySelectorAll(".dot"));
  const sections = dots.map((d) =>
    document.getElementById(d.dataset.target)
  );

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      sections[i].scrollIntoView({ behavior: "smooth" });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = sections.indexOf(entry.target);
          dots.forEach((d, i) => d.classList.toggle("active", i === idx));
        }
      });
    },
    { threshold: 0.55 }
  );

  sections.forEach((s) => s && observer.observe(s));
}

/* -------------------------------------------------------------
   INICIO
------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  startCountdown();
  setupMapsLink();
  setupCarousel();
  setupRSVP();
  setupGiftModal();
  setupDotsNav();
  setupWelcomeModal();

  // Se precarga el player de YouTube desde el inicio (no en el click) para
  // que playVideo() pueda ejecutarse de forma síncrona dentro del gesto del
  // usuario en el botón "Ingresar con música". Esto es lo que exige iOS Safari.
  loadYouTubeAPI();

  // Salvaguarda: si por lo que sea el player no está listo en unos
  // segundos (red lenta, bloqueo, etc.), se habilita igual el botón para
  // no dejar al invitado atascado en el modal de bienvenida.
  setTimeout(enableMusicButton, 6000);
});
