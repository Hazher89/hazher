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
    var orb = document.querySelector(".hz-hero__orb");
    var float = document.getElementById("hzFloat");
    if (!orb) return;
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

  function initProductRail() {
    var rail = document.getElementById("hzRail");
    var track = document.getElementById("hzRailTrack");
    if (!rail || !track) return;

    var tiles = track.querySelectorAll(".hz-tile3d");
    tiles.forEach(function (tile) {
      var accent = tile.getAttribute("data-accent");
      if (accent) tile.style.setProperty("--accent", accent);
    });

    // Center first tile (DriftPro) on load
    requestAnimationFrame(function () {
      var first = tiles[0];
      if (!first) return;
      var left = first.offsetLeft - (rail.clientWidth - first.clientWidth) / 2;
      rail.scrollLeft = Math.max(0, left);
      updateTileTransforms();
    });

    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    var moved = false;

    function updateTileTransforms() {
      if (reduce) return;
      var railRect = rail.getBoundingClientRect();
      var center = railRect.left + railRect.width / 2;
      tiles.forEach(function (tile) {
        var r = tile.getBoundingClientRect();
        var tileCenter = r.left + r.width / 2;
        var dist = (tileCenter - center) / railRect.width;
        var rot = Math.max(-18, Math.min(18, dist * -28));
        var scale = 1 - Math.min(0.18, Math.abs(dist) * 0.35);
        var y = Math.abs(dist) * 18;
        tile.style.transform =
          "perspective(1000px) rotateY(" +
          rot.toFixed(2) +
          "deg) translateY(" +
          y.toFixed(2) +
          "px) scale(" +
          scale.toFixed(3) +
          ")";
        tile.style.opacity = String(Math.max(0.45, 1 - Math.abs(dist) * 0.55));
      });
    }

    rail.addEventListener("scroll", function () {
      requestAnimationFrame(updateTileTransforms);
    }, { passive: true });

    window.addEventListener("resize", function () {
      requestAnimationFrame(updateTileTransforms);
    }, { passive: true });

    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add("is-dragging");
      try {
        rail.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
    });

    rail.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      rail.scrollLeft = startScroll - dx;
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove("is-dragging");
      if (moved) {
        // prevent click after drag
        var prevent = function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          rail.removeEventListener("click", prevent, true);
        };
        rail.addEventListener("click", prevent, true);
      }
    }

    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);

    // Gentle auto-nudge when idle (Apple-like living stage)
    if (!reduce) {
      var idle = 0;
      var dir = 1;
      setInterval(function () {
        if (dragging || document.hidden) return;
        idle += 1;
        if (idle < 8) return;
        var max = rail.scrollWidth - rail.clientWidth;
        if (max <= 0) return;
        if (rail.scrollLeft >= max - 2) dir = -1;
        if (rail.scrollLeft <= 2) dir = 1;
        rail.scrollLeft += dir * 0.6;
      }, 32);

      rail.addEventListener(
        "pointerdown",
        function () {
          idle = 0;
        },
        { passive: true }
      );
      rail.addEventListener(
        "wheel",
        function () {
          idle = 0;
        },
        { passive: true }
      );
    }

    updateTileTransforms();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFloatParallax();
    initHeroScroll();
    initProductRail();
  });
})();
