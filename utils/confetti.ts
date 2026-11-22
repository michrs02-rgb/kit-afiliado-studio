import confetti from "canvas-confetti";

export function triggerShopeeConfetti() {
  if (typeof window === "undefined") return;

  // Shopee colors: Orange, Red-Orange, Gold, White
  const colors = ["#ee4d2d", "#ff5722", "#ffca28", "#ffffff"];

  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.8 },
    colors,
  });

  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.8 },
    colors,
  });
}

export function triggerGoalCelebration() {
  if (typeof window === "undefined") return;

  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: ["#ee4d2d", "#ff9800", "#ffd54f"],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: ["#ee4d2d", "#ff9800", "#ffd54f"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
