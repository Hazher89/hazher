(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initFloatParallax() {
    if (reduce) return;
    var stage = document.getElementById("hzFloat");
    if (!stage) return;
    var items = stage.querySelectorAll(".hz-float__item");
    if (!items.length) return;

    var rect = null;
    var raf = 0;
    var tx = 0;
    var ty = 0;

    function measure() {
      rect = stage.getBoundingClientRect();
    }

    function frame() {
      items.forEach(function (el, i) {
        var depth = ((i % 5) + 1) * 0.35;
        el.style.translate = tx * depth + "px " + ty * depth + "px";
      });
      raf = 0;
    }

    stage.addEventListener(
      "pointermove",
      function (e) {
        if (!rect) measure();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        tx = (e.clientX - cx) / 28;
        ty = (e.clientY - cy) / 36;
        if (!raf) raf = requestAnimationFrame(frame);
      },
      { passive: true }
    );

    stage.addEventListener(
      "pointerleave",
      function () {
        tx = 0;
        ty = 0;
        if (!raf) raf = requestAnimationFrame(frame);
      },
      { passive: true }
    );

    window.addEventListener("resize", measure, { passive: true });
    measure();
  }

  function initHeroScroll() {
    if (reduce) return;
    var hero = document.querySelector(".hz-hero");
    var orb = document.querySelector(".hz-hero__orb");
    var float = document.getElementById("hzFloat");
    if (!hero || !orb) return;
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 420);
          orb.style.transform = "scale(" + (1 + y / 2000) + ")";
          if (float) float.style.opacity = String(Math.max(0.25, 1 - y / 480));
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFloatParallax();
    initHeroScroll();
  });
})();
