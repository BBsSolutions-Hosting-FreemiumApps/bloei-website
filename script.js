(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var head = document.querySelector(".site-head");
  function onScrollHead() {
    head.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScrollHead, { passive: true });
  onScrollHead();

  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    if (open) {
      mobileMenu.hidden = false;
      document.body.style.overflow = "hidden";
    } else {
      mobileMenu.hidden = true;
      document.body.style.overflow = "";
    }
  }
  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  mobileMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  var marqueeTrack = document.querySelector(".marquee-track");
  if (marqueeTrack) {
    var group = document.getElementById("marqueeGroup");
    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marqueeTrack.appendChild(clone);
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var dur = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var statNums = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { statIO.observe(el); });
  } else {
    statNums.forEach(animateCount);
  }

  var flightPath = document.getElementById("flightPath");
  if (flightPath) {
    var flightSvg = flightPath.closest("svg");
    if (reduceMotion && flightSvg && flightSvg.pauseAnimations) flightSvg.pauseAnimations();
    var len = flightPath.getTotalLength();
    function onScrollPath() {
      if (reduceMotion) return;
      var rect = flightSvg.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
      flightPath.style.strokeDashoffset = String(-progress * len);
    }
    window.addEventListener("scroll", onScrollPath, { passive: true });
    window.addEventListener("resize", onScrollPath);
    onScrollPath();
  }

  var accItems = document.querySelectorAll(".acc-item");
  accItems.forEach(function (item) {
    var btn = item.querySelector(".acc-head");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      accItems.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".acc-head").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  var seasonTabs = Array.prototype.slice.call(document.querySelectorAll(".season-tabs button"));
  var seasonPanels = {
    lente: document.getElementById("panel-lente"),
    zomer: document.getElementById("panel-zomer"),
    herfst: document.getElementById("panel-herfst"),
    winter: document.getElementById("panel-winter")
  };
  function selectSeason(name) {
    seasonTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-season") === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      var panel = seasonPanels[tab.getAttribute("data-season")];
      if (panel) panel.hidden = !active;
    });
  }
  function currentSeason() {
    var m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return "lente";
    if (m >= 6 && m <= 8) return "zomer";
    if (m >= 9 && m <= 11) return "herfst";
    return "winter";
  }
  seasonTabs.forEach(function (tab) {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "false");
    tab.tabIndex = -1;
    if (tab.getAttribute("data-season") === currentSeason()) {
      var now = document.createElement("span");
      now.className = "now";
      now.textContent = " · nu";
      tab.appendChild(now);
    }
    tab.addEventListener("click", function () {
      selectSeason(tab.getAttribute("data-season"));
    });
  });
  selectSeason(currentSeason());

  var form = document.getElementById("gidsForm");
  var msg = document.getElementById("formMsg");
  var email = document.getElementById("email");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = email.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!valid) {
        email.classList.add("error");
        msg.className = "form-msg err";
        msg.textContent = "Vul een geldig e-mailadres in.";
        email.focus();
        return;
      }
      email.classList.remove("error");
      msg.className = "form-msg ok";
      msg.textContent = "Gelukt! De seizoensgids is onderweg naar " + value + ".";
      form.reset();
    });
    email.addEventListener("input", function () {
      email.classList.remove("error");
      if (msg.classList.contains("err")) {
        msg.textContent = "";
        msg.className = "form-msg";
      }
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
