const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reduceMotion = motionPreference.matches;

document.getElementById("year").textContent = new Date().getFullYear();

if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("has-motion");

  const revealTargets = document.querySelectorAll(
    ".section-title, .section-heading, .expertise-grid article, .card, .project, .more-projects, #story p, #contact > *"
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 45}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        const alreadyPassed = entry.boundingClientRect.bottom < 0;
        if (!entry.isIntersecting && !alreadyPassed) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5%" }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));

  if (finePointer.matches) {
    const hero = document.querySelector(".hero");
    hero?.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      hero.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      hero.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      hero.style.setProperty(
        "--orbit-shift-x",
        `${((event.clientX - bounds.left) / bounds.width - 0.5) * 12}px`
      );
      hero.style.setProperty(
        "--orbit-shift-y",
        `${((event.clientY - bounds.top) / bounds.height - 0.5) * 12}px`
      );
    });

    document.querySelectorAll(".card, .project").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
        card.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
      });
    });
  }
}

const navLinks = new Map(
  [...document.querySelectorAll('nav a[href^="#"]')].map((link) => [
    link.getAttribute("href").slice(1),
    link,
  ])
);

const navSections = [...navLinks.keys()]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

let scrollFrame;
const updateActiveNavigation = () => {
  scrollFrame = undefined;
  const headerOffset = document.querySelector("header")?.offsetHeight ?? 0;
  const activationLine = headerOffset + 24;
  const footerHeight = document.querySelector("footer")?.offsetHeight ?? 0;
  const atPageEnd =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - footerHeight - 2;
  const activeSection = atPageEnd
    ? navSections.at(-1)
    : navSections.filter(
        (section) => section.getBoundingClientRect().top <= activationLine
      ).at(-1);

  navLinks.forEach((link, id) => {
    if (id === activeSection?.id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

window.addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateActiveNavigation);
  },
  { passive: true }
);
window.addEventListener("resize", updateActiveNavigation);
updateActiveNavigation();
