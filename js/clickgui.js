/* =====================================================================
   Interactive ClickGUI replica — behaviour
   ===================================================================== */

(function () {
    "use strict";

    const D = window.CHERRY_DATA;
    if (!D) return;

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const svg = {
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z"/></svg>',
        chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
        sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M4 12h7M4 17h4"/><path d="M17 6v12M14 15l3 3 3-3"/></svg>',
        grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
        palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H13a2 2 0 0 1 0-4h3.5A4.5 4.5 0 0 0 21 8.5C21 5.5 17 3 12 3z"/><circle cx="7.5" cy="10" r="1.1" fill="currentColor"/><circle cx="10" cy="6.8" r="1.1" fill="currentColor"/><circle cx="14.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
        expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10l4-4 4 4"/><path d="M8 14l4 4 4-4"/><path d="M4 12h3M17 12h3"/></svg>',
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'
    };

    /* ============================ state ============================ */
    const root = $("#clickgui");
    const panel = $("#cgPanel");
    const grid = $("#cgGrid");
    const content = $("#cgContent");
    const popups = $("#cgPopups");
    const catsEl = $("#cgCats");
    const quickEl = $("#cgQuick");
    const topActionsEl = $("#cgTopActions");
    const searchInput = $("#cgSearch");
    const searchWrap = $("#cgSearchWrap");

    if (!root || !panel) return;

    const clone = (v) => JSON.parse(JSON.stringify(v));

    const state = {
        cat: "combat",
        query: "",
        favOnly: false,
        sortActive: false,
        compact: false,
        accent: "#38bdf8",
        light: false,
        zoom: 1,
        expanded: new Set(["aura"]),
        favorites: new Set(),
        popup: null,
        listening: null,
        color: null,
        configs: clone(D.configs),
        currentConfig: "default",
        switchTimer: null
    };

    const modules = D.modules.map((m, i) => {
        const mod = clone(m);
        mod.settings = mod.settings || [];
        mod.on = !!mod.on;
        mod.key = mod.key || null;
        mod.order = i;
        return mod;
    });

    const byId = new Map(modules.map((m) => [m.id, m]));
    modules.forEach((m) => { if (m.fav) state.favorites.add(m.id); });

    const catById = new Map(D.categories.map((c) => [c.id, c]));

    function leadModule(cat) {
        const m = modules.find((x) => x.cat === cat && x.settings.length);
        return m ? new Set([m.id]) : new Set();
    }

    /* ============================ helpers ============================ */
    function countWord(n) {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return "модуль";
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "модуля";
        return "модулей";
    }

    function fmt(v, step) {
        const d = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
        return Number(v).toFixed(d).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    }

    function keyLabel(k) {
        if (!k) return "НЕТ";
        const map = { " ": "SPACE", Escape: "ESC", Control: "CTRL", Shift: "SHIFT", Alt: "ALT", ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT" };
        return map[k] || (k.length === 1 ? k.toUpperCase() : k.toUpperCase());
    }

    function settingsHeight(mod) {
        const n = mod.settings.length;
        if (!n) return 0;
        /* inner: divider 1+13, rows 26 each + 6 gap, bottom pad 12 */
        return 32 * n + 20;
    }

    function toast(msg) {
        if (window.CherryUI && window.CherryUI.toast) window.CherryUI.toast(msg);
    }

    /* ============================ scale ============================ */
    function layout() {
        const fit = root.clientWidth / 1188;
        const k = fit * state.zoom;
        root.style.height = Math.round(700 * k) + "px";
        $("#cgSpace").style.width = Math.round(1188 * k) + "px";
        $("#cgSpace").style.height = Math.round(700 * k) + "px";
        $("#cgStage").style.setProperty("--k", k);
        state.k = k;
        const zv = $("#zoomValue");
        if (zv) zv.textContent = Math.round(state.zoom * 100) + "%";
    }

    /* ============================ sidebar ============================ */
    function renderCats() {
        catsEl.innerHTML = D.categories.map((c) => {
            const total = modules.filter((m) => m.cat === c.id).length;
            return `<div class="cg-cat ${c.id === state.cat ? "is-active" : ""}" data-cat="${c.id}">
                <span class="cg-cat__icon">${c.glyph}</span>
                <span class="cg-cat__name">${c.name}</span>
                <span class="cg-cat__count">${total}</span>
            </div>`;
        }).join("");
    }

    const QUICK = [
        { id: "fav", label: "Избранное", toggle: true },
        { id: "sort", label: "Активные сверху", toggle: true },
        { id: "compact", label: "Компактно", toggle: true },
        { id: "accent", label: "Акцент", toggle: true },
        { id: "expand", label: "Развернуть все", toggle: false }
    ];

    function quickActive(id) {
        if (id === "fav") return state.favOnly;
        if (id === "sort") return state.sortActive;
        if (id === "compact") return state.compact;
        return false;
    }

    function renderQuick() {
        quickEl.innerHTML = QUICK.map((q) => {
            const active = quickActive(q.id);
            return `<div class="cg-quick ${active ? "is-active" : ""}" data-quick="${q.id}">
                <span class="cg-quick__label">${q.label}</span>
                ${q.toggle
                    ? `<span class="cg-toggle ${active ? "is-on" : ""}" style="--tw:20px;--th:10px"><i></i></span>`
                    : `<span class="cg-quick__chev">${svg.chevron}</span>`}
            </div>`;
        }).join("");
    }

    function renderTopActions() {
        const items = [
            { id: "fav", icon: svg.star, title: "Избранное", active: state.favOnly },
            { id: "sort", icon: svg.sort, title: "Активные сверху", active: state.sortActive },
            { id: "compact", icon: svg.grid, title: "Компактно", active: state.compact },
            { id: "accent", icon: svg.palette, title: "Сменить акцент", active: false },
            { id: "expand", icon: svg.expand, title: "Развернуть все", active: false }
        ];
        topActionsEl.innerHTML = items.map((i) =>
            `<button class="cg-top-btn ${i.active ? "is-active" : ""}" data-quick="${i.id}" title="${i.title}">${i.icon}</button>`
        ).join("");
    }

    /* ============================ filtering ============================ */
    function visibleModules() {
        const q = state.query.trim().toLowerCase();
        let list;

        if (q) {
            list = modules.filter((m) =>
                m.name.toLowerCase().includes(q) ||
                catById.get(m.cat).name.toLowerCase().includes(q) ||
                m.settings.some((s) => s.label.toLowerCase().includes(q)));
        } else {
            list = modules.filter((m) => m.cat === state.cat);
        }

        if (state.favOnly) list = list.filter((m) => state.favorites.has(m.id));

        if (state.sortActive) {
            list = list.slice().sort((a, b) => (b.on ? 1 : 0) - (a.on ? 1 : 0) || a.order - b.order);
        }

        return list;
    }

    function updateHead() {
        const q = state.query.trim();
        const list = visibleModules();
        const tile = $("#cgTopIcon");
        const title = $("#cgTopTitle");
        const count = $("#cgTopCount");

        if (q) {
            tile.classList.add("is-search");
            tile.innerHTML = svg.search;
            title.textContent = "Поиск";
            count.textContent = `«${esc(q)}»`;
        } else {
            tile.classList.remove("is-search");
            tile.textContent = catById.get(state.cat).glyph;
            title.textContent = catById.get(state.cat).name;
            count.textContent = `${list.length} ${countWord(list.length)}`;
        }
    }

    /* ============================ card render ============================ */
    function toggleMarkup(on, tw, th) {
        return `<span class="cg-toggle ${on ? "is-on" : ""}" style="--tw:${tw}px;--th:${th}px"><i></i></span>`;
    }

    function rowMarkup(mod, s, idx) {
        const common = `data-m="${mod.id}" data-s="${idx}"`;
        const dot = `<span class="cg-row__dot"></span>`;

        if (s.type === "bool") {
            return `<div class="cg-row ${s.value ? "is-on" : ""}" data-type="bool" ${common}>
                ${dot}<span class="cg-row__label">${esc(s.label)}</span>
                ${toggleMarkup(s.value, 26, 14)}
            </div>`;
        }
        if (s.type === "slider") {
            const p = (s.value - s.min) / (s.max - s.min || 1);
            return `<div class="cg-row" data-type="slider" ${common}>
                ${dot}<span class="cg-row__label">${esc(s.label)}</span>
                <div class="cg-slider" data-slider>
                    <div class="cg-slider__track"><div class="cg-slider__fill" style="width:${p * 100}%"></div></div>
                    <div class="cg-slider__thumb" style="left:${p * 100}%"></div>
                </div>
                <span class="cg-row__value">${fmt(s.value, s.step)}${s.unit || ""}</span>
            </div>`;
        }
        if (s.type === "mode") {
            return `<div class="cg-row" data-type="mode" ${common}>
                ${dot}<span class="cg-row__label">${esc(s.label)}</span>
                <button class="cg-select" data-act="select" data-pop="${mod.id}:${idx}">
                    <span>${esc(s.value)}</span>${svg.chevron}
                </button>
            </div>`;
        }
        if (s.type === "multi") {
            return `<div class="cg-row" data-type="multi" ${common}>
                ${dot}<span class="cg-row__label">${esc(s.label)}</span>
                <button class="cg-select" data-act="multi" data-pop="${mod.id}:${idx}">
                    <span>${s.value.length} / ${s.options.length}</span>${svg.chevron}
                </button>
            </div>`;
        }
        if (s.type === "color") {
            const a = (s.alpha / 255).toFixed(2);
            return `<div class="cg-row" data-type="color" ${common}>
                ${dot}<span class="cg-row__label">${esc(s.label)}</span>
                <span class="cg-row__hex">${s.color.toUpperCase()}</span>
                <button class="cg-swatch" data-act="color" data-pop="${mod.id}:${idx}">
                    <span class="cg-swatch__fill" style="background:${s.color};opacity:${a}"></span>
                </button>
            </div>`;
        }
        if (s.type === "bind") {
            return `<div class="cg-row" data-type="bind" ${common}>
                ${dot}<span class="cg-row__label">${esc(s.label)}</span>
                <span class="cg-bind ${state.listening && state.listening.mod === mod.id && state.listening.idx === idx ? "is-listening" : ""}"
                      data-act="bind">${state.listening && state.listening.mod === mod.id && state.listening.idx === idx ? "..." : keyLabel(s.key)}</span>
            </div>`;
        }
        if (s.type === "string") {
            return `<div class="cg-row" data-type="string" ${common}>
                ${dot}<span class="cg-row__label">${esc(s.label)}</span>
                <input class="cg-input" value="${esc(s.value)}" spellcheck="false" autocomplete="off">
            </div>`;
        }
        /* button */
        return `<div class="cg-row" data-type="button" ${common}>
            ${dot}<span class="cg-row__label">${esc(s.label)}</span>
            <button class="cg-action" data-act="run">${esc(s.action || "Выполнить")}</button>
        </div>`;
    }

    function cardMarkup(mod, i, quiet) {
        const on = mod.on;
        const expanded = state.expanded.has(mod.id);
        const fav = state.favorites.has(mod.id);
        const hasSettings = mod.settings.length > 0;
        const delay = Math.min(i * 22, 300);
        const keyHtml = state.listening && state.listening.mod === mod.id && state.listening.idx === -1
            ? "..."
            : keyLabel(mod.key);

        return `<article class="cg-card ${on ? "is-on" : ""} ${expanded ? "is-open" : ""}"
                data-m="${mod.id}" style="animation-delay:${delay}ms${quiet ? ";animation:none" : ""}">
            <div class="cg-card__head">
                <span class="cg-card__icon ${hasSettings ? "" : "is-empty"}" data-act="expand">${mod.glyph}</span>
                <span class="cg-card__name">${esc(mod.name)}</span>
                <span class="cg-card__key ${state.listening && state.listening.mod === mod.id && state.listening.idx === -1 ? "is-listening" : ""}"
                      data-act="bind">${keyHtml}</span>
                <button class="cg-card__star ${fav ? "is-on" : ""}" data-act="fav" aria-label="В избранное">${svg.star}</button>
                ${toggleMarkup(on, 28, 16)}
            </div>
            <div class="cg-card__settings">
                <div class="cg-card__inner">
                    <div class="cg-card__divider"></div>
                    ${mod.settings.map((s, idx) => rowMarkup(mod, s, idx)).join("")}
                </div>
            </div>
        </article>`;
    }

    function renderGrid(animate) {
        const list = visibleModules();
        grid.classList.toggle("is-compact", state.compact);
        grid.innerHTML = list.map((m, i) => cardMarkup(m, i, !animate)).join("");
        $("#cgEmpty").classList.toggle("is-on", list.length === 0);

        list.forEach((m) => {
            if (state.expanded.has(m.id)) {
                const card = grid.querySelector(`.cg-card[data-m="${m.id}"]`);
                const box = card && card.querySelector(".cg-card__settings");
                if (box) box.style.height = settingsHeight(m) + "px";
            }
        });

        updateHead();
    }

    function flashCard(id) {
        const card = grid.querySelector(`.cg-card[data-m="${id}"]`);
        if (!card) return;
        card.classList.remove("is-flash");
        void card.offsetWidth;
        card.classList.add("is-flash");
    }

    /* ============================ interaction ============================ */
    function setExpanded(mod, want) {
        const card = grid.querySelector(`.cg-card[data-m="${mod.id}"]`);
        if (!card) return;
        const box = card.querySelector(".cg-card__settings");
        if (!box) return;

        if (want) {
            state.expanded.add(mod.id);
            card.classList.add("is-open");
            box.style.height = settingsHeight(mod) + "px";
        } else {
            state.expanded.delete(mod.id);
            card.classList.remove("is-open");
            box.style.height = box.scrollHeight + "px";
            requestAnimationFrame(() => { box.style.height = "0px"; });
        }
    }

    function toggleModule(mod) {
        mod.on = !mod.on;
        const card = grid.querySelector(`.cg-card[data-m="${mod.id}"]`);
        if (card) {
            card.classList.toggle("is-on", mod.on);
            const t = card.querySelector(".cg-toggle");
            if (t) t.classList.toggle("is-on", mod.on);
        }
    }

    function runQuick(id) {
        closePopup();
        if (id === "fav") {
            state.favOnly = !state.favOnly;
            if (state.favOnly && !visibleModules().length) {
                toast("В избранном пока пусто — жми звёздочку на карточке");
            }
        } else if (id === "sort") {
            state.sortActive = !state.sortActive;
            toast(state.sortActive ? "Активные модули сверху" : "Сортировка по умолчанию");
        } else if (id === "compact") {
            state.compact = !state.compact;
        } else if (id === "accent") {
            const i = D.accents.indexOf(state.accent);
            setAccent(D.accents[(i + 1) % D.accents.length]);
            toast("Акцент: " + state.accent.toUpperCase());
        } else if (id === "expand") {
            const list = visibleModules();
            const anyClosed = list.some((m) => !state.expanded.has(m.id));
            list.forEach((m) => setExpanded(m, anyClosed));
            toast(anyClosed ? "Все модули раскрыты" : "Все модули свёрнуты");
        }
        renderQuick();
        renderTopActions();
        renderGrid();
    }

    function setAccent(color) {
        state.accent = color;
        root.style.setProperty("--accent", color);
        $$(".swatch[data-accent]").forEach((s) =>
            s.classList.toggle("is-active", s.dataset.accent.toLowerCase() === color.toLowerCase()));
    }

    /* ---------------- popups ---------------- */
    function closePopup(keepColor) {
        if (!state.popup) return;
        const p = state.popup;
        if (p.el && p.el.parentNode) p.el.remove();
        if (p.anchor) p.anchor.classList.remove("is-open");
        if (!keepColor) state.color = null;
        state.popup = null;
    }

    function place(el, rect, align) {
        const k = state.k || 1;
        const pw = (el.offsetWidth || 180 * k) / k;
        const ph = (el.offsetHeight || 100 * k) / k;
        let x = align === "right" ? rect.x + rect.w - pw : rect.x;
        let y = rect.y + rect.h + 6;
        if (x + pw > 1172) x = 1172 - pw;
        if (x < 16) x = 16;
        if (y + ph > 684) y = Math.max(56, rect.y - ph - 6);
        el.style.left = Math.round(x) + "px";
        el.style.top = Math.round(y) + "px";
    }

    function openSelect(anchor, mod, s, idx) {
        closePopup();
        const el = document.createElement("div");
        el.className = "cg-pop";
        el.innerHTML = s.options.map((o) =>
            `<div class="cg-pop__row ${o === s.value ? "is-selected" : ""}" data-val="${esc(o)}">
                <span class="cg-pop__check">${svg.check}</span>
                <span class="cg-pop__label">${esc(o)}</span>
            </div>`).join("");
        el.style.minWidth = Math.round(160 * (state.k || 1)) + "px";
        popups.appendChild(el);
        state.popup = { type: "select", el, anchor, mod, idx, setting: s };
        anchor.classList.add("is-open");
        place(el, rel(anchor), "right");

        el.addEventListener("click", (e) => {
            const row = e.target.closest("[data-val]");
            if (!row) return;
            s.value = row.dataset.val;
            closePopup();
            renderGrid();
        });
    }

    function openMulti(anchor, mod, s, idx) {
        closePopup();
        const el = document.createElement("div");
        el.className = "cg-pop";
        el.innerHTML = s.options.map((o) =>
            `<div class="cg-pop__row ${s.value.includes(o) ? "is-selected" : ""}" data-val="${esc(o)}">
                <span class="cg-pop__check">${svg.check}</span>
                <span class="cg-pop__label">${esc(o)}</span>
            </div>`).join("");
        el.style.minWidth = Math.round(180 * (state.k || 1)) + "px";
        popups.appendChild(el);
        state.popup = { type: "multi", el, anchor, mod, idx, setting: s };
        anchor.classList.add("is-open");
        place(el, rel(anchor), "right");

        el.addEventListener("click", (e) => {
            const row = e.target.closest("[data-val]");
            if (!row) return;
            const v = row.dataset.val;
            if (s.value.includes(v)) s.value = s.value.filter((x) => x !== v);
            else s.value.push(v);
            row.classList.toggle("is-selected");
            const btn = anchor.querySelector("span");
            if (btn) btn.textContent = `${s.value.length} / ${s.options.length}`;
            const mcard = grid.querySelector(`.cg-card[data-m="${mod.id}"]`);
            if (mcard) { /* keep */ }
        });
    }

    function openColor(anchor, mod, s, idx) {
        closePopup();
        const el = document.createElement("div");
        el.className = "cg-pop cg-picker";
        el.innerHTML = `
            <div class="cg-picker__sv" data-zone="sv"><div class="cg-picker__knob"></div></div>
            <div class="cg-picker__slider cg-picker__slider--hue" data-zone="hue"><div class="cg-picker__slider-thumb"></div></div>
            <div class="cg-picker__slider cg-picker__slider--alpha" data-zone="alpha">
                <div class="cg-picker__alpha-fill"></div><div class="cg-picker__slider-thumb"></div>
            </div>
            <div class="cg-picker__bottom">
                <div class="cg-picker__preview"><i></i></div>
                <input class="cg-picker__hex" maxlength="7" spellcheck="false">
            </div>
            <div class="cg-picker__presets">
                ${["#38bdf8", "#ff3d6e", "#8b5cf6", "#4ade80", "#f5b544", "#ffffff", "#101828"].map((c) =>
                    `<button class="cg-picker__preset" data-preset="${c}" style="background:${c}"></button>`).join("")}
            </div>`;
        popups.appendChild(el);

        const rgb = hexToRgb(s.color);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        state.color = { el, mod, idx, setting: s, h: hsv.h, sv: hsv.s, v: hsv.v, a: s.alpha / 255 };
        state.popup = { type: "color", el, anchor, mod, idx, setting: s };
        anchor.classList.add("is-open");
        place(el, rel(anchor), "right");
        paintPicker();

        el.addEventListener("pointerdown", (e) => {
            const zone = e.target.closest("[data-zone]");
            if (!zone) return;
            const z = zone.dataset.zone;
            const start = (ev) => dragColor(z, zone, ev);
            start(e);
            const move = (ev) => dragColor(z, zone, ev);
            const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
        });

        el.querySelector(".cg-picker__hex").addEventListener("change", (e) => {
            const c = e.target.value.trim();
            if (!/^#?[0-9a-f]{6}$/i.test(c)) { paintPicker(); return; }
            const r = hexToRgb(c.startsWith("#") ? c : "#" + c);
            const h = rgbToHsv(r.r, r.g, r.b);
            state.color.h = h.h; state.color.sv = h.s; state.color.v = h.v;
            commitColor();
        });

        el.querySelectorAll("[data-preset]").forEach((b) => {
            b.addEventListener("click", (e) => {
                e.stopPropagation();
                const r = hexToRgb(b.dataset.preset);
                const h = rgbToHsv(r.r, r.g, r.b);
                state.color.h = h.h; state.color.sv = h.s; state.color.v = h.v;
                commitColor();
            });
        });
    }

    function rel(el) {
        const p = panel.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const k = state.k || 1;
        return { x: (r.left - p.left) / k, y: (r.top - p.top) / k, w: r.width / k, h: r.height / k };
    }

    function colorHex() {
        const c = state.color;
        const rgb = hsvToRgb(c.h, c.sv, c.v);
        return "#" + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, "0")).join("");
    }

    function paintPicker() {
        const c = state.color;
        if (!c) return;
        const el = c.el;
        const hex = colorHex();
        const rgb = hsvToRgb(c.h, c.sv, c.v);

        const sv = el.querySelector('[data-zone="sv"]');
        sv.style.background = `linear-gradient(to right, #fff, hsl(${Math.round(c.h)},100%,50%))`;
        sv.querySelector(".cg-picker__knob").style.left = c.sv * 100 + "%";
        sv.querySelector(".cg-picker__knob").style.top = (1 - c.v) * 100 + "%";

        const hue = el.querySelector('[data-zone="hue"]');
        hue.querySelector(".cg-picker__slider-thumb").style.left = (c.h / 360) * 100 + "%";

        const alpha = el.querySelector('[data-zone="alpha"]');
        alpha.querySelector(".cg-picker__alpha-fill").style.background =
            `linear-gradient(90deg, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgb(${rgb.r},${rgb.g},${rgb.b}))`;
        alpha.querySelector(".cg-picker__slider-thumb").style.left = c.a * 100 + "%";

        el.querySelector(".cg-picker__preview i").style.background =
            `rgba(${rgb.r},${rgb.g},${rgb.b},${c.a})`;
        el.querySelector(".cg-picker__hex").value = hex.toUpperCase();

        c.setting.color = hex;
        c.setting.alpha = Math.round(c.a * 255);
        syncColorRow(c.mod, c.idx, hex, c.a);
    }

    function syncColorRow(mod, idx, hex, a) {
        const row = grid.querySelector(`.cg-row[data-m="${mod.id}"][data-s="${idx}"]`);
        if (!row) return;
        const fill = row.querySelector(".cg-swatch__fill");
        const label = row.querySelector(".cg-row__hex");
        if (fill) { fill.style.background = hex; fill.style.opacity = a; }
        if (label) label.textContent = hex.toUpperCase();
    }

    function dragColor(zone, el, e) {
        const c = state.color;
        if (!c) return;
        const r = el.getBoundingClientRect();
        if (zone === "sv") {
            c.sv = clamp((e.clientX - r.left) / r.width, 0, 1);
            c.v = 1 - clamp((e.clientY - r.top) / r.height, 0, 1);
        } else if (zone === "hue") {
            c.h = clamp((e.clientX - r.left) / r.width, 0, 1) * 360;
        } else {
            c.a = clamp((e.clientX - r.left) / r.width, 0, 1);
        }
        paintPicker();
    }

    function commitColor() {
        paintPicker();
    }

    /* ---------------- color maths ---------------- */
    function hexToRgb(hex) {
        const h = hex.replace("#", "");
        const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const d = mx - mn;
        let h = 0;
        if (d) {
            if (mx === r) h = ((g - b) / d) % 6;
            else if (mx === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
            if (h < 0) h += 360;
        }
        return { h, s: mx ? d / mx : 0, v: mx };
    }

    function hsvToRgb(h, s, v) {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
    }

    /* ---------------- configs ---------------- */
    function openConfigs() {
        if (state.popup && state.popup.type === "configs") { closePopup(); return; }
        closePopup();

        const btn = $("#cgConfigs");
        const el = document.createElement("div");
        el.className = "cg-pop cg-cfg";
        el.innerHTML = `
            <div class="cg-cfg__head"><b>Configs</b><span>${state.configs.length} шт.</span></div>
            <div class="cg-cfg__list">
                ${state.configs.map((c, i) => `
                    <div class="cg-cfg__row ${c.name === state.currentConfig ? "is-current" : ""}" data-cfg="${i}">
                        <span>${esc(c.name)}</span><small>${esc(c.note || "")}</small>
                    </div>`).join("")}
            </div>
            <div class="cg-cfg__create">
                <input placeholder="имя нового конфига" maxlength="24" spellcheck="false">
                <button data-create>Создать конфиг</button>
            </div>`;

        popups.appendChild(el);
        state.popup = { type: "configs", el, anchor: btn };
        btn.classList.add("is-open");

        const rect = rel(btn);
        el.style.left = Math.round(rect.x) + "px";
        el.style.width = Math.round(rect.w) + "px";
        el.style.visibility = "hidden";
        const h = el.offsetHeight;
        const top = Math.max(56, rect.y - h - 8);
        el.style.top = Math.round(top) + "px";
        el.style.visibility = "";

        el.addEventListener("click", (e) => {
            const row = e.target.closest("[data-cfg]");
            if (row) {
                const c = state.configs[+row.dataset.cfg];
                loadConfig(c.name);
                return;
            }
            if (e.target.closest("[data-create]")) createConfig(el);
        });

        el.addEventListener("contextmenu", (e) => {
            const row = e.target.closest("[data-cfg]");
            if (!row) return;
            e.preventDefault();
            const c = state.configs[+row.dataset.cfg];
            openConfigContext(row, c);
        });

        el.addEventListener("dblclick", (e) => {
            const row = e.target.closest("[data-cfg]");
            if (!row) return;
            renameConfig(row, state.configs[+row.dataset.cfg]);
        });

        el.querySelector("input").addEventListener("keydown", (e) => {
            if (e.key === "Enter") createConfig(el);
            e.stopPropagation();
        });
    }

    function createConfig(el) {
        const input = el.querySelector("input");
        const name = input.value.trim().replace(/[^\w\-. ]/g, "");
        if (name.length < 2) { toast("Имя конфига слишком короткое"); return; }
        if (state.configs.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
            toast("Такой конфиг уже есть");
            return;
        }
        state.configs.push({ name, note: "new", updated: "только что" });
        state.currentConfig = name;
        $("#cgConfigName").textContent = name + ".cherry";
        toast(`Конфиг «${name}» создан`);
        openConfigs();
    }

    function loadConfig(name) {
        state.currentConfig = name;
        $("#cgConfigName").textContent = name + ".cherry";
        toast(`Конфиг «${name}» загружен`);
        closePopup();
        $$(".cg-cfg__row").forEach((r) => r.classList.toggle("is-current", r.textContent.includes(name)));
    }

    function openConfigContext(row, cfg) {
        const prev = state.popup;
        if (prev && prev.el) prev.el.remove();

        const el = document.createElement("div");
        el.className = "cg-pop cg-ctx";
        el.innerHTML = `
            <div class="cg-pop__row" data-a="load">Загрузить</div>
            <div class="cg-pop__row" data-a="dup">Дублировать</div>
            <div class="cg-pop__row" data-a="ren">Переименовать</div>
            <div class="cg-ctx__sep"></div>
            <div class="cg-pop__row danger" data-a="del">Удалить</div>`;
        popups.appendChild(el);
        state.popup = { type: "ctx", el, anchor: $("#cgConfigs"), cfg };

        const r = rel(row);
        el.style.left = Math.round(Math.min(r.x + r.w + 4, 1172 - 168)) + "px";
        el.style.top = Math.round(r.y) + "px";

        el.addEventListener("click", (e) => {
            const a = e.target.closest("[data-a]");
            if (!a) return;
            const act = a.dataset.a;
            if (act === "load") loadConfig(cfg.name);
            else if (act === "dup") {
                let name = cfg.name + "-copy";
                let i = 2;
                while (state.configs.some((c) => c.name === name)) name = cfg.name + "-copy" + i++;
                state.configs.push({ name, note: "copy", updated: "только что" });
                toast(`Создана копия «${name}»`);
                closePopup();
                openConfigs();
            } else if (act === "ren") {
                closePopup();
                openConfigs();
                requestAnimationFrame(() => {
                    const rowEl = state.popup && state.popup.el.querySelector(`[data-cfg="${state.configs.indexOf(cfg)}"]`);
                    if (rowEl) renameConfig(rowEl, cfg);
                });
            } else if (act === "del") {
                if (state.configs.length <= 1) { toast("Нельзя удалить последний конфиг"); return; }
                state.configs = state.configs.filter((c) => c !== cfg);
                if (state.currentConfig === cfg.name) {
                    state.currentConfig = state.configs[0].name;
                    $("#cgConfigName").textContent = state.currentConfig + ".cherry";
                }
                toast(`Конфиг «${cfg.name}» удалён`);
                closePopup();
                openConfigs();
            }
        });
    }

    function renameConfig(row, cfg) {
        const span = row.querySelector("span");
        if (!span) return;
        const input = document.createElement("input");
        input.value = cfg.name;
        input.style.cssText = "flex:1;min-width:0;height:18px;border:0;outline:0;border-radius:3px;background:rgba(255,255,255,.12);color:inherit;font:inherit;padding:0 4px";
        span.replaceWith(input);
        input.focus();
        input.select();
        let closed = false;
        const done = (save) => {
            if (closed) return;
            closed = true;
            if (save) {
                const v = input.value.trim().replace(/[^\w\-. ]/g, "");
                if (v.length >= 2) {
                    if (state.currentConfig === cfg.name) {
                        state.currentConfig = v;
                        $("#cgConfigName").textContent = v + ".cherry";
                    }
                    cfg.name = v;
                    toast("Конфиг переименован");
                }
            }
            closePopup();
            openConfigs();
        };
        input.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key === "Enter") done(true);
            if (e.key === "Escape") done(false);
        });
        input.addEventListener("blur", () => done(true));
    }

    /* ============================ events ============================ */
    catsEl.addEventListener("click", (e) => {
        const row = e.target.closest("[data-cat]");
        if (!row || row.dataset.cat === state.cat) return;
        state.cat = row.dataset.cat;
        state.expanded = leadModule(state.cat);
        closePopup();
        renderCats();
        grid.classList.add("is-switching");
        clearTimeout(state.switchTimer);
        state.switchTimer = setTimeout(() => {
            renderGrid();
            grid.classList.remove("is-switching");
        }, 120);
    });

    quickEl.addEventListener("click", (e) => {
        const row = e.target.closest("[data-quick]");
        if (row) runQuick(row.dataset.quick);
    });

    topActionsEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-quick]");
        if (btn) runQuick(btn.dataset.quick);
    });

    searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        searchWrap.classList.toggle("has-value", !!state.query);
        closePopup();
        renderGrid();
    });

    searchWrap.addEventListener("click", (e) => {
        if (e.target.closest("#cgSearchClear")) {
            searchInput.value = "";
            state.query = "";
            searchWrap.classList.remove("has-value");
            renderGrid();
            return;
        }
        searchInput.focus();
    });

    searchInput.addEventListener("focus", () => searchWrap.classList.add("is-focus"));
    searchInput.addEventListener("blur", () => searchWrap.classList.remove("is-focus"));
    searchInput.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Escape") { searchInput.value = ""; state.query = ""; searchWrap.classList.remove("has-value"); renderGrid(); searchInput.blur(); }
    });

    $("#cgConfigs").addEventListener("click", (e) => {
        e.stopPropagation();
        openConfigs();
    });

    /* grid delegation */
    grid.addEventListener("click", (e) => {
        const card = e.target.closest(".cg-card");
        if (!card) return;
        const mod = byId.get(card.dataset.m);
        if (!mod) return;

        const actEl = e.target.closest("[data-act]");
        const act = actEl && actEl.dataset.act;

        if (act === "fav") {
            if (state.favorites.has(mod.id)) state.favorites.delete(mod.id);
            else state.favorites.add(mod.id);
            actEl.classList.toggle("is-on", state.favorites.has(mod.id));
            if (state.favOnly) renderGrid();
            return;
        }

        if (act === "expand") {
            setExpanded(mod, !state.expanded.has(mod.id));
            return;
        }

        if (act === "bind") {
            startListening(mod, -1);
            return;
        }

        if (act === "select") {
            const row = actEl.closest(".cg-row");
            const s = mod.settings[+row.dataset.s];
            if (state.popup && state.popup.anchor === actEl) { closePopup(); return; }
            openSelect(actEl, mod, s, +row.dataset.s);
            return;
        }

        if (act === "multi") {
            const row = actEl.closest(".cg-row");
            const s = mod.settings[+row.dataset.s];
            if (state.popup && state.popup.anchor === actEl) { closePopup(); return; }
            openMulti(actEl, mod, s, +row.dataset.s);
            return;
        }

        if (act === "color") {
            const row = actEl.closest(".cg-row");
            const s = mod.settings[+row.dataset.s];
            if (state.popup && state.popup.anchor === actEl) { closePopup(); return; }
            openColor(actEl, mod, s, +row.dataset.s);
            return;
        }

        if (act === "run") {
            const row = actEl.closest(".cg-row");
            const s = mod.settings[+row.dataset.s];
            toast(`${s.action}: ${mod.name} · ${s.label}`);
            return;
        }

        const row = e.target.closest(".cg-row");
        if (row) {
            const idx = +row.dataset.s;
            const s = mod.settings[idx];
            if (!s) return;

            if (s.type === "bool") {
                s.value = !s.value;
                row.classList.toggle("is-on", s.value);
                const t = row.querySelector(".cg-toggle");
                if (t) t.classList.toggle("is-on", s.value);
                return;
            }
            if (s.type === "button") {
                toast(`${s.action}: ${s.label}`);
                return;
            }
            if (s.type === "bind") {
                startListening(mod, idx);
                return;
            }
            if (s.type === "select" || s.type === "mode") return;
            return;
        }

        toggleModule(mod);
    });

    grid.addEventListener("contextmenu", (e) => {
        const card = e.target.closest(".cg-card");
        if (!card) return;
        const mod = byId.get(card.dataset.m);
        if (!mod || !mod.settings.length) return;
        e.preventDefault();
        setExpanded(mod, !state.expanded.has(mod.id));
    });

    /* sliders */
    let drag = null;
    grid.addEventListener("pointerdown", (e) => {
        const slider = e.target.closest(".cg-slider");
        if (!slider) return;
        e.preventDefault();
        const row = slider.closest(".cg-row");
        const mod = byId.get(row.dataset.m);
        const s = mod.settings[+row.dataset.s];
        slider.setPointerCapture(e.pointerId);
        drag = { slider, mod, s, row };
        slider.classList.add("is-drag");
        updateSlider(drag, e);
    });

    grid.addEventListener("pointermove", (e) => {
        if (drag) updateSlider(drag, e);
    });

    grid.addEventListener("pointerup", (e) => {
        if (!drag) return;
        drag.slider.classList.remove("is-drag");
        try { drag.slider.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }
        drag = null;
    });

    function updateSlider(d, e) {
        const r = d.slider.getBoundingClientRect();
        let p = clamp((e.clientX - r.left) / r.width, 0, 1);
        const { s } = d;
        let v = s.min + p * (s.max - s.min);
        v = Math.round(v / s.step) * s.step;
        v = clamp(v, s.min, s.max);
        s.value = v;
        p = (v - s.min) / (s.max - s.min || 1);
        const fill = d.slider.querySelector(".cg-slider__fill");
        const thumb = d.slider.querySelector(".cg-slider__thumb");
        if (fill) fill.style.width = p * 100 + "%";
        if (thumb) thumb.style.left = p * 100 + "%";
        const val = d.row.querySelector(".cg-row__value");
        if (val) val.textContent = fmt(v, s.step) + (s.unit || "");
    }

    /* string inputs */
    grid.addEventListener("input", (e) => {
        const input = e.target.closest(".cg-input");
        if (!input) return;
        const row = input.closest(".cg-row");
        const mod = byId.get(row.dataset.m);
        const s = mod.settings[+row.dataset.s];
        if (s) s.value = input.value;
    });

    grid.addEventListener("keydown", (e) => {
        if (e.target.closest(".cg-input")) e.stopPropagation();
    });

    /* key listening */
    function startListening(mod, idx) {
        state.listening = { mod: mod.id, idx };
        renderGrid();
        const card = grid.querySelector(`.cg-card[data-m="${mod.id}"]`);
        if (card) flashCard(mod.id);
    }

    function stopListening() {
        state.listening = null;
        renderGrid();
    }

    window.addEventListener("keydown", (e) => {
        if (!state.listening) {
            if (e.key === "Escape") closePopup();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const { mod: id, idx } = state.listening;
        const mod = byId.get(id);
        if (!mod) { state.listening = null; return; }

        if (e.key === "Escape") { stopListening(); return; }
        if (e.key === "Backspace" || e.key === "Delete") {
            if (idx === -1) mod.key = null;
            else if (mod.settings[idx]) mod.settings[idx].key = null;
            stopListening();
            return;
        }
        const key = e.key === " " ? " " : e.key;
        if (idx === -1) mod.key = key;
        else if (mod.settings[idx]) mod.settings[idx].key = key;
        stopListening();
        toast(`${mod.name}: ${keyLabel(key)}`);
    }, true);

    /* outside click closes popups */
    document.addEventListener("pointerdown", (e) => {
        if (!state.popup) return;
        const p = state.popup;
        if (p.el && p.el.contains(e.target)) return;
        if (p.anchor && p.anchor.contains(e.target)) return;
        if (e.target.closest("#cgConfigs")) return;
        closePopup();
    }, true);

    content.addEventListener("scroll", () => {
        if (state.popup) closePopup();
    });

    /* ============================ boot ============================ */
    window.CherryGUI = {
        render() { renderCats(); renderQuick(); renderTopActions(); renderGrid(); },
        setAccent,
        setTheme(light) {
            state.light = light;
            panel.classList.toggle("is-light", light);
            const d = $("#themeDark"), l = $("#themeLight");
            if (d) d.classList.toggle("is-active", !light);
            if (l) l.classList.toggle("is-active", light);
            closePopup();
        },
        zoom(delta) {
            state.zoom = clamp(Math.round((state.zoom + delta) * 100) / 100, 0.5, 2.5);
            layout();
            closePopup();
        },
        resetZoom() { state.zoom = 1; layout(); },
        focusModule(id) {
            const mod = byId.get(id);
            if (!mod) return;
            state.query = "";
            searchInput.value = "";
            searchWrap.classList.remove("has-value");
            state.cat = mod.cat;
            state.favOnly = false;
            renderCats(); renderQuick(); renderTopActions(); renderGrid();
            state.expanded.add(id);
            renderGrid();
            flashCard(id);
        },
        layout
    };

    layout();
    window.CherryGUI.render();
    window.addEventListener("resize", layout);
})();
