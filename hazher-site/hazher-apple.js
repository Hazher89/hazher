(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initAppleNavActive() {
    var path = window.location.pathname.replace(/\/$/, "");
    document.querySelectorAll(".nav-links a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.indexOf("mailto:") === 0) return;
      try {
        var u = new URL(href, window.location.href);
        var p = u.pathname.replace(/\/$/, "");
        if (p === path || (path.endsWith("/index.html") && p === path.replace(/\/index\.html$/, ""))) {
          a.classList.add("is-active");
        }
      } catch (e) {
        /* ignore */
      }
    });
  }

  function initScrollSpy() {
    if (reduceMotion) return;
    var sections = document.querySelectorAll(".apple-feature[id], .apple-bento[id]");
    var links = document.querySelectorAll('.doc-toc a[href^="#"], .apple-toc a[href^="#"]');
    if (!sections.length || !links.length) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (id) map[id] = a;
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id;
          links.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (s) {
      io.observe(s);
    });
  }

  function initHeroParallax() {
    if (reduceMotion) return;
    var icon = document.querySelector(".apple-hero__icon");
    if (!icon) return;
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(function () {
            var y = Math.min(window.scrollY * 0.15, 80);
            icon.style.transform = "translateY(" + y + "px)";
            ticking = false;
          });
        }
      },
      { passive: true }
    );
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  initAppleNavActive();
  initScrollSpy();
  initHeroParallax();
  initSmoothAnchors();
})();
