import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const nav = document.querySelector("nav");
  const header = document.querySelector(".header");
  const heroImg = document.querySelector(".hero-img");
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");

  const setCanvasSize = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    context.scale(pixelRatio, pixelRatio);
  };
  setCanvasSize();

  const frameCount = 207;
  const currentFrame = (index) =>
    `/frames/frame_${(index + 1).toString().padStart(4, "0")}.webp`;

  let images = [];
  let videoFrames = { frame: 0 };
  let imagesToLoad = frameCount;

  const onLoad = () => {
    imagesToLoad--;

    if (!imagesToLoad) {
      render();
      setupScrollTrigger();
    }
  };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.onload = onLoad;
    img.onerror = function () {
      onLoad.call(this);
    };
    img.src = currentFrame(i);
    images.push(img);
  }

  const render = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const img = images[videoFrames.frame];
    if (img && img.complete && img.naturalWidth > 0) {
      const imageAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, drawX, drawY;

      if (imageAspect > canvasAspect) {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imageAspect;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imageAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      }

      context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
  };

  const setupScrollTrigger = () => {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: `+=${window.innerHeight * 7}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        const animationProgress = Math.min(progress / 0.9, 1);
        const targetFrame = Math.round(animationProgress * (frameCount - 1));
        videoFrames.frame = targetFrame;
        render();

        if (progress <= 0.1) {
          const navProgress = progress / 0.1;
          const opacity = 1 - navProgress;
          gsap.set(nav, { opacity });
        } else {
          gsap.set(nav, { opacity: 0 });
        }

        if (progress <= 0.25) {
          const zProgress = progress / 0.25;
          const translateZ = zProgress * -500;

          let opacity = 1;
          if (progress >= 0.2) {
            const fadeProgress = Math.min((progress - 0.2) / (0.25 - 0.2), 1);
            opacity = 1 - fadeProgress;
          }

          gsap.set(header, {
            transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
            opacity,
          });
        } else {
          gsap.set(header, { opacity: 0 });
        }

        if (progress < 0.6) {
          gsap.set(heroImg, {
            transform: "translateZ(1000px)",
            opacity: 0,
          });
        } else if (progress >= 0.6 && progress <= 0.9) {
          const imgProgress = (progress - 0.6) / (0.9 - 0.6);
          const translateZ = 1000 - imgProgress * 1000;

          let opacity = 0;
          if (progress <= 0.8) {
            const opacityProgress = (progress - 0.6) / (0.8 - 0.6);
            opacity = opacityProgress;
          } else {
            opacity = 1;
          }

          gsap.set(heroImg, {
            transform: `translateZ(${translateZ}px)`,
            opacity,
          });
        } else {
          gsap.set(heroImg, {
            transform: "translateZ(0px)",
            opacity: 1,
          });
        }
      },
    });
  };

  window.addEventListener("resize", () => {
    setCanvasSize();
    render();
    ScrollTrigger.refresh();
  });

  // Wallet Modal Functionality
  const walletModal = document.getElementById("walletModal");
  const modalBackdrop = document.querySelector(".modal-backdrop");

  // Show modal when Connect Wallet is clicked
  connectWalletBtn.addEventListener("click", (e) => {
    e.preventDefault();
    walletModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  });

  // Hide modal when clicking backdrop or pressing Escape
  modalBackdrop.addEventListener("click", () => {
    walletModal.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && walletModal.classList.contains("active")) {
      walletModal.classList.remove("active");
      document.body.style.overflow = ""; // Restore scrolling
    }
  });

  // Add click handlers for wallet options (optional - for future functionality)
  const walletOptions = document.querySelectorAll(".wallet-option");
  walletOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Here you can add wallet connection logic
      console.log(
        "Wallet option clicked:",
        option.querySelector("h3").textContent
      );
      // For now, just close the modal
      walletModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Floating Notification Functionality
  class FloatingNotification {
    constructor() {
      this.notification = document.getElementById("floatingNotification");
      this.closeBtn = document.querySelector(".floating-close");
      this.backdrop = document.querySelector(".floating-backdrop");
      this.dismissBtn = document.querySelector(".floating-dismiss-btn");
      this.isDismissed = false;

      this.init();
    }

    init() {
      // Close button
      this.closeBtn.addEventListener("click", () => this.hide());

      // Backdrop click
      this.backdrop.addEventListener("click", () => this.hide());

      // Dismiss button
      this.dismissBtn.addEventListener("click", () => {
        this.isDismissed = true;
        this.hide();
      });

      // Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isVisible()) {
          this.hide();
        }
      });
    }

    show() {
      if (this.isDismissed) return;
      this.notification.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    hide() {
      this.notification.classList.remove("active");
      document.body.style.overflow = "";
    }

    isVisible() {
      return this.notification.classList.contains("active");
    }

    // Method to customize notification content
    setNotification(title, description, status = "Missing") {
      const titleEl = document.querySelector(".floating-notification-title");
      const descEl = document.querySelector(
        ".floating-notification-description"
      );
      const statusEl = document.querySelector(
        ".floating-notification-status span"
      );

      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = description;
      if (statusEl) statusEl.textContent = status;
    }

    // Reset dismissed state
    reset() {
      this.isDismissed = false;
    }
  }

  // Initialize floating notification
  const floatingNotification = new FloatingNotification();

  // Make floatingNotification globally available for testing
  window.floatingNotification = floatingNotification;

  // Example usage - you can call this from anywhere in your code:
  // popupCard.setContent('Success!', 'Your action was completed successfully.', 'success');
  // popupCard.show();
});
