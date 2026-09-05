/* ============================================================
   ROH / shared interactions.
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
        entry.target.classList.add(entry.target.classList.contains("develop") ? "live" : "in");
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

  /* ---------- The Vault (kept cart) ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  var VAULT_KEY = "roh_vault";
  var vault = {
    items: [],
    load: function () {
      try { vault.items = JSON.parse(localStorage.getItem(VAULT_KEY)) || []; }
      catch (e) { vault.items = []; }
      return vault;
    },
    save: function () { localStorage.setItem(VAULT_KEY, JSON.stringify(vault.items)); },
    count: function () {
      return vault.items.reduce(function (n, i) { return n + (i.qty || 0); }, 0);
    },
    total: function () {
      return vault.items.reduce(function (t, i) { return t + (i.price || 0) * (i.qty || 0); }, 0);
    },
    find: function (id) {
      return vault.items.filter(function (i) { return i.id === id; })[0];
    },
    add: function (card) {
      var img = card.querySelector(".art img");
      var nEl = card.querySelector(".product-name");
      var sEl = card.querySelector(".product-script");
      var pEl = card.querySelector(".product-price");
      var name = (nEl && nEl.textContent.trim()) || "Tee";
      var price = pEl ? parseInt(String(pEl.textContent).replace(/[^0-9]/g, ""), 10) || 0 : 0;
      var item = vault.find(name);
      if (item) { item.qty += 1; }
      else {
        vault.items.push({
          id: name,
          name: name,
          script: sEl ? sEl.textContent.trim() : "",
          price: price,
          img: img ? img.getAttribute("src") : "",
          qty: 1
        });
      }
      vault.save();
      vault.render();
    },
    remove: function (id) {
      vault.items = vault.items.filter(function (i) { return i.id !== id; });
      vault.save();
      vault.render();
    },
    shift: function (id, delta) {
      var item = vault.find(id);
      if (!item) return;
      item.qty += delta;
      if (item.qty < 1) { vault.remove(id); return; }
      vault.save();
      vault.render();
    },
    clear: function () { vault.items = []; vault.save(); vault.render(); },
    render: function () {
      var list = document.getElementById("vault-list");
      var empty = document.getElementById("vault-empty");
      var foot = document.getElementById("vault-foot");
      var totalEl = document.getElementById("vault-total");
      var countEl = document.getElementById("vault-count");
      if (!list) return;

      list.innerHTML = "";
      vault.items.forEach(function (i) {
        var div = document.createElement("div");
        div.className = "vault-item";
        div.innerHTML =
          '<div class="art"><img src="' + i.img + '" alt="' + i.name + ' tee"></div>' +
          '<div class="vault-meta">' +
            '<div class="product-name">' + i.name + '</div>' +
            '<div class="product-script">' + (i.script || "") + '</div>' +
            '<div class="qty" data-id="' + i.id + '">' +
              '<button type="button" data-act="minus" aria-label="remove one">\u2212</button>' +
              '<span>' + i.qty + '</span>' +
              '<button type="button" data-act="plus" aria-label="add one">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="vault-side">' +
            '<span class="vault-price">$' + (i.price * i.qty) + '</span>' +
            '<button type="button" class="remove" data-id="' + i.id + '">Remove</button>' +
          '</div>';
        list.appendChild(div);
      });

      var has = vault.items.length > 0;
      if (empty) empty.classList.toggle("show", !has);
      if (foot) foot.style.display = has ? "" : "none";
      if (totalEl) totalEl.textContent = "$" + vault.total();
      if (countEl) {
        var c = vault.count();
        countEl.textContent = c;
        countEl.classList.toggle("show", c > 0);
      }
    }
  };
  vault.load().render();

  var vaultEl = document.getElementById("vault");
  var vaultOverlay = document.getElementById("vault-overlay");
  function vaultOpen() {
    if (!vaultEl) return;
    vaultEl.classList.add("open");
    vaultEl.setAttribute("aria-hidden", "false");
    if (vaultOverlay) vaultOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function vaultClose() {
    if (!vaultEl) return;
    vaultEl.classList.remove("open");
    vaultEl.setAttribute("aria-hidden", "true");
    if (vaultOverlay) vaultOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  var vTrigger = document.getElementById("vault-trigger");
  var vClose = document.getElementById("vault-close");
  if (vTrigger) vTrigger.addEventListener("click", vaultOpen);
  if (vaultOverlay) vaultOverlay.addEventListener("click", vaultClose);
  if (vClose) vClose.addEventListener("click", vaultClose);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") vaultClose();
  });

  var vaultList = document.getElementById("vault-list");
  if (vaultList) {
    vaultList.addEventListener("click", function (e) {
      var rm = e.target.closest(".remove");
      if (rm) { vault.remove(rm.getAttribute("data-id")); return; }
      var qty = e.target.closest(".qty");
      if (qty) {
        var id = qty.getAttribute("data-id");
        var act = e.target.closest("[data-act]");
        if (act && act.getAttribute("data-act") === "plus") vault.shift(id, 1);
        if (act && act.getAttribute("data-act") === "minus") vault.shift(id, -1);
      }
    });
  }

  document.querySelectorAll(".product").forEach(function (card) {
    var btn = card.querySelector("button.product-cta");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      btn.classList.add("added");
      setTimeout(function () { btn.classList.remove("added"); }, 2600);
      vault.add(card);
      showToast("KEPT IN THE VAULT");
      vaultOpen();
    });
  });

  document.querySelectorAll("form[data-vaultform]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!vault.items.length) { showToast("THE VAULT IS EMPTY."); return; }
      var nameEl = form.querySelector('[name="vname"]');
      var emailEl = form.querySelector('[name="vemail"]');
      var notesEl = form.querySelector('[name="vnotes"]');
      var name = (nameEl && nameEl.value.trim()) || "Anonymous robber";
      var email = (emailEl && emailEl.value.trim()) || "no email given";
      var notes = (notesEl && notesEl.value.trim()) || "no notes";
      var lines = vault.items.map(function (i) {
        return i.name + " \u00d7 " + i.qty + " ($" + (i.price * i.qty) + ")";
      });
      var description = lines.join("\n") + "\n\nTotal: $" + vault.total() + "\nNotes: " + notes;
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;

      var payload = {
        embeds: [{
          color: 0xB9975B,
          author: { name: "THE VAULT" },
          title: name + " / " + email,
          description: description,
          footer: { text: "ROH / THE VAULT" },
          timestamp: new Date().toISOString()
        }]
      };
      var cfg = window.ROH_CONFIG || {};
      function settle(message, keep) {
        showToast(message);
        if (!keep) vault.clear();
        form.reset();
        btn.disabled = false;
        if (!keep) vaultClose();
      }
      if (cfg.discordWebhook) {
        fetch(cfg.discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) { settle(r.ok ? "SENT. THE HOUSE SEES IT." : "THE HOUSE IS BUSY. TRY AGAIN.", !r.ok); })
          .catch(function () { settle("CONNECTION BROKE. TRY AGAIN.", true); });
      } else {
        settle("NO WEBHOOK SET. PASTE IT IN js/config.js", true);
      }
    });
  });

  /* ---------- Community vote chips ---------- */
  document.querySelectorAll(".chips").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("hold"); });
      chip.classList.add("hold");
      if (group.hasAttribute("data-vote")) {
        showToast("VOTE RECORDED. " + chip.textContent.trim().toUpperCase());
      }
    });
  });

  /* ---------- The Wall / Discord ---------- */
  var cfg = window.ROH_CONFIG || {};

  var dlink = document.getElementById("discord-link");
  if (dlink && cfg.discordInvite) {
    dlink.href = cfg.discordInvite;
    dlink.style.display = "inline-flex";
  }

  var WALL_COLORS = { "Prayer request": 0xB9975B, "Testimony": 0xD8723A, "Encouragement": 0xECE6DA };

  function wallReset(form) {
    form.reset();
    form.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("hold"); });
    var first = form.querySelector('input[type="radio"]');
    if (first) { first.checked = true; var host = first.closest(".chip"); if (host) host.classList.add("hold"); }
  }

  document.querySelectorAll("form[data-discord]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = form.querySelector('[name="wname"]');
      var msgEl = form.querySelector('[name="wmsg"]');
      var typeEl = form.querySelector('input[name="wtype"]:checked');
      var name = (nameEl && nameEl.value.trim()) || "Anonymous robber";
      var msg = (msgEl && msgEl.value.trim()) || "";
      var type = typeEl ? typeEl.value : "Prayer request";
      if (!msg) { showToast("WRITE SOMETHING ON THE WALL FIRST."); return; }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;

      var payload = {
        embeds: [{
          color: WALL_COLORS[type] || 0xECE6DA,
          author: { name: type.toUpperCase() },
          title: name,
          description: msg,
          footer: { text: "ROH / THE WALL" },
          timestamp: new Date().toISOString()
        }]
      };

      function settle(message) {
        showToast(message);
        wallReset(form);
        btn.disabled = false;
      }

      if (cfg.discordWebhook) {
        fetch(cfg.discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) {
            if (r.ok) settle("ON THE WALL. THE HOUSE SEES IT.");
            else settle("THE WALL IS FULL RIGHT NOW. TRY AGAIN.");
          })
          .catch(function () { settle("CONNECTION BROKE. TRY AGAIN."); });
      } else {
        settle("NO WEBHOOK SET. PASTE IT IN js/config.js");
      }
    });
  });

  /* ---------- The Dispatch / Discord ---------- */
  document.querySelectorAll("form[data-dispatch]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailEl = form.querySelector('[name="demail"]');
      var nameEl = form.querySelector('[name="dname"]');
      var versesEl = form.querySelector('[name="dverses"]');
      var name = (nameEl && nameEl.value.trim()) || "Anonymous robber";
      var email = (emailEl && emailEl.value.trim()) || "no email given";
      var verses = (versesEl && versesEl.value.trim()) || "no verse sent";
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;

      /* Free email list capture (Buttondown) — fire and forget, no CORS gate */
      var bdUser = (window.ROH_CONFIG || {}).buttondownUser || "";
      if (bdUser && emailEl && emailEl.value.trim()) {
        var fd = new FormData();
        fd.append("email", emailEl.value.trim());
        fd.append("embed", "1");
        if (name && name !== "Anonymous robber") fd.append("metadata__name", name);
        try {
          fetch("https://buttondown.com/api/emails/embed-subscribe/" + encodeURIComponent(bdUser), {
            method: "POST", body: fd, mode: "no-cors"
          }).catch(function () {});
        } catch (err) {}
      }

      var payload = {
        embeds: [{
          color: 0xB9975B,
          author: { name: "DISPATCH" },
          title: name + " / " + email,
          description: verses,
          footer: { text: "ROH / THE DISPATCH" },
          timestamp: new Date().toISOString()
        }]
      };

      function settle(message) {
        showToast(message);
        form.reset();
        btn.disabled = false;
      }

      if (cfg.discordWebhook) {
        fetch(cfg.discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) { settle(r.ok ? "SENT. THE HOUSE SEES IT." : "THE HOUSE IS BUSY. TRY AGAIN."); })
          .catch(function () { settle("CONNECTION BROKE. TRY AGAIN."); });
      } else {
        settle("NO WEBHOOK SET. PASTE IT IN js/config.js");
      }
    });
  });

  /* ---------- Footer social links ---------- */
  var socialBox = document.getElementById("footer-social");
  var SOCIALS = [["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"], ["spotify", "Spotify"]];
  if (socialBox) {
    SOCIALS.forEach(function (pair) {
      var url = cfg.social && cfg.social[pair[0]];
      if (!url) return;
      var a = document.createElement("a");
      a.className = "social-link";
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = pair[1];
      socialBox.appendChild(a);
    });
  }

  /* ---------- Wall of proof (curated testimonials) ---------- */
  fetch("js/wall.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw 0;
      return r.json();
    })
    .then(function (data) {
      var box = document.getElementById("wall-proof");
      var emptyEl = document.getElementById("wall-proof-empty");
      if (!box || !data || !data.length) {
        if (emptyEl) emptyEl.style.display = "";
        return;
      }
      data.forEach(function (item, i) {
        var card = document.createElement("figure");
        card.className = "proof-card";
        card.style.transitionDelay = (i * 0.12) + "s";
        card.innerHTML =
          '<span class="proof-type">' + (item.type || "The Wall") + '</span>' +
          '<blockquote>' + item.message + '</blockquote>' +
          '<figcaption>' + item.name + '</figcaption>';
        box.appendChild(card);
        requestAnimationFrame(function () { card.classList.add("in"); });
      });
      if (emptyEl) emptyEl.style.display = "none";
    })
    .catch(function () {});

  /* ---------- Cause videos ---------- */
  document.querySelectorAll(".video-card").forEach(function (card) {
    var video = card.querySelector("video");
    var play = card.querySelector(".play-slate");
    if (!video) return;
    play.addEventListener("click", function () {
      if (video.readyState === 0 || video.error) {
        showToast("FILM LOADING IN THE DARKROOM. SOON");
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