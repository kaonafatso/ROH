/* ============================================================
   ROH — shared interactions.
   Small, quiet, deliberate. Nothing shouts.
   ============================================================ */
(function () {
  "use strict";

  var fine = window.matchMedia("(pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav ---------- */
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav-links");

  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && links) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        burger.classList.remove("open");
        links.classList.remove("open");
      }
    });
  }

  /* ---------- Intersection reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal, .verse, .develop, .plate, .m-line").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- Manifesto lines stagger ---------- */
  document.querySelectorAll(".manifesto").forEach(function (block) {
    var lines = block.querySelectorAll(".m-line");
    lines.forEach(function (line, i) {
      line.style.transitionDelay = (i * 0.18) + "s";
    });
  });

  /* ---------- Scramble / decode text ---------- */
  var GLYPHS = "RØH#%§†‡/\\*+=?[]{}|^<>";
  function scramble(el) {
    var final = el.dataset.scramble;
    if (!final) return;
    var total = 26;
    var start = performance.now();
    function frame(t) {
      var p = Math.min((t - start) / (total * 16), 1);
      var reveal = Math.floor(p * final.length);
      var out = "";
      for (var i = 0; i < final.length; i++) {
        if (final[i] === " ") { out += " "; continue; }
        out += i < reveal ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = final;
    }
    requestAnimationFrame(frame);
  }
  var scIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        scramble(entry.target);
        scIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-scramble]").forEach(function (el) { scIO.observe(el); });

  /* ---------- Ember cursor trail ---------- */
  if (fine && !reduce) {
    var layer = document.createElement("div");
    layer.id = "ember-layer";
    document.body.appendChild(layer);
    document.addEventListener("mousemove", function (e) {
      var now = Date.now();
      if (e.target && e.target.closest && e.target.closest("video, .product-cta")) return;
      if (now - (window._lastEmber || 0) < 70) return;
      window._lastEmber = now;
      var s = document.createElement("span");
      s.className = "ember";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      layer.appendChild(s);
      setTimeout(function () { s.remove(); }, 950);
      if (layer.childNodes.length > 46) layer.firstChild.remove();
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.24;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.24;
        x = Math.max(-9, Math.min(9, x));
        y = Math.max(-6, Math.min(6, y));
        btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Subtle product tilt ---------- */
  if (fine && !reduce) {
    document.querySelectorAll(".product").forEach(function (card) {
      var inner = card.querySelector(".tilt");
      if (!inner) return;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        var rx = (-py * 4).toFixed(2);
        var ry = (px * 4).toFixed(2);
        inner.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        inner.style.transform = "";
      });
    });
  }

  /* ---------- Marquee seamless loop ---------- */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    var clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.parentNode.appendChild(clone);
  });

  /* ---------- Scroll flame progress ---------- */
  var flame = document.querySelector(".flame-progress .flame");
  if (flame && !reduce) {
    var doc = document.documentElement;
    function flameTick() {
      var total = doc.scrollHeight - window.innerHeight;
      var p = total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 1;
      var s = 0.55 + p * 0.45;
      flame.style.transform = "scaleY(" + s.toFixed(3) + ")";
      flame.style.opacity = (0.35 + p * 0.65).toFixed(3);
    }
    window.addEventListener("scroll", flameTick, { passive: true });
    flameTick();
  }

  /* ---------- Shop add-to-bag (drop list) ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }
  document.querySelectorAll(".product-cta").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      showToast("ADDED TO YOUR DROP");
      btn.classList.add("added");
      setTimeout(function () { btn.classList.remove("added"); }, 2600);
    });
  });

  /* ---------- Community vote chips ---------- */
  document.querySelectorAll(".chips").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("hold"); });
      chip.classList.add("hold");
      showToast("VOTE RECORDED. THANK YOU.");
    });
  });

  /* ---------- Forms ---------- */
  document.querySelectorAll("form[data-join]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("SENT. WELCOME — EVERYONE IS WELCOME.");
      form.reset();
    });
  });

  /* ---------- Cause videos ---------- */
  document.querySelectorAll(".video-card").forEach(function (card) {
    var video = card.querySelector("video");
    var play = card.querySelector(".play-slate");
    if (!video) return;
    play.addEventListener("click", function () {
      if (video.readyState === 0 || video.error) {
        showToast("FILM LOADING IN THE DARKROOM — SOON");
        return;
      }
      card.classList.add("playing");
      video.play();
    });
    video.addEventListener("ended", function () { card.classList.remove("playing"); });
    video.addEventListener("error", function () { card.classList.remove("playing"); });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();