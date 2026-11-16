/* =====================================================================
   Cherry Site — demo data for the interactive ClickGUI
   Module names mirror the real client. Settings are hand-tuned for demo.
   ===================================================================== */

(function () {
    "use strict";

    const B = (label, value = true) => ({ type: "bool", label, value });
    const S = (label, min, max, value, step = 1, unit = "") =>
        ({ type: "slider", label, min, max, value, step, unit });
    const M = (label, options, value) => ({ type: "mode", label, options, value });
    const MM = (label, options, value = []) => ({ type: "multi", label, options, value });
    const C = (label, color, alpha = 255) => ({ type: "color", label, color, alpha });
    const K = (label, key = null) => ({ type: "bind", label, key });
    const T = (label, value = "") => ({ type: "string", label, value });
    const A = (label, action = "Выполнить") => ({ type: "button", label, action });

    window.CHERRY_DATA = {
        categories: [
            { id: "combat", name: "Combat", glyph: "A", hint: "Бой и защита" },
            { id: "movement", name: "Movement", glyph: "B", hint: "Передвижение" },
            { id: "render", name: "Render", glyph: "C", hint: "Визуал" },
            { id: "player", name: "Player", glyph: "D", hint: "Игрок" },
            { id: "misc", name: "Misc", glyph: "E", hint: "Разное" }
        ],

        accents: ["#38bdf8", "#ff3d6e", "#8b5cf6", "#4ade80", "#f5b544"],

        configs: [
            { name: "default", note: "current", updated: "сегодня" },
            { name: "pvp", note: "legit", updated: "2 дня назад" },
            { name: "bedwars", note: "clutch", updated: "5 дней назад" },
            { name: "survival", note: "solo", updated: "неделю назад" }
        ],

        modules: [
            /* ------------------------------ COMBAT */
            {
                id: "aura", cat: "combat", name: "Aura", glyph: "A", on: true, fav: true, key: "R",
                settings: [
                    S("Range", 2, 6, 3.2, 0.1, "m"),
                    S("CPS", 1, 20, 12),
                    M("Mode", ["Single", "Switch", "Multi"], "Switch"),
                    MM("Targets", ["Players", "Mobs", "Animals", "Invisible"], ["Players", "Mobs"]),
                    B("Through walls", false),
                    B("Rotate", true),
                    C("Circle", "#38bdf8", 190),
                    K("Bind", "R")
                ]
            },
            {
                id: "velocity", cat: "combat", name: "Velocity", glyph: "V", on: true, key: "V",
                settings: [
                    S("Horizontal", 0, 100, 0, 1, "%"),
                    S("Vertical", 0, 100, 40, 1, "%"),
                    M("Mode", ["Normal", "Grim", "NCP"], "Grim"),
                    B("Only on ground", false),
                    B("Explosions", true)
                ]
            },
            {
                id: "autototem", cat: "combat", name: "AutoTotem", glyph: "T", on: true, key: "T",
                settings: [
                    S("Delay", 0, 500, 80, 10, "ms"),
                    M("Slot", ["Offhand", "Hotbar"], "Offhand"),
                    B("Health check", true),
                    S("Health", 1, 20, 8, 0.5, "hp"),
                    B("Save enchanted", true)
                ]
            },
            {
                id: "triggerbot", cat: "combat", name: "TriggerBot", glyph: "G", key: null,
                settings: [
                    S("Range", 2, 5, 3.6, 0.1, "m"),
                    S("Delay", 0, 400, 60, 10, "ms"),
                    MM("Targets", ["Players", "Mobs", "Animals"], ["Players"]),
                    B("Only crit", false)
                ]
            },
            {
                id: "autoarmor", cat: "combat", name: "AutoArmor", glyph: "H", on: true,
                settings: [
                    S("Delay", 0, 600, 120, 10, "ms"),
                    B("Prefer elytra", false),
                    B("Keep chestplate", true)
                ]
            },
            {
                id: "hitboxes", cat: "combat", name: "HitBoxes", glyph: "X", fav: true,
                settings: [
                    S("Expand", 0, 1, 0.2, 0.05, "m"),
                    B("Only players", true),
                    B("Render outline", false)
                ]
            },
            {
                id: "autoswap", cat: "combat", name: "AutoSwap", glyph: "S",
                settings: [
                    M("Mode", ["Silent", "Normal"], "Silent"),
                    B("Totem first", true),
                    S("Cooldown", 0, 1000, 250, 50, "ms")
                ]
            },
            {
                id: "nofriend", cat: "combat", name: "NoFriendDamage", glyph: "F", on: true,
                settings: [
                    B("Cancel aura", true),
                    B("Cancel projectiles", false)
                ]
            },
            {
                id: "shifttap", cat: "combat", name: "ShiftTAP", glyph: "P",
                settings: [
                    S("Hold", 40, 300, 120, 10, "ms"),
                    B("Only while sprinting", true)
                ]
            },
            {
                id: "antibot", cat: "combat", name: "AntiBot", glyph: "Q",
                settings: [
                    M("Mode", ["Tab", "Entity", "Both"], "Tab"),
                    S("Range", 3, 32, 12, 1, "m"),
                    B("Only in pvp", true),
                    B("Log bots", false)
                ]
            },
            {
                id: "autoexp", cat: "combat", name: "AutoEXP", glyph: "J",
                settings: [
                    S("Delay", 0, 500, 60, 10, "ms"),
                    M("Mode", ["Normal", "Fast"], "Fast"),
                    B("Only in inventory", false)
                ]
            },
            {
                id: "noslot", cat: "combat", name: "NoSlotChange", glyph: "K",
                settings: [
                    M("Mode", ["Cancel", "Restore"], "Cancel"),
                    B("Only when eating", true)
                ]
            },

            /* ------------------------------ MOVEMENT */
            {
                id: "speed", cat: "movement", name: "Speed", glyph: "A", on: true, fav: true, key: "G",
                settings: [
                    S("Speed", 0.1, 3, 1.2, 0.05),
                    M("Mode", ["Vanilla", "Strafe", "NCP", "Grim"], "Strafe"),
                    B("Auto jump", true),
                    B("Only on ground", true),
                    B("Timer", false),
                    S("Timer speed", 1, 2, 1.05, 0.01)
                ]
            },
            {
                id: "fly", cat: "movement", name: "Fly", glyph: "B", key: "F",
                settings: [
                    S("Speed", 0.5, 8, 2.4, 0.1),
                    S("Vertical", 0.5, 4, 1.4, 0.1),
                    M("Mode", ["Motion", "Creative", "Packet"], "Motion"),
                    B("Anti kick", true),
                    B("Glide", false)
                ]
            },
            {
                id: "noslow", cat: "movement", name: "NoSlowDown", glyph: "C", on: true,
                settings: [
                    B("Items", true),
                    B("Soul sand", true),
                    B("Webs", true),
                    B("Sneak", false)
                ]
            },
            {
                id: "sprint", cat: "movement", name: "Sprint", glyph: "D", on: true, key: "H",
                settings: [
                    B("All directions", true),
                    B("Keep sprint", true),
                    S("Fov boost", 0, 20, 6, 1, "°")
                ]
            },
            {
                id: "nopush", cat: "movement", name: "NoPush", glyph: "E", on: true,
                settings: [
                    B("Players", true),
                    B("Mobs", true),
                    B("Blocks", false),
                    B("Water", true)
                ]
            },
            {
                id: "safewalk", cat: "movement", name: "SafeWalk", glyph: "F", fav: true,
                settings: [
                    S("Sneak edge", 1, 5, 1, 1, "block"),
                    B("Only on blocks", true),
                    B("Render indicator", false)
                ]
            },
            {
                id: "scaffold", cat: "movement", name: "Scaffold", glyph: "G",
                settings: [
                    M("Mode", ["Normal", "Telly", "GodBridge"], "Telly"),
                    B("Auto block", true),
                    B("Sprint", false),
                    S("Rotation speed", 1, 10, 6, 1)
                ]
            },
            {
                id: "waterjump", cat: "movement", name: "WaterJump", glyph: "H",
                settings: [
                    S("Boost", 0.1, 1.2, 0.42, 0.02),
                    B("Only in water", true)
                ]
            },
            {
                id: "fastbreak", cat: "movement", name: "FastBreak", glyph: "I",
                settings: [
                    S("Multiplier", 1, 3, 1.3, 0.05),
                    B("Only blocks", true)
                ]
            },
            {
                id: "elytratarget", cat: "movement", name: "ElytraTarget", glyph: "J",
                settings: [
                    S("Range", 8, 64, 32, 4, "m"),
                    S("Predict", 0, 4, 1.2, 0.1),
                    B("Only with elytra", true),
                    B("Render target", false)
                ]
            },
            {
                id: "freecamera", cat: "movement", name: "FreeCamera", glyph: "K",
                settings: [
                    S("Speed", 0.5, 4, 1.5, 0.1),
                    B("No clip", true),
                    B("Scroll zoom", true),
                    K("Bind", "P")
                ]
            },
            {
                id: "nocrouch", cat: "movement", name: "NoCrouch", glyph: "L",
                settings: [
                    B("Only sprinting", true),
                    B("Keep pose", false)
                ]
            },

            /* ------------------------------ RENDER */
            {
                id: "interface", cat: "render", name: "Interface", glyph: "A", on: true, fav: true, key: "I",
                settings: [
                    M("Watermark", ["Cherry", "Text", "Logo"], "Cherry"),
                    B("ArrayList", true),
                    B("Keystrokes", true),
                    B("Target hud", true),
                    B("Ping", false),
                    S("Scale", 0.5, 1.5, 1, 0.05),
                    C("Accent", "#38bdf8", 255)
                ]
            },
            {
                id: "esp", cat: "render", name: "ESP", glyph: "B", on: true, fav: true, key: "V",
                settings: [
                    MM("Targets", ["Players", "Mobs", "Animals", "Items"], ["Players", "Mobs"]),
                    M("Shape", ["Box", "Corner", "3D"], "Corner"),
                    S("Range", 16, 256, 96, 8, "m"),
                    B("Health bar", true),
                    B("Armor", true),
                    B("Tracers", false),
                    C("Color", "#ff3d6e", 230)
                ]
            },
            {
                id: "blockesp", cat: "render", name: "BlockESP", glyph: "C",
                settings: [
                    MM("Blocks", ["Chest", "Ender chest", "Spawner", "Shulker", "Barrel"], ["Chest", "Ender chest"]),
                    S("Range", 16, 128, 48, 8, "m"),
                    S("Fill alpha", 0, 200, 60, 5, "%"),
                    B("Outlines", true),
                    C("Color", "#8b5cf6", 160)
                ]
            },
            {
                id: "chinahat", cat: "render", name: "ChinaHat", glyph: "D",
                settings: [
                    S("Radius", 0.4, 1.6, 0.8, 0.05),
                    S("Height", 0.2, 1.5, 0.5, 0.05),
                    B("Rotate", true),
                    B("Only self", false),
                    C("Color", "#38bdf8", 210)
                ]
            },
            {
                id: "crosshair", cat: "render", name: "Crosshair", glyph: "E", on: true,
                settings: [
                    M("Style", ["Cross", "Dot", "Circle", "Custom"], "Dot"),
                    S("Size", 2, 16, 6, 1),
                    S("Gap", 0, 10, 2, 1),
                    B("Dynamic", true),
                    C("Color", "#ffffff", 255)
                ]
            },
            {
                id: "fullbright", cat: "render", name: "FullBright", glyph: "F", on: true, key: "B",
                settings: [
                    M("Mode", ["Gamma", "Night vision"], "Gamma"),
                    S("Gamma", 1, 20, 12, 0.5)
                ]
            },
            {
                id: "removals", cat: "render", name: "Removals", glyph: "G",
                settings: [
                    B("Fire overlay", true),
                    B("Water overlay", false),
                    B("Blindness", true),
                    B("Nausea", true),
                    B("Totem animation", false),
                    B("Particles", false)
                ]
            },
            {
                id: "viewmodel", cat: "render", name: "ViewModel", glyph: "H",
                settings: [
                    S("X", -2, 2, 0, 0.05),
                    S("Y", -2, 2, 0, 0.05),
                    S("Scale", 0.5, 1.6, 1, 0.05),
                    B("Swing", true),
                    M("Swing mode", ["Vanilla", "Smooth", "None"], "Smooth")
                ]
            },
            {
                id: "soundesp", cat: "render", name: "SoundESP", glyph: "I",
                settings: [
                    S("Range", 8, 64, 32, 4, "m"),
                    S("Lifetime", 0.5, 5, 2, 0.5, "s"),
                    B("Only steps", true),
                    C("Color", "#4ade80", 200)
                ]
            },
            {
                id: "pointers", cat: "render", name: "Pointers", glyph: "J",
                settings: [
                    S("Range", 16, 256, 128, 8, "m"),
                    B("Only players", true),
                    B("Show distance", true),
                    C("Color", "#38bdf8", 220)
                ]
            },
            {
                id: "predictions", cat: "render", name: "Predictions", glyph: "K",
                settings: [
                    S("Ticks", 1, 6, 2, 1),
                    B("Self", true),
                    B("Projectiles", true),
                    C("Color", "#f5b544", 180)
                ]
            },
            {
                id: "itemphysic", cat: "render", name: "ItemPhysic", glyph: "L",
                settings: [
                    B("Rotation", true),
                    S("Smoothness", 1, 10, 4, 1),
                    B("Only dropped", true)
                ]
            },

            /* ------------------------------ PLAYER */
            {
                id: "cheststealer", cat: "player", name: "ChestStealer", glyph: "A", on: true, fav: true, key: "C",
                settings: [
                    S("Delay", 0, 400, 60, 10, "ms"),
                    B("Auto close", true),
                    B("Ignore trash", true),
                    T("Filter", "diamond, netherite, totem"),
                    A("Сбросить фильтр", "Очистить")
                ]
            },
            {
                id: "autotool", cat: "player", name: "AutoTool", glyph: "B", on: true,
                settings: [
                    B("Only on block", true),
                    B("Save durability", true),
                    S("Min durability", 1, 100, 10, 1, "%"),
                    B("Swap back", true)
                ]
            },
            {
                id: "autorespawn", cat: "player", name: "AutoRespawn", glyph: "C", on: true,
                settings: [
                    S("Delay", 0, 2000, 300, 50, "ms"),
                    B("Only pvp", false)
                ]
            },
            {
                id: "autoeat", cat: "player", name: "AutoEat", glyph: "D",
                settings: [
                    S("Hunger", 1, 20, 16, 1),
                    S("Delay", 0, 1000, 200, 50, "ms"),
                    B("Prefer golden", true),
                    B("Offhand", false)
                ]
            },
            {
                id: "autofish", cat: "player", name: "AutoFish", glyph: "E",
                settings: [
                    S("Delay", 100, 1200, 400, 50, "ms"),
                    B("Auto recast", true),
                    B("Only in water", true)
                ]
            },
            {
                id: "itemscroller", cat: "player", name: "ItemScroller", glyph: "F",
                settings: [
                    M("Mode", ["Single", "Stack", "All"], "Stack"),
                    B("Shift click", true),
                    S("Delay", 0, 300, 40, 10, "ms")
                ]
            },
            {
                id: "thirdperson", cat: "player", name: "ThirdPerson", glyph: "G", key: "P",
                settings: [
                    S("Distance", 2, 12, 4, 0.5, "m"),
                    B("No clip", true),
                    S("Fov", 40, 110, 70, 5, "°")
                ]
            },
            {
                id: "autoleave", cat: "player", name: "AutoLeave", glyph: "H",
                settings: [
                    S("Health", 1, 20, 4, 0.5, "hp"),
                    B("On totem pop", true),
                    B("On fire", false),
                    B("Notify", true)
                ]
            },
            {
                id: "deathcoords", cat: "player", name: "DeathCoords", glyph: "I", on: true,
                settings: [
                    B("Chat message", true),
                    B("Copy to clipboard", true),
                    B("Save to file", false)
                ]
            },
            {
                id: "fastexp", cat: "player", name: "FastEXP", glyph: "J",
                settings: [
                    S("Delay", 0, 500, 50, 10, "ms"),
                    B("Only bottles", true),
                    B("Auto switch", false)
                ]
            },
            {
                id: "structures", cat: "player", name: "Structures", glyph: "K",
                settings: [
                    MM("Structures", ["Village", "Fortress", "Bastion", "Trial chamber"], ["Village", "Bastion"]),
                    S("Range", 64, 512, 192, 16, "m"),
                    B("Chat coords", true)
                ]
            },
            {
                id: "autoauth", cat: "player", name: "AutoAuth", glyph: "L",
                settings: [
                    T("Password", ""),
                    S("Delay", 0, 3000, 600, 100, "ms"),
                    B("Register if needed", true),
                    A("Войти", "Войти")
                ]
            },

            /* ------------------------------ MISC */
            {
                id: "xray", cat: "misc", name: "XRay", glyph: "A", key: "X",
                settings: [
                    MM("Blocks", ["Diamond", "Ancient debris", "Gold", "Iron", "Emerald", "Chest"], ["Diamond", "Ancient debris"]),
                    S("Opacity", 0, 255, 120, 5),
                    B("Cave mode", false),
                    B("Only ores", true)
                ]
            },
            {
                id: "streamermode", cat: "misc", name: "StreamerMode", glyph: "B", on: true,
                settings: [
                    B("Hide nick", true),
                    B("Hide server", true),
                    B("Hide coords", false),
                    T("Fake nick", "Steve"),
                    A("Скопировать ник", "Копировать")
                ]
            },
            {
                id: "serverjoiner", cat: "misc", name: "ServerJoiner", glyph: "C",
                settings: [
                    T("Address", "mc.example.net"),
                    S("Delay", 0, 5000, 800, 100, "ms"),
                    B("Auto connect", false),
                    B("Retry on kick", true),
                    A("Подключиться", "Войти")
                ]
            },
            {
                id: "chathelper", cat: "misc", name: "ChatHelper", glyph: "D", on: true,
                settings: [
                    B("Anti spam", true),
                    B("Chat suffix", false),
                    T("Suffix", " | cherry"),
                    M("Filter", ["Off", "Ads", "Caps", "All"], "Ads")
                ]
            },
            {
                id: "sounds", cat: "misc", name: "Sounds", glyph: "E", on: true,
                settings: [
                    B("Module toggle", true),
                    B("Kill sound", true),
                    S("Volume", 0, 100, 40, 5, "%"),
                    M("Kill sound", ["Bell", "Pop", "Click", "Sword"], "Pop"),
                    A("Проверить", "Играть")
                ]
            },
            {
                id: "nuker", cat: "misc", name: "Nuker", glyph: "F",
                settings: [
                    S("Range", 1, 6, 4, 0.5, "m"),
                    S("Delay", 0, 400, 80, 10, "ms"),
                    MM("Blocks", ["Stone", "Dirt", "Wood", "Ores"], ["Stone"]),
                    B("Only exposed", true)
                ]
            },
            {
                id: "autobuy", cat: "misc", name: "AutoBuy", glyph: "G",
                settings: [
                    T("Item", "Golden apple"),
                    S("Amount", 1, 64, 16, 1),
                    S("Max price", 1, 100000, 5000, 100, "$"),
                    B("Confirm", true)
                ]
            },
            {
                id: "antiafk", cat: "misc", name: "AntiAFK", glyph: "H", on: true,
                settings: [
                    M("Mode", ["Jump", "Swing", "Walk", "Chat"], "Jump"),
                    S("Interval", 1, 60, 8, 1, "s"),
                    B("Only when afk", true)
                ]
            },
            {
                id: "nointeract", cat: "misc", name: "NoInteract", glyph: "I",
                settings: [
                    B("Armor stands", true),
                    B("Item frames", true),
                    B("Chests", false),
                    B("Villagers", true)
                ]
            },
            {
                id: "collector", cat: "misc", name: "Collector", glyph: "J",
                settings: [
                    S("Range", 1, 6, 3, 0.5, "m"),
                    MM("Targets", ["Items", "XP orbs", "Arrows"], ["Items"]),
                    B("Auto walk", false)
                ]
            },
            {
                id: "autowarden", cat: "misc", name: "AutoWarden", glyph: "K",
                settings: [
                    B("Avoid", true),
                    S("Range", 4, 32, 16, 2, "m"),
                    B("Notify", true),
                    B("Only in deep dark", true)
                ]
            },
            {
                id: "portalbypass", cat: "misc", name: "PortalBypass", glyph: "L",
                settings: [
                    M("Mode", ["Normal", "Packet"], "Packet"),
                    S("Delay", 0, 400, 80, 10, "ms"),
                    B("Only portals", true)
                ]
            }
        ]
    };
})();
