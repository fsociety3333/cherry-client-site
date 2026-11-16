/* =====================================================================
   Cherry Site — boot: config, download links, GUI toolbar, misc
   ===================================================================== */

(function () {
    "use strict";

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const CFG = window.CHERRY_CONFIG || {};
    const toast = (m) => window.CherryUI && window.CherryUI.toast(m);

    /* ===================== version / meta ===================== */
    $$("[data-version]").forEach((el) => { el.textContent = "v" + (CFG.version || "3.0.14"); });
    const fv = $("#footVersion");
    if (fv) fv.textContent = "v" + (CFG.version || "3.0.14");

    /* ===================== external links ===================== */
    $$("[data-ext]").forEach((a) => {
        const key = a.dataset.ext;
        const url = CFG.links && CFG.links[key];
        if (url && url !== "#") {
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
        } else {
            a.addEventListener("click", (e) => {
                e.preventDefault();
                toast("Ссылка «" + a.textContent.trim() + "» пока не настроена");
            });
        }
    });

    /* ===================== download buttons ===================== */
    const DL = CFG.downloads || {};

    function wireDownload(el, url, filename, label) {
        if (!el) return;
        el.setAttribute("href", url || "#");
        el.setAttribute("download", filename);
        el.addEventListener("click", (e) => {
            if (!CFG.downloadsReady) {
                e.preventDefault();
                toast("Ссылка на " + label + " ещё не настроена — js/config.js");
                return;
            }
            if (!url || url === "#") {
                e.preventDefault();
                toast("Укажи ссылку в js/config.js");
                return;
            }
            toast("Скачивание: " + filename);
        });
    }

    wireDownload($("#dlLauncher"), DL.launcher, "CherryLauncher.exe", "лаунчер");
    wireDownload($("#dlLauncherIcon"), DL.launcher, "CherryLauncher.exe", "лаунчер");
    wireDownload($("#dlJar"), DL.jar, "cherry-client.jar", "jar");
    wireDownload($("#dlJarIcon"), DL.jar, "cherry-client.jar", "jar");

    /* ===================== GUI toolbar ===================== */
    const GUI = window.CherryGUI;
    if (GUI) {
        const zoomIn = $("#zoomIn");
        const zoomOut = $("#zoomOut");
        const zoomValue = $("#zoomValue");
        if (zoomIn) zoomIn.addEventListener("click", () => GUI.zoom(0.1));
        if (zoomOut) zoomOut.addEventListener("click", () => GUI.zoom(-0.1));
        if (zoomValue) zoomValue.addEventListener("click", () => GUI.resetZoom());

        $$(".swatch[data-accent]").forEach((s) => {
            s.addEventListener("click", () => {
                GUI.setAccent(s.dataset.accent);
                toast("Акцент: " + s.dataset.accent.toUpperCase());
            });
        });

        const dark = $("#themeDark");
        const light = $("#themeLight");
        if (dark) dark.addEventListener("click", () => GUI.setTheme(false));
        if (light) light.addEventListener("click", () => GUI.setTheme(true));
    }

    /* ===================== hero CTA ===================== */
    const tryBtn = $("#heroTry");
    if (tryBtn) {
        tryBtn.addEventListener("click", () => {
            const stage = $("#guiStageWrap");
            if (!stage) return;
            setTimeout(() => {
                stage.animate(
                    [
                        { boxShadow: "0 0 0 0 rgba(255,61,110,.55)" },
                        { boxShadow: "0 0 0 14px rgba(255,61,110,0)" }
                    ],
                    { duration: 1100, easing: "ease-out" }
                );
            }, 900);
        });
    }

    /* ===================== keyboard niceties ===================== */
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        const mobile = $("#navMobile");
        if (mobile && mobile.classList.contains("is-open")) {
            mobile.classList.remove("is-open");
            document.body.classList.remove("is-locked");
        }
    });

    /* ===================== ready ===================== */
    document.documentElement.classList.add("js-ready");
    console.log(
        "%cCherry Client%c site " + (CFG.version || ""),
        "background:#ff3d6e;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700",
        "color:#8b96a8"
    );
})();
