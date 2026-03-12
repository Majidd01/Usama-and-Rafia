document.addEventListener('DOMContentLoaded', () => {
  // ===================================
  // CONFIGURATION - Change these values
  // ===================================
  const WEDDING_DATE = new Date('2026-04-04T18:00:00');

  // ===================================
  // BACKGROUND PARTICLES
  // ===================================
  function createBgParticles() {
    const overlay = document.getElementById('envelope-overlay');
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'bg-particle';
      const size = Math.random() * 4 + 1;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 5 + 's';
      p.style.animationDuration = Math.random() * 4 + 4 + 's';
      overlay.appendChild(p);
    }
  }
  createBgParticles();

  // ===================================
  // ENVELOPE OPEN INTERACTION
  // ===================================
  const envelopeWrapper = document.getElementById('envelope-wrapper'); // has class envelope-container
  const waxSeal = document.getElementById('wax-seal'); // id wax-seal, class heart-seal
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const mainContent = document.getElementById('main-content');
  let isOpened = false;

  // Click on wax seal or envelope to open
  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  envelopeWrapper.addEventListener('click', () => {
    openEnvelope();
  });

  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    // Add opened class — flaps fold open via CSS transitions
    envelopeWrapper.classList.add('opened');

    // Force videos to play on user interaction (fixes mobile autoplay issues)
    const videos = document.querySelectorAll('.hero-video');
    videos.forEach(video => {
      video.play().catch(e => console.log("Video autoplay blocked:", e));
    });

    // After animation (2.5s), transition to hide overlay
    setTimeout(() => {
      envelopeOverlay.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      mainContent.classList.add('visible');
    }, 2500);
  }

  // ===================================
  // COUNTDOWN TIMER
  // ===================================
  function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      document.getElementById('days').textContent = '0';
      document.getElementById('hours').textContent = '0';
      document.getElementById('minutes').textContent = '0';
      document.getElementById('seconds').textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ===================================
  // SCRATCH CARDS
  // ===================================
  const scratchCards = document.querySelectorAll('.scratch-card');
  let revealedCount = 0;
  const totalCards = 3;

  scratchCards.forEach((card) => {
    const canvas = card.querySelector('.scratch-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let hasRevealed = false;

    function initCanvas() {
      const rect = card.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Create gradient scratch surface
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#c9a84c');
      gradient.addColorStop(0.3, '#ddc07a');
      gradient.addColorStop(0.5, '#c9a84c');
      gradient.addColorStop(0.7, '#b8933e');
      gradient.addColorStop(1, '#c9a84c');

      ctx.fillStyle = gradient;

      // Round rect
      const radius = 16;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();

      // Add shimmer/texture
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < canvas.width; i += 4) {
        for (let j = 0; j < canvas.height; j += 4) {
          if (Math.random() > 0.5) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(i, j, 2, 2);
          }
        }
      }
      ctx.globalAlpha = 1;

      // "Scratch here" text
      ctx.font = '600 11px Montserrat, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('✦ SCRATCH HERE ✦', canvas.width / 2, canvas.height / 2 + 4);
    }

    // Wait for card to be visible, then init
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(initCanvas, 100);
          observer.disconnect();
        }
      });
    });
    observer.observe(card);

    // Also init on window resize
    window.addEventListener('resize', () => {
      if (!hasRevealed) initCanvas();
    });

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    function checkReveal() {
      if (hasRevealed) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparent = 0;
      let total = 0;
      for (let i = 3; i < imageData.data.length; i += 16) {
        total++;
        if (imageData.data[i] === 0) transparent++;
      }
      if (transparent / total > 0.20) {
        hasRevealed = true;
        // Fade out perfectly
        canvas.style.transition = 'opacity 0.6s ease';
        canvas.style.opacity = '0';
        
        card.classList.add('revealed');
        revealedCount++;
        if (revealedCount === totalCards) {
          setTimeout(triggerFlowerShower, 800);
        }
      }
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      if (e.touches) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    });

    canvas.addEventListener('mouseup', () => {
      isDrawing = false;
      checkReveal();
    });

    canvas.addEventListener('mouseleave', () => {
      isDrawing = false;
      checkReveal();
    });

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDrawing = true;
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!isDrawing) return;
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      isDrawing = false;
      checkReveal();
    });
  });

  // ===================================
  // FLOWER SHOWER
  // ===================================
  function triggerFlowerShower() {
    const container = document.getElementById('flower-shower');
    container.style.display = 'block';

    const petalColors = [
      '#f5c6d0', '#f7d1d9', '#fce4ec', '#f8bbd0',
      '#e8b4b8', '#f0c0c8', '#fdd5e0', '#f9e0e6',
      '#c45b6e', '#d4778a', '#e89ca8', '#f2b5bf',
      '#daa0a6', '#c9a84c', '#e8d5a3', '#ffffff', 
      '#ffd700', '#ffeb3b', '#ffc107', '#fff8dc'
    ];

    const totalPetals = 250;

    for (let i = 0; i < totalPetals; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';

        const size = Math.random() * 20 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 5 + 4; // 4 to 9 seconds falling
        const delay = Math.random() * 2;
        const drift = (Math.random() - 0.5) * 200; // Drift left or right
        const rotation = Math.random() * 720 - 360;
        const color = petalColors[Math.floor(Math.random() * petalColors.length)];

        petal.style.cssText = `
          width: ${size}px;
          height: ${size * 1.3}px;
          left: ${left}%;
          top: -10%;
          background: ${color};
          opacity: 0;
          pointer-events: none; /* remove hover since they fall away now */
          z-index: 100;
        `;

        container.appendChild(petal);

        // Falling animation
        petal.animate([
          { transform: `translateX(0) rotate(0deg) scale(0.5)`, opacity: 0 },
          { opacity: 0.9, offset: 0.1 },
          { opacity: 0.8, offset: 0.9 },
          { transform: `translate(${drift}px, 120vh) rotate(${rotation}deg) scale(1)`, opacity: 0 }
        ], {
          duration: duration * 1000,
          delay: delay * 1000,
          fill: 'forwards',
          easing: 'linear'
        });

        // Remove petal after it falls
        setTimeout(() => petal.remove(), (duration + delay) * 1000 + 100);

    }

    // Hide container after all petals are done falling
    setTimeout(() => {
      container.style.display = 'none';
    }, 12000);
  }

  // ===================================
  // SCROLL ANIMATIONS
  // ===================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-section, .venue-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    fadeObserver.observe(el);
  });
});
