/* Asharas ambient motion: restrained, accessible, and compositor-friendly. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const saveData = navigator.connection?.saveData === true;

  if (reducedMotion.matches) return;
  if (saveData) {
    root.classList.add("motion-static");
    return;
  }

  root.classList.add("motion-enhanced");

  /* Cursor light follows through one shared animation loop, then sleeps. */
  if (finePointer.matches) {
    let targetX = innerWidth * 0.5;
    let targetY = innerHeight * 0.24;
    let currentX = targetX;
    let currentY = targetY;
    let pointerFrame = 0;

    const renderPointer = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      root.style.setProperty("--motion-pointer-x", `${currentX.toFixed(1)}px`);
      root.style.setProperty("--motion-pointer-y", `${currentY.toFixed(1)}px`);

      if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
        pointerFrame = requestAnimationFrame(renderPointer);
      } else {
        pointerFrame = 0;
      }
    };

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      body.classList.add("motion-pointer-active");
      if (!pointerFrame) pointerFrame = requestAnimationFrame(renderPointer);
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", () => {
      body.classList.remove("motion-pointer-active");
    });

    /* Small surfaces lean toward the pointer without moving layout. */
    const tiltSelector = ".pulse-stage, .mood-card, .trend-cover-box, .artist-card, .install-icon, .creator-visual";
    let activeTilt = null;
    let tiltFrame = 0;
    let tiltEvent = null;

    const resetTilt = (node) => {
      if (!node) return;
      node.style.setProperty("--motion-tilt-x", "0deg");
      node.style.setProperty("--motion-tilt-y", "0deg");
    };

    document.addEventListener("pointermove", (event) => {
      const next = event.target.closest?.(tiltSelector) || null;
      if (next !== activeTilt) {
        resetTilt(activeTilt);
        activeTilt = next;
        activeTilt?.classList.add("motion-tilt");
      }
      if (!activeTilt) return;
      tiltEvent = event;
      if (tiltFrame) return;

      tiltFrame = requestAnimationFrame(() => {
        tiltFrame = 0;
        const rect = activeTilt?.getBoundingClientRect();
        if (!rect || !tiltEvent) return;
        const x = (tiltEvent.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
        const y = (tiltEvent.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
        activeTilt.style.setProperty("--motion-tilt-x", `${(-y * 3.2).toFixed(2)}deg`);
        activeTilt.style.setProperty("--motion-tilt-y", `${(x * 3.2).toFixed(2)}deg`);
      });
    }, { passive: true });

    document.addEventListener("pointerout", (event) => {
      if (!activeTilt || activeTilt.contains(event.relatedTarget)) return;
      resetTilt(activeTilt);
      activeTilt = null;
    }, { passive: true });
  }

  /* Scroll drives only transform/opacity states to protect mobile smoothness. */
  let scrollFrame = 0;
  const renderScroll = () => {
    scrollFrame = 0;
    const top = Math.max(window.scrollY, 0);
    root.style.setProperty("--motion-orb-shift", `${Math.max(top * -0.045, -48).toFixed(1)}px`);
    root.style.setProperty("--motion-orb-shift-slow", `${Math.max(top * -0.025, -30).toFixed(1)}px`);
    body.classList.toggle("motion-scrolled", top > 18);
  };

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll);
  }, { passive: true });
  renderScroll();

  /* Sections reveal once. New search/library content is included automatically. */
  const revealSelector = [
    ".pulse-card",
    "#view-home > .section-head",
    ".row-head",
    ".trend-row",
    ".creator-section",
    ".install-section",
    ".list-head",
    ".artist-grid",
    ".queue-section",
    ".playlists",
  ].join(",");
  const observed = new WeakSet();
  let revealIndex = 0;

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-visible");
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8%", threshold: 0.08 })
    : null;

  const observeReveal = (scope = document) => {
    const nodes = [];
    if (scope.matches?.(revealSelector)) nodes.push(scope);
    scope.querySelectorAll?.(revealSelector).forEach((node) => nodes.push(node));
    nodes.forEach((node) => {
      if (observed.has(node)) return;
      observed.add(node);
      node.classList.add("motion-reveal");
      node.style.setProperty("--motion-reveal-delay", `${Math.min((revealIndex++ % 4) * 45, 135)}ms`);
      if (revealObserver) revealObserver.observe(node);
      else node.classList.add("motion-visible");
    });
  };

  observeReveal();
  new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) observeReveal(node);
    }));
  }).observe(document.querySelector(".app") || body, { childList: true, subtree: true });
})();
