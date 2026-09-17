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
    dot.addEventListener("click", () => goTo(i));
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

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  // deslizar con el dedo (touch) en móvil
  let startX = 0;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });
  track.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 40) goTo(current - 1);
    else if (diff < -40) goTo(current + 1);
  });
}

/* -------------------------------------------------------------
   5. CONFIRMACIÓN DE ASISTENCIA (RSVP)
------------------------------------------------------------- */
function setupRSVP() {
  const yesBtn = document.getElementById("rsvpYes");
  const noBtn = document.getElementById("rsvpNo");
  const feedback = document.getElementById("rsvpFeedback");

  if (!yesBtn || !noBtn) return;

  function select(choice) {
    yesBtn.classList.toggle("is-selected", choice === "yes");
    noBtn.classList.toggle("is-selected", choice === "no");

    feedback.textContent =
      choice === "yes"
        ? "¡Gracias por confirmar! Te esperamos 💙"
        : "Gracias por avisarnos, ¡te extrañaremos!";

    // Aquí se podría enviar la respuesta a una base de datos
    // (por ejemplo Supabase) si se quiere llevar un conteo real
    // de invitados. Por ahora solo queda guardado en esta sesión.
  }

  yesBtn.addEventListener("click", () => select("yes"));
  noBtn.addEventListener("click", () => select("no"));
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
});
