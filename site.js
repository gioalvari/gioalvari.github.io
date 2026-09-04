const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reduceMotion = motionPreference.matches;

document.getElementById("year").textContent = new Date().getFullYear();

if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("has-motion");

  const revealTargets = document.querySelectorAll(
    ".chapter-header, .practice-card, .work-entry, .experiment-sheet, " +
      ".project-small, .project-index, .story-note, .story-copy > p, " +
      ".contact-layout > *"
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 55}ms`);
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
    { threshold: 0.1, rootMargin: "0px 0px -5%" }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));

  const revealCurrentPosition = () => {
    revealTargets.forEach((target) => {
      if (target.getBoundingClientRect().top >= window.innerHeight * 0.95) return;
      target.classList.add("is-visible");
      revealObserver.unobserve(target);
    });
  };

  window.addEventListener("pageshow", () => requestAnimationFrame(revealCurrentPosition));
  window.addEventListener("hashchange", () => requestAnimationFrame(revealCurrentPosition));
  requestAnimationFrame(() => requestAnimationFrame(revealCurrentPosition));
}

if (!reduceMotion && finePointer.matches) {
  document.querySelectorAll(".method-card, .experiment-sheet").forEach((sheet) => {
    sheet.addEventListener("pointermove", (event) => {
      const bounds = sheet.getBoundingClientRect();
      sheet.style.setProperty("--sheet-x", `${event.clientX - bounds.left}px`);
      sheet.style.setProperty("--sheet-y", `${event.clientY - bounds.top}px`);
    });
  });
}

const navLinks = new Map(
  [...document.querySelectorAll('.site-header a[href^="#"]')]
    .filter((link) => link.getAttribute("href") !== "#top")
    .map((link) => [link.getAttribute("href").slice(1), link])
);
const navSections = [...navLinks.keys()]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const progress = document.querySelector(".reading-progress");

let scrollFrame;
const updatePageState = () => {
  scrollFrame = undefined;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
  progress?.style.setProperty("--reading-progress", `${percentage}%`);

  const headerOffset = document.querySelector(".site-header")?.offsetHeight ?? 0;
  const activationLine = headerOffset + 24;
  const footerHeight = document.querySelector(".site-footer")?.offsetHeight ?? 0;
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
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updatePageState);
  },
  { passive: true }
);
window.addEventListener("resize", updatePageState);
updatePageState();
