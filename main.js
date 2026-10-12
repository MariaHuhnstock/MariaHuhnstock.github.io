/* Maria Huhnstock – Portfolio
   1. Videos erst laden und abspielen, wenn sie sichtbar sind
   2. Sektionen beim ersten Erscheinen sanft einblenden
   3. Sprachumschalter auf der Datenschutzseite
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canObserve = "IntersectionObserver" in window;

  /* ---------- 1. Lazy-Videos ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll("video.lazy-video"));

  function loadVideo(video) {
    if (video.dataset.loaded) return;
    video.querySelectorAll("source[data-src]").forEach(function (source) {
      source.src = source.dataset.src;
    });
    video.load();
    video.dataset.loaded = "true";
  }

  function addPlayToggle(video) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "media__toggle";
    button.textContent = "▶ PLAY";
    button.setAttribute("aria-label", "Play video");
    button.addEventListener("click", function () {
      loadVideo(video);
      if (video.paused) {
        video.play();
        button.textContent = "❚❚ PAUSE";
        button.setAttribute("aria-label", "Pause video");
      } else {
        video.pause();
        button.textContent = "▶ PLAY";
        button.setAttribute("aria-label", "Play video");
      }
    });
    video.parentElement.appendChild(button);
  }

  if (reduceMotion || !canObserve) {
    // Keine Autoplay-Videos: Poster zeigen, Abspielen per Button
    videos.forEach(addPlayToggle);
  } else {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          loadVideo(video);
          var playing = video.play();
          if (playing && playing.catch) playing.catch(function () {});
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.25 });
    videos.forEach(function (video) { videoObserver.observe(video); });
  }

  /* ---------- 2. Einblenden ---------- */
  var revealItems = document.querySelectorAll("[data-reveal]");
  if (!reduceMotion && canObserve) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) {
      item.classList.add("reveal");
      revealObserver.observe(item);
    });
  }

  /* ---------- 3. Sprachumschalter ---------- */
  var switcher = document.querySelector("[data-lang-switch]");
  if (switcher) {
    var buttons = switcher.querySelectorAll("button[data-lang]");
    var blocks = document.querySelectorAll("[data-lang-block]");

    function setLang(lang) {
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
      });
      blocks.forEach(function (block) {
        block.hidden = block.dataset.langBlock !== lang;
      });
      document.title = lang === "en"
        ? "Privacy – Maria Huhnstock"
        : "Datenschutz – Maria Huhnstock";
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        setLang(b.dataset.lang);
        history.replaceState(null, "", b.dataset.lang === "en" ? "#en" : "#de");
      });
    });

    setLang(location.hash === "#en" ? "en" : "de");
  }
})();
