const canvas = document.querySelector("#petals");
const ctx = canvas.getContext("2d");
const buttons = document.querySelectorAll(".contact a");
const orb = document.querySelector(".orb");

let petals = [];
let pointer = {
  x: -9999,
  y: -9999,
  vx: 0,
  vy: 0
};

let lastPointer = {
  x: -9999,
  y: -9999
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createPetal(startAbove = false) {
  return {
    x: Math.random() * window.innerWidth,
    y: startAbove ? -40 : Math.random() * window.innerHeight,
    size: 6 + Math.random() * 14,
    speed: 0.35 + Math.random() * 1.05,
    drift: -0.35 + Math.random() * 0.7,
    spin: Math.random() * Math.PI * 2,
    spinSpeed: -0.025 + Math.random() * 0.05,
    opacity: 0.35 + Math.random() * 0.48,
    color:
      Math.random() > 0.5
        ? "255, 94, 188"
        : "168, 131, 255"
  };
}

function createPetals() {
  if (prefersReducedMotion) {
    petals = [];
    return;
  }

  const count = Math.min(90, Math.max(36, Math.floor(window.innerWidth / 12)));
  petals = Array.from({ length: count }, () => createPetal(false));
}

function drawPetal(petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.spin);

  const gradient = ctx.createRadialGradient(
    0,
    0,
    1,
    0,
    0,
    petal.size
  );

  gradient.addColorStop(0, `rgba(255, 255, 255, ${petal.opacity})`);
  gradient.addColorStop(0.38, `rgba(${petal.color}, ${petal.opacity})`);
  gradient.addColorStop(1, `rgba(${petal.color}, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    petal.size * 0.42,
    petal.size,
    0.35,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

function updatePetal(petal) {
  const dx = petal.x - pointer.x;
  const dy = petal.y - pointer.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const radius = 135;

  if (distance > 0 && distance < radius) {
    const force = (1 - distance / radius) * 2.4;

    petal.x += (dx / distance) * force + pointer.vx * 0.025;
    petal.y += (dy / distance) * force + pointer.vy * 0.025;
  }

  petal.y += petal.speed;
  petal.x += petal.drift + Math.sin(petal.y * 0.012) * 0.25;
  petal.spin += petal.spinSpeed;

  if (
    petal.y > window.innerHeight + 50 ||
    petal.x < -60 ||
    petal.x > window.innerWidth + 60
  ) {
    Object.assign(petal, createPetal(true));
  }
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  petals.forEach((petal) => {
    updatePetal(petal);
    drawPetal(petal);
  });

  pointer.vx *= 0.88;
  pointer.vy *= 0.88;

  requestAnimationFrame(animate);
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;

  pointer.vx = event.clientX - lastPointer.x;
  pointer.vy = event.clientY - lastPointer.y;

  lastPointer.x = event.clientX;
  lastPointer.y = event.clientY;
});

buttons.forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  });

  button.addEventListener("click", () => {
    button.classList.add("pressed");

    window.setTimeout(() => {
      button.classList.remove("pressed");
    }, 260);
  });
});

window.addEventListener("resize", () => {
  resizeCanvas();
  createPetals();
});

resizeCanvas();
createPetals();
animate();

window.addEventListener("pointermove", (event) => {
  if (!orb) return;

  const rect = orb.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;

  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 220) {
    orb.classList.add("active");

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    orb.style.setProperty("--orb-x", `${x}%`);
    orb.style.setProperty("--orb-y", `${y}%`);
  } else {
    orb.classList.remove("active");
  }
});
