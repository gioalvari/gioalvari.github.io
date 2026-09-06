const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reduceMotion = motionPreference.matches;

document.getElementById("year").textContent = new Date().getFullYear();

if (!reduceMotion && typeof window.IntersectionObserver === "function") {
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

  document.documentElement.classList.add("has-motion");

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
  const hero = document.querySelector(".hero");
  hero?.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty("--hero-x", `${event.clientX - bounds.left}px`);
    hero.style.setProperty("--hero-y", `${event.clientY - bounds.top}px`);
  });

  document.querySelectorAll(".method-card, .experiment-sheet").forEach((sheet) => {
    sheet.addEventListener("pointermove", (event) => {
      const bounds = sheet.getBoundingClientRect();
      sheet.style.setProperty("--sheet-x", `${event.clientX - bounds.left}px`);
      sheet.style.setProperty("--sheet-y", `${event.clientY - bounds.top}px`);
      if (!sheet.classList.contains("method-card")) return;
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      sheet.style.setProperty("--card-rotate-x", `${vertical * -2.2}deg`);
      sheet.style.setProperty("--card-rotate-y", `${horizontal * 2.2}deg`);
    });
    sheet.addEventListener("pointerleave", () => {
      sheet.style.removeProperty("--card-rotate-x");
      sheet.style.removeProperty("--card-rotate-y");
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
const legacySections = new Map([
  ["expertise", "practice"],
  ["code", "projects"],
  ["story", "about"],
]);
const progress = document.querySelector(".reading-progress");

let scrollFrame;
const updatePageState = () => {
  scrollFrame = undefined;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
  progress?.style.setProperty("--reading-progress", `${percentage}%`);
  document.querySelector(".hero")?.style.setProperty(
    "--scan-y",
    `${Math.min(88, 18 + window.scrollY * 0.055)}%`
  );

  const headerOffset = document.querySelector(".site-header")?.offsetHeight ?? 0;
  const activationLine = headerOffset + 24;
  const footerHeight = document.querySelector(".site-footer")?.offsetHeight ?? 0;
  const atPageEnd =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - footerHeight - 2;
  const hashId = window.location.hash.slice(1);
  const hashSectionId = legacySections.get(hashId) ?? hashId;
  const hashSection = document.getElementById(hashSectionId);
  const hashRect = hashSection?.getBoundingClientRect();
  const hashIsCurrent =
    hashRect &&
    hashRect.bottom > activationLine &&
    hashRect.top <= window.innerHeight * 0.35;
  const passedSection = navSections.filter(
    (section) => section.getBoundingClientRect().top <= activationLine
  ).at(-1);
  const activeSection = atPageEnd
    ? navSections.at(-1)
    : hashIsCurrent
      ? hashSection
      : passedSection;

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
