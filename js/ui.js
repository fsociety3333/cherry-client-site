/* =====================================================================
   Cherry Site — shared UI: preloader, cursor, dust, reveal, nav, HUD, toasts
   ===================================================================== */

(function () {
    "use strict";

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    /* ===================== toasts ===================== */
    const toastBox = $("#toasts");
    const queue = [];

    function toast(message) {
        if (!toastBox || !message) return;
        const el = document.createElement("div");
        el.className = "toast";
        el.innerHTML = "<i></i><span></span>";
        el.lastElementChild.textContent = message;
        toastBox.appendChild(el);
        queue.push(el);
        if (queue.length > 3) {
            const old = queue.shift();
            dismiss(old);
        }
        setTimeout(() => dismiss(el), 2800);
    }

    function dismiss(el) {
        if (!el || !el.parentNode) return;
        el.classList.add("is-out");
        setTimeout(() => el.remove(), 400);
    }

    /* ===================== preloader ===================== */
    const preloader = $("#preloader");
    if (preloader) {
        const start = performance.now();
        const hide = () => {
            const wait = Math.max(0, 620 - (performance.now() - start));
            setTimeout(() => {
                preloader.classList.add("is-done");
                document.body.classList.remove("is-loading");
                document.body.classList.add("is-ready");
                setTimeout(() => preloader.remove(), 900);
            }, wait);
        };
        if (document.readyState === "complete") hide();
        else window.addEventListener("load", hide, { once: true });
        /* safety net */
        setTimeout(() => {
            if (document.body.contains(preloader)) hide();
        }, 3800);
    }

    /* ===================== scroll progress ===================== */
    const bar = $("#scrollBar");
    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h > 0 ? window.scrollY / h : 0;
            if (bar) bar.style.transform = `scaleX(${p})`;
            ticking = false;
        });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ===================== nav ===================== */
    const nav = $("#nav");
    window.addEventListener("scroll", () => {
        if (!nav) return;
        nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }, { passive: true });

    const burger = $("#burger");
    const mobile = $("#navMobile");
    if (burger && mobile) {
        burger.addEventListener("click", () => {
            const open = mobile.classList.toggle("is-open");
            document.body.classList.toggle("is-locked", open);
        });
        $$("a", mobile).forEach((a) => a.addEventListener("click", () => {
            mobile.classList.remove("is-open");
            document.body.classList.remove("is-locked");
        }));
    }

    /* active nav link */
    const navLinks = $$(".nav__link");
    const sections = ["features", "gui", "hud", "download", "faq"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    function syncNav() {
        if (!sections.length) return;
        const line = window.innerHeight * 0.34;
        let current = null;
        for (const s of sections) {
            if (s.getBoundingClientRect().top <= line) current = s;
        }
        if (window.scrollY < 120) current = null;
        navLinks.forEach((l) => l.classList.remove("is-active"));
        if (current) {
            const link = navLinks.find((l) => l.getAttribute("href") === "#" + current.id);
            if (link) link.classList.add("is-active");
        }
    }
    window.addEventListener("scroll", syncNav, { passive: true });
    syncNav();

    /* ===================== reveal ===================== */
    const revealEls = $$(".reveal");
    if ("IntersectionObserver" in window && !reduced) {
        const ro = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add("is-in");
                    ro.unobserve(en.target);
                }
            });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
        revealEls.forEach((el) => ro.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-in"));
    }

    /* gui boot animation trigger */
    const guiStage = $("#guiStageWrap");
    if (guiStage && "IntersectionObserver" in window) {
        new IntersectionObserver((entries, obs) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    guiStage.classList.add("is-visible");
                    obs.disconnect();
                }
            });
        }, { threshold: 0.12 }).observe(guiStage);
    }

    /* ===================== cursor ===================== */
    const dot = $("#cursorDot");
    const glow = $("#cursorGlow");
    if (finePointer && !reduced && dot && glow) {
        document.body.classList.add("has-cursor");
        let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
        let gx = tx, gy = ty;
        dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

        window.addEventListener("pointermove", (e) => {
            tx = e.clientX; ty = e.clientY;
            dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        }, { passive: true });

        (function loop() {
            gx += (tx - gx) * 0.09;
            gy += (ty - gy) * 0.09;
            glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
            requestAnimationFrame(loop);
        })();

        document.addEventListener("pointerdown", () => {
            dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(2.2)`;
            setTimeout(() => {
                dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
            }, 160);
        });

        /* interactive targets → the dot grows and turns cherry */
        const HOT = "a,button,input,textarea,select,label,[role=button],[data-act],[data-quick],[data-cat],[data-cfg],.cg-card,.cg-row,.cg-slider,.mm-acc,.mm__tile";
        document.addEventListener("pointerover", (e) => {
            const t = e.target;
            dot.classList.toggle("is-hot", !!(t && t.closest && t.closest(HOT)));
        }, { passive: true });

        /* hide both layers while the mouse is outside the window */
        document.documentElement.addEventListener("pointerleave", () => {
            document.body.classList.add("is-pointer-out");
        });
        document.documentElement.addEventListener("pointerenter", () => {
            document.body.classList.remove("is-pointer-out");
        });
        window.addEventListener("blur", () => document.body.classList.add("is-pointer-out"));
    }

    /* ===================== hero parallax ===================== */
    const heroBg = $("#heroBg");
    const hero = $(".hero");
    if (heroBg && hero && finePointer && !reduced) {
        hero.addEventListener("pointermove", (e) => {
            const r = hero.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            heroBg.style.transform = `translate3d(${x * -18}px, ${y * -14}px, 0)`;
        }, { passive: true });
        hero.addEventListener("pointerleave", () => {
            heroBg.style.transform = "";
        });
    }

    /* ===================== dust canvas ===================== */
    const canvas = $("#dust");
    if (canvas && hero && !reduced) {
        const ctx = canvas.getContext("2d");
        let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        let parts = [];
        let alive = true;

        function resize() {
            const r = hero.getBoundingClientRect();
            w = r.width; h = Math.max(r.height, 480);
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.round(Math.min(58, Math.max(24, w / 26)));
            parts = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.6 + 0.4,
                vy: -(Math.random() * 0.22 + 0.05),
                vx: (Math.random() - 0.5) * 0.14,
                a: Math.random() * 0.4 + 0.12,
                hue: Math.random() > 0.55 ? "255, 61, 110" : Math.random() > 0.4 ? "160, 190, 255" : "255, 220, 235"
            }));
        }

        function paint() {
            if (!alive) return;
            ctx.clearRect(0, 0, w, h);
            for (const p of parts) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
                if (p.x < -6) p.x = w + 6;
                if (p.x > w + 6) p.x = -6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.hue}, ${p.a})`;
                ctx.fill();
            }
            requestAnimationFrame(paint);
        }

        new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting && !alive) { alive = true; paint(); }
                if (!en.isIntersecting) alive = false;
            });
        }, { threshold: 0 }).observe(hero);

        window.addEventListener("resize", resize);
        resize();
        paint();
    }

    /* ===================== marquee ===================== */
    const track = $("#marqueeTrack");
    if (track) track.innerHTML += track.innerHTML;

    /* ===================== showcase tilt ===================== */
    const frame = $("#showcaseFrame");
    if (frame && "IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                frame.classList.toggle("is-flat", en.isIntersecting && en.intersectionRatio > 0.35);
            });
        }, { threshold: [0, 0.35, 0.7] }).observe(frame);
    }

    /* ===================== card spotlight ===================== */
    $$(".card").forEach((card) => {
        card.addEventListener("pointermove", (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
            card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        }, { passive: true });
    });

    /* ===================== HUD keystrokes ===================== */
    const hudKeys = $("#hudKeys");
    if (hudKeys) {
        const setKey = (code, down) => {
            const el = hudKeys.querySelector(`[data-key="${code}"]`);
            if (el) el.classList.toggle("is-down", down);
        };
        const map = { w: "w", a: "a", s: "s", d: "d", ц: "w", ф: "a", ы: "s", в: "d" };
        window.addEventListener("keydown", (e) => {
            if (e.target.matches("input, textarea")) return;
            const k = map[e.key.toLowerCase()];
            if (k) setKey(k, true);
        });
        window.addEventListener("keyup", (e) => {
            const k = map[e.key.toLowerCase()];
            if (k) setKey(k, false);
        });
        $$("[data-key]", hudKeys).forEach((el) => {
            const k = el.dataset.key;
            el.addEventListener("pointerdown", (e) => { e.preventDefault(); setKey(k, true); });
            el.addEventListener("pointerup", () => setKey(k, false));
            el.addEventListener("pointerleave", () => setKey(k, false));
        });
    }

    /* ===================== misc ===================== */
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    window.CherryUI = { toast, dismiss, reduced, finePointer };
})();
