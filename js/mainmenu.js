/* =====================================================================
   Interactive replica of the in-game Cherry main menu (960 x 540)
   ===================================================================== */

(function () {
    "use strict";

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const mm = $("#mainmenu");
    const stage = $("#mmStage");
    if (!mm || !stage) return;

    const tone = ["a", "b", "c", "d"];
    let accounts = [
        { name: "Steve", active: true, fav: false, tone: "a" },
        { name: "Alex", active: false, fav: true, tone: "b" },
        { name: "Herobrine", active: false, fav: false, tone: "c" },
        { name: "Notch", active: false, fav: false, tone: "d" },
        { name: "CherryFan", active: false, fav: true, tone: "a" },
        { name: "VoidWalker", active: false, fav: false, tone: "c" }
    ];
    let activeName = "Steve";
    let selected = "Steve";
    let query = "";
    let scrollY = 0;
    let view = "main";

    const grid = $("#mmGrid");
    const gridInner = $("#mmGridInner");
    const empty = $("#mmEmpty");

    /* ===================== helpers ===================== */
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    let toastTimer = null;
    function toast(msg) {
        const box = $("#mmToast");
        const txt = $("#mmToastText");
        if (!box || !txt) return;
        txt.textContent = msg;
        box.classList.add("is-on");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => box.classList.remove("is-on"), 2100);
    }

    function setView(next) {
        if (next === view) return;
        view = next;
        $$(".mm__view", stage).forEach((v) => v.classList.toggle("is-active", v.dataset.view === next));
        if (next === "accounts") {
            renderAccounts();
            setTimeout(() => { const i = $("#mmNickInput"); if (i) i.focus(); }, 120);
        }
    }

    function filtered() {
        const q = query.trim().toLowerCase();
        let list = accounts.filter((a) => !q || a.name.toLowerCase().includes(q));
        list = list.slice().sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0));
        return list;
    }

    /* ===================== accounts render ===================== */
    function renderAccounts() {
        const list = filtered();

        $("#mmAccCount").textContent = String(accounts.length);
        $("#mmLoginName").textContent = selected && accounts.some((a) => a.name === selected) ? selected : activeName;

        gridInner.innerHTML = list.map((a) => `
            <div class="mm-acc ${a.name === selected ? "is-selected" : ""} ${a.name === activeName ? "is-active" : ""}"
                 data-name="${esc(a.name)}">
                <div class="mm-acc__head mm-acc__head--${a.tone}"></div>
                <div class="mm-acc__meta">
                    <small>${a.name === activeName ? "активный" : "offline"}</small>
                    <b>${esc(a.name)}</b>
                </div>
                ${a.name === activeName
                    ? '<span class="mm-acc__badge">активен</span>'
                    : `<button class="mm-acc__star ${a.fav ? "is-on" : ""}" data-star="${esc(a.name)}" aria-label="В избранное">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z"/></svg>
                       </button>`}
            </div>`).join("");

        empty.style.display = list.length ? "none" : "block";
        grid.style.display = list.length ? "block" : "none";
        clampScroll();
    }

    function maxScroll() {
        return Math.max(0, gridInner.scrollHeight - grid.clientHeight);
    }

    function clampScroll() {
        scrollY = Math.min(Math.max(0, scrollY), maxScroll());
        gridInner.style.transform = `translateY(${-scrollY}px)`;
    }

    function updateSelection() {
        $$(".mm-acc", gridInner).forEach((c) => {
            c.classList.toggle("is-selected", c.dataset.name === selected);
        });
        const nameEl = $("#mmLoginName");
        if (nameEl) nameEl.textContent = accounts.some((a) => a.name === selected) ? selected : activeName;
    }

    /* ===================== create / delete ===================== */
    function normalizeNick(v) {
        return v.replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
    }

    function addAccount(name) {
        const nick = normalizeNick(name);
        if (nick.length < 3) { toast("Ник: 3–16 символов, A–Z, 0–9, _"); return false; }
        if (accounts.some((a) => a.name.toLowerCase() === nick.toLowerCase())) {
            toast("Такой аккаунт уже есть");
            return false;
        }
        accounts.push({ name: nick, active: false, fav: false, tone: tone[accounts.length % 4] });
        selected = nick;
        toast(`Аккаунт «${nick}» создан`);
        renderAccounts();
        return true;
    }

    let deleteArmed = 0;
    function armDelete(btn, action) {
        const now = Date.now();
        if (armDelete.armed && armDelete.armed.btn === btn && now - armDelete.armed.at < 2800) {
            armDelete.armed = null;
            btn.classList.remove("is-confirm");
            action();
            return;
        }
        armDelete.armed = { btn, at: now };
        const old = btn.innerHTML;
        btn.classList.add("is-confirm");
        btn.textContent = "Точно?";
        setTimeout(() => {
            if (armDelete.armed && armDelete.armed.btn === btn) armDelete.armed = null;
            btn.classList.remove("is-confirm");
            if (btn.isConnected) btn.innerHTML = old;
        }, 2800);
    }

    function deleteSelected() {
        if (!accounts.some((a) => a.name === selected)) { toast("Аккаунт не выбран"); return; }
        if (accounts.length <= 1) { toast("Нельзя удалить последний аккаунт"); return; }
        const name = selected;
        accounts = accounts.filter((a) => a.name !== name);
        if (activeName === name) {
            activeName = accounts[0].name;
            accounts[0].active = true;
            $("#mmBadgeName").textContent = activeName;
        }
        selected = accounts[0].name;
        toast(`Аккаунт «${name}» удалён`);
        renderAccounts();
    }

    /* ===================== input wiring ===================== */
    function mountInput(field, placeholderEl, opts = {}) {
        const input = document.createElement("input");
        input.className = "mm-field__input";
        input.type = "text";
        input.placeholder = placeholderEl ? placeholderEl.textContent : "";
        input.spellcheck = false;
        input.autocomplete = "off";
        if (opts.maxlength) input.maxLength = opts.maxlength;
        field.appendChild(input);
        if (placeholderEl) placeholderEl.style.display = "none";

        field.addEventListener("pointerdown", (e) => {
            if (e.target !== input) {
                e.preventDefault();
                input.focus();
            }
        });

        input.addEventListener("focus", () => field.classList.add("is-focus"));
        input.addEventListener("blur", () => field.classList.remove("is-focus"));
        input.addEventListener("input", () => {
            if (opts.sanitize) {
                const clean = opts.sanitize(input.value);
                if (clean !== input.value) input.value = clean;
            }
            field.classList.toggle("has-value", !!input.value);
            if (opts.onInput) opts.onInput(input.value);
        });
        return input;
    }

    const nickField = $("#mmNickField");
    const nickText = $("#mmNickText");
    const nickInput = mountInput(nickField, nickText, {
        maxlength: 16,
        sanitize: (v) => v.replace(/[^A-Za-z0-9_]/g, ""),
        onInput: () => {}
    });
    nickInput.id = "mmNickInput";
    nickInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") createFromInput();
        e.stopPropagation();
    });

    const searchField = $("#mmSearchField");
    const searchText = $("#mmSearchText");
    const searchInput = mountInput(searchField, searchText, {
        maxlength: 16,
        onInput: (v) => {
            query = v;
            scrollY = 0;
            renderAccounts();
        }
    });
    searchInput.addEventListener("keydown", (e) => e.stopPropagation());

    function createFromInput() {
        const ok = addAccount(nickInput.value);
        if (ok) {
            nickInput.value = "";
            nickField.classList.remove("has-value");
            nickInput.blur();
        }
    }

    $("#mmCreate").addEventListener("click", createFromInput);

    const RANDOM_A = ["Cherry", "Void", "Neon", "Pixel", "Frost", "Blaze", "Ender", "Aura", "Night", "Ghost", "Lava", "Storm"];
    const RANDOM_B = ["PvP", "X", "Wolf", "Bee", "Fox", "42", "Zero", "Craft", "Kit", "Pro", "Kid", "One"];
    $("#mmRandom").addEventListener("click", () => {
        let nick = "";
        do {
            nick = RANDOM_A[Math.floor(Math.random() * RANDOM_A.length)] +
                RANDOM_B[Math.floor(Math.random() * RANDOM_B.length)] +
                (Math.random() > 0.55 ? Math.floor(Math.random() * 90 + 10) : "");
        } while (accounts.some((a) => a.name.toLowerCase() === nick.toLowerCase()));
        nickInput.value = nick;
        nickField.classList.add("has-value");
        nickInput.focus();
        toast("Случайный ник: " + nick);
    });

    /* grid interactions */
    gridInner.addEventListener("click", (e) => {
        const star = e.target.closest("[data-star]");
        if (star) {
            e.stopPropagation();
            const acc = accounts.find((a) => a.name === star.dataset.star);
            if (acc) {
                acc.fav = !acc.fav;
                renderAccounts();
            }
            return;
        }
        const card = e.target.closest("[data-name]");
        if (!card) return;
        selected = card.dataset.name;
        updateSelection();
    });

    gridInner.addEventListener("dblclick", (e) => {
        const card = e.target.closest("[data-name]");
        if (!card) return;
        loginAs(card.dataset.name);
    });

    function loginAs(name) {
        const acc = accounts.find((a) => a.name === name);
        if (!acc) return;
        accounts.forEach((a) => { a.active = a.name === name; });
        activeName = name;
        selected = name;
        $("#mmBadgeName").textContent = name;
        toast(`Вход выполнен: ${name}`);
        renderAccounts();
        setTimeout(() => setView("main"), 520);
    }

    $("#mmLogin").addEventListener("click", () => {
        const name = accounts.some((a) => a.name === selected) ? selected : activeName;
        if (!name) { toast("Сначала создай аккаунт"); return; }
        loginAs(name);
    });

    const delBtn = $("#mmDelete");
    delBtn.addEventListener("click", () => armDelete(delBtn, deleteSelected));

    const delFoundBtn = $("#mmDeleteFound");
    delFoundBtn.addEventListener("click", () => {
        if (!query.trim()) { toast("Сначала введи запрос в поиск"); return; }
        armDelete(delFoundBtn, () => {
            const list = filtered();
            const removable = list.filter((a) => accounts.length > 1 || a.name !== activeName);
            if (!removable.length) { toast("Нечего удалять"); return; }
            const names = new Set(removable.map((a) => a.name));
            accounts = accounts.filter((a) => !names.has(a.name));
            if (!accounts.some((a) => a.name === activeName)) {
                activeName = accounts[0].name;
                accounts[0].active = true;
                $("#mmBadgeName").textContent = activeName;
            }
            selected = accounts[0].name;
            toast(`Удалено аккаунтов: ${removable.length}`);
            renderAccounts();
        });
    });

    $("#mmFolder").addEventListener("click", () => {
        toast("В игре откроется .minecraft/cherry/accounts");
    });

    const delAll = $("#mmDeleteAll");
    delAll.addEventListener("click", () => {
        if (delAll.dataset.armed === "1") {
            delAll.dataset.armed = "0";
            delAll.textContent = "Удалить все аккаунты";
            toast("Аккаунты не удалены — демо");
            return;
        }
        delAll.dataset.armed = "1";
        delAll.textContent = "Точно удалить все?";
        delAll.style.color = "#f87171";
        setTimeout(() => {
            delAll.dataset.armed = "0";
            delAll.textContent = "Удалить все аккаунты";
            delAll.style.color = "";
        }, 2800);
    });

    /* scroll inside the grid */
    grid.addEventListener("wheel", (e) => {
        const max = maxScroll();
        if (max <= 0) return;
        const next = scrollY + (e.deltaY > 0 ? 32 : -32);
        if ((next < 0 && e.deltaY < 0) || (next > max && e.deltaY > 0)) return;
        e.preventDefault();
        scrollY = Math.min(Math.max(0, next), max);
        clampScroll();
    }, { passive: false });

    let drag = null;
    grid.addEventListener("pointerdown", (e) => {
        drag = { y: e.clientY, start: scrollY, moved: false };
        grid.setPointerCapture(e.pointerId);
    });
    grid.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const d = e.clientY - drag.y;
        if (Math.abs(d) > 3) drag.moved = true;
        scrollY = Math.min(Math.max(0, drag.start - d), maxScroll());
        clampScroll();
    });
    grid.addEventListener("pointerup", (e) => {
        if (drag && drag.moved) {
            const block = (ev) => ev.stopPropagation();
            grid.addEventListener("click", block, { capture: true, once: true });
        }
        drag = null;
        try { grid.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }
    });

    /* ===================== main buttons ===================== */
    stage.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-mm]");
        if (!btn) return;
        const action = btn.dataset.mm;
        if (action === "accounts") {
            setView("accounts");
            return;
        }
        if (action === "gui") {
            toast("ClickGUI — ниже на странице");
            const gui = document.getElementById("gui");
            if (gui) gui.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
        if (action === "exit") {
            toast("Демо: выйти нельзя, ты уже в Cherry 🍒");
            return;
        }
        const messages = {
            singleplayer: "В игре откроется выбор мира",
            multiplayer: "В игре откроется список серверов",
            settings: "В игре откроется меню настроек"
        };
        toast(messages[action] || "Демо");
    });

    $("#mmBadge").addEventListener("click", () => setView("accounts"));
    $("#mmBack").addEventListener("click", () => setView("main"));

    /* ===================== dust ===================== */
    const dust = $("#mmDust");
    if (dust) {
        for (let i = 0; i < 26; i++) {
            const p = document.createElement("i");
            const size = Math.random() > 0.7 ? 3 : 2;
            p.style.left = Math.random() * 100 + "%";
            p.style.top = 40 + Math.random() * 60 + "%";
            p.style.width = size + "px";
            p.style.height = size + "px";
            p.style.animationDuration = (9 + Math.random() * 14).toFixed(1) + "s";
            p.style.animationDelay = (-Math.random() * 20).toFixed(1) + "s";
            p.style.opacity = 0;
            dust.appendChild(p);
        }
    }

    /* ===================== scale ===================== */
    function layout() {
        const k = mm.clientWidth / 960;
        mm.style.setProperty("--k", k);
    }

    const ro = "ResizeObserver" in window ? new ResizeObserver(layout) : null;
    if (ro) ro.observe(mm);
    window.addEventListener("resize", layout);
    layout();

    /* ===================== boot ===================== */
    $("#mmBadgeName").textContent = activeName;
    renderAccounts();
    clampScroll();

    window.CherryMenu = {
        openAccounts: () => setView("accounts"),
        setNick: (n) => { $("#mmBadgeName").textContent = n; activeName = n; renderAccounts(); }
    };
})();
