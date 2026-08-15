(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  function initCursor() {
    if (reduce || !fine) return;
    var cur = document.getElementById("hzCursor");
    if (!cur) return;
    var x = 0;
    var y = 0;
    var cx = 0;
    var cy = 0;
    var raf = 0;

    function loop() {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cur.style.left = cx + "px";
      cur.style.top = cy + "px";
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener(
      "pointermove",
      function (e) {
        x = e.clientX;
        y = e.clientY;
        cur.classList.add("is-on");
      },
      { passive: true }
    );

    document.querySelectorAll("a, button, [data-magnetic]").forEach(function (el) {
      el.addEventListener("pointerenter", function () {
        cur.classList.add("is-hot");
      });
      el.addEventListener("pointerleave", function () {
        cur.classList.remove("is-hot");
      });
    });

    raf = requestAnimationFrame(loop);
  }

  function initMagnetic() {
    if (reduce || !fine) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + dx * 0.18 + "px," + dy * 0.22 + "px) scale(1.03)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  function initNoise() {
    var canvas = document.getElementById("hzNoise");
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var size = 96;
    canvas.width = size;
    canvas.height = size;
    var img = ctx.createImageData(size, size);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 40;
    }
    ctx.putImageData(img, 0, 0);
  }

  function initHeroParallax() {
    if (reduce) return;
    var hero = document.querySelector(".hz-hero");
    var logo = document.getElementById("hzHeroLogo");
    var field = document.querySelector(".hz-hero__field");
    if (!hero || !logo) return;
    var ticking = false;

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 520);
          var p = y / 520;
          logo.style.transform = "scale(" + (1 - p * 0.12) + ") translateY(" + p * -40 + "px)";
          logo.style.opacity = String(Math.max(0.15, 1 - p * 1.1));
          if (field) field.style.opacity = String(Math.max(0, 1 - p * 1.4));
          ticking = false;
        });
      },
      { passive: true }
    );

    if (fine) {
      hero.addEventListener(
        "pointermove",
        function (e) {
          var r = hero.getBoundingClientRect();
          var nx = (e.clientX - r.left) / r.width - 0.5;
          var ny = (e.clientY - r.top) / r.height - 0.5;
          logo.style.translate = nx * 18 + "px " + ny * 12 + "px";
          if (field) field.style.translate = nx * -10 + "px " + ny * -8 + "px";
        },
        { passive: true }
      );
      hero.addEventListener(
        "pointerleave",
        function () {
          logo.style.translate = "0 0";
          if (field) field.style.translate = "0 0";
        },
        { passive: true }
      );
    }
  }

  function initScrollHint() {
    var btn = document.getElementById("hzScrollHint");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var stage = document.getElementById("stage");
      if (stage) stage.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  }

  function initProductSpotlight() {
    document.querySelectorAll(".hz-product").forEach(function (row) {
      row.addEventListener(
        "pointermove",
        function (e) {
          var r = row.getBoundingClientRect();
          row.style.setProperty("--mx", e.clientX - r.left + "px");
          row.style.setProperty("--my", e.clientY - r.top + "px");
        },
        { passive: true }
      );
    });
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
        var rot = Math.max(-22, Math.min(22, dist * -34));
        var scale = 1 - Math.min(0.2, Math.abs(dist) * 0.4);
        var y = Math.abs(dist) * 22;
        tile.style.transform =
          "perspective(1200px) rotateY(" +
          rot.toFixed(2) +
          "deg) translateY(" +
          y.toFixed(2) +
          "px) scale(" +
          scale.toFixed(3) +
          ")";
        tile.style.opacity = String(Math.max(0.4, 1 - Math.abs(dist) * 0.6));
      });
    }

    rail.addEventListener(
      "scroll",
      function () {
        requestAnimationFrame(updateTileTransforms);
      },
      { passive: true }
    );
    window.addEventListener(
      "resize",
      function () {
        requestAnimationFrame(updateTileTransforms);
      },
      { passive: true }
    );

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

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove("is-dragging");
      if (moved) {
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

    if (!reduce) {
      var idle = 0;
      var dir = 1;
      setInterval(function () {
        if (dragging || document.hidden) return;
        idle += 1;
        if (idle < 10) return;
        var max = rail.scrollWidth - rail.clientWidth;
        if (max <= 0) return;
        if (rail.scrollLeft >= max - 2) dir = -1;
        if (rail.scrollLeft <= 2) dir = 1;
        rail.scrollLeft += dir * 0.55;
      }, 32);

      ["pointerdown", "wheel", "touchstart"].forEach(function (ev) {
        rail.addEventListener(
          ev,
          function () {
            idle = 0;
          },
          { passive: true }
        );
      });
    }

    updateTileTransforms();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCursor();
    initMagnetic();
    initNoise();
    initHeroParallax();
    initScrollHint();
    initProductSpotlight();
    initProductRail();
  });
})();
