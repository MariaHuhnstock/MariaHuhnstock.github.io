const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-nav]");

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
};

updateHeader();

window.addEventListener("scroll", updateHeader, {
  passive: true
});

menuButton.addEventListener("click", () => {
  const isOpen =
    menuButton.getAttribute("aria-expanded") === "true";

  menuButton.setAttribute(
    "aria-expanded",
    String(!isOpen)
  );

  navigation.classList.toggle("open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document
  .querySelectorAll("[data-open-project]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.querySelector(
        `#dialog-${button.dataset.openProject}`
      );

      dialog.showModal();
      document.body.style.overflow = "hidden";
    });
  });

document
  .querySelectorAll(".case-dialog")
  .forEach((dialog) => {
    const closeDialog = () => {
      dialog.close();
      document.body.style.overflow = "";
    };

    dialog
      .querySelector("[data-close-dialog]")
      .addEventListener("click", closeDialog);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeDialog();
      }
    });

    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
    });
  });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

document
  .querySelectorAll(".reveal")
  .forEach((element) => {
    revealObserver.observe(element);
  });

const sections = [
  ...document.querySelectorAll("main section[id]")
];

const navLinks = [
  ...navigation.querySelectorAll('a[href^="#"]')
];

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") ===
            `#${entry.target.id}`
        );
      });
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px"
  }
);

sections.forEach((section) => {
  navObserver.observe(section);
});
