/**
 * Hurtighjelp hub / support / personvern — interaktivitet
 */
(function () {
  const y = document.getElementById("y");
  if (y) y.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-copy-url]").forEach((btn) => {
    const code = btn.closest(".hj-url-strip")?.querySelector("code");
    if (!code) return;
    btn.addEventListener("click", async () => {
      const text = code.textContent?.trim() || "";
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Kopiert ✓";
        btn.classList.add("is-copied");
        setTimeout(() => {
          btn.textContent = "Kopier URL";
          btn.classList.remove("is-copied");
        }, 2200);
      } catch {
        btn.textContent = "Kopier manuelt";
      }
    });
  });

  const faqSearch = document.getElementById("hjFaqSearch");
  if (faqSearch) {
    const items = document.querySelectorAll(".hj-faq details");
    faqSearch.addEventListener("input", () => {
      const q = faqSearch.value.trim().toLowerCase();
      items.forEach((el) => {
        const text = el.textContent?.toLowerCase() || "";
        el.classList.toggle("is-hidden", q.length > 0 && !text.includes(q));
      });
    });
  }

  const tocLinks = document.querySelectorAll(".hj-privacy-toc a[href^='#']");
  const sections = document.querySelectorAll(".hj-privacy-content section[id]");
  if (tocLinks.length && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          tocLinks.forEach((a) => {
            a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  const supportNav = document.querySelectorAll(".hj-support-sidebar a[href^='#']");
  supportNav.forEach((a) => {
    a.addEventListener("click", () => {
      supportNav.forEach((n) => n.classList.remove("is-active"));
      a.classList.add("is-active");
    });
  });

})();
