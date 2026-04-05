(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle("nav-scrolled", window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initReveal() {
    if (reduceMotion) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  function initStaggerParents() {
    if (reduceMotion) {
      document.querySelectorAll("[data-stagger]").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var parents = document.querySelectorAll("[data-stagger]");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
    );
    parents.forEach(function (p) {
      io.observe(p);
    });
  }

  function initScrollProgress() {
    if (reduceMotion) return;
    var el = document.querySelector(".scroll-progress");
    if (!el) return;
    var ticking = false;
    function upd() {
      var root = document.documentElement;
      var max = root.scrollHeight - root.clientHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      el.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(upd);
        }
      },
      { passive: true }
    );
    upd();
  }

  function initParallax() {
    if (reduceMotion) return;
    var layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length) return;
    var ticking = false;
    function tick() {
      var y = window.scrollY;
      layers.forEach(function (el) {
        var s = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        el.style.transform = "translate3d(0, " + Math.round(y * s) + "px, 0)";
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );
    tick();
  }

  function initMobileNav() {
    var t = document.getElementById("navToggle");
    var l = document.getElementById("navLinks");
    if (!t || !l) return;
    t.addEventListener("click", function () {
      l.classList.toggle("is-open");
    });
    l.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        l.classList.remove("is-open");
      });
    });
  }

  function initYear() {
    var y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  }

  function initCookies() {
    var b = document.getElementById("cookieBanner");
    var k = "hazher_cookie_ok";
    var btn = document.getElementById("cookieAccept");
    if (b && !localStorage.getItem(k)) {
      requestAnimationFrame(function () {
        b.classList.add("is-visible");
      });
    }
    if (btn) {
      btn.addEventListener("click", function () {
        localStorage.setItem(k, "1");
        if (b) b.classList.remove("is-visible");
      });
    }
  }

  initNav();
  initReveal();
  initStaggerParents();
  initScrollProgress();
  initParallax();
  initMobileNav();
  initYear();
  initCookies();
})();
