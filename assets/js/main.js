/* Maria Huhnstock – Portfolio
   1. Videos: Karten spielen beim Hovern (Maus) bzw. sichtbar (Touch), andere Videos sobald sichtbar
   2. Sektionen beim ersten Erscheinen sanft einblenden
   3. Sprachumschalter auf der Datenschutzseite
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var canObserve = "IntersectionObserver" in window;

  /* ---------- 1. Videos ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll("video.lazy-video"));

  function loadVideo(video) {
    if (video.dataset.loaded) return;
    video.querySelectorAll("source[data-src]").forEach(function (source) {
      source.src = source.dataset.src;
    });
    video.load();
    video.dataset.loaded = "true";
  }

  function playVideo(video) {
    loadVideo(video);
    var playing = video.play();
    if (playing && playing.catch) playing.catch(function () {});
  }

  function addPlayToggle(video) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "media__toggle";
    button.textContent = "▶ PLAY";
    button.setAttribute("aria-label", "Play video");
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (video.paused) {
        playVideo(video);
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

  // Hinweis + Fortschrittsbalken auf Karten-Videos
  function decorateCardVideo(video) {
    var media = video.parentElement;
    var idleText = canHover ? "▶ HOVER TO PREVIEW" : "▶ PREVIEW";
    var badge = document.createElement("span");
    badge.className = "preview-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = idleText;
    var progress = document.createElement("span");
    progress.className = "preview-progress";
    progress.setAttribute("aria-hidden", "true");
    var bar = document.createElement("span");
    progress.appendChild(bar);
    media.appendChild(badge);
    media.appendChild(progress);

    video.addEventListener("play", function () { badge.textContent = "● PLAYING PREVIEW"; });
    video.addEventListener("pause", function () { badge.textContent = idleText; });
    video.addEventListener("timeupdate", function () {
      if (video.duration) bar.style.width = (video.currentTime / video.duration) * 100 + "%";
    });
  }

  function observeAndPlay(list, threshold) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) playVideo(entry.target);
        else if (!entry.target.paused) entry.target.pause();
      });
    }, { rootMargin: "100px 0px", threshold: threshold });
    list.forEach(function (video) { observer.observe(video); });
  }

  var cardVideos = videos.filter(function (v) { return v.closest(".game-card"); });
  var otherVideos = videos.filter(function (v) { return !v.closest(".game-card"); });

  cardVideos.forEach(decorateCardVideo);

  if (reduceMotion || !canObserve) {
    // Kein Autoplay: Poster zeigen, Abspielen per Button
    videos.forEach(addPlayToggle);
  } else {
    observeAndPlay(otherVideos, 0.25);

    if (canHover) {
      // Maus: Vorschau beim Drüberfahren, Tastatur: beim Fokussieren
      cardVideos.forEach(function (video) {
        var card = video.closest(".game-card");
        loadVideo(video); // nur Metadaten/Poster, preload="none" verhindert vollen Download

        function start() {
          try { video.currentTime = 0; } catch (e) {}
          playVideo(video);
        }
        function stop() {
          video.pause();
          try { video.currentTime = 0; } catch (e) {}
        }

        card.addEventListener("mouseenter", start);
        card.addEventListener("mouseleave", stop);
        card.addEventListener("focusin", start);
        card.addEventListener("focusout", function (event) {
          if (!card.contains(event.relatedTarget)) stop();
        });
      });
    } else {
      // Touch: abspielen, sobald die Karte größtenteils sichtbar ist
      observeAndPlay(cardVideos, 0.6);
    }
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
