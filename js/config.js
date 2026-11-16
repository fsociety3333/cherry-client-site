/* =====================================================================
   Cherry Site — config (edit these links after uploading the builds)
   ===================================================================== */

window.CHERRY_CONFIG = {
    version: "3.0.14",
    minecraft: "1.21.4",
    loader: "Fabric",

    /* Пока false — кнопки скачивания показывают подсказку, а не битую ссылку.
       Поставь true, когда зальёшь файлы на хостинг. */
    downloadsReady: false,

    downloads: {
        /* GitHub Releases: файл из последнего релиза */
        launcher: "https://github.com/USER/REPO/releases/latest/download/CherryLauncher.exe",
        jar: "https://github.com/USER/REPO/releases/latest/download/cherry-client.jar",
        /* Манифест для автообновления лаунчера */
        manifest: "https://github.com/USER/REPO/releases/latest/download/version.json"
    },

    links: {
        discord: "#",
        github: "#",
        changelog: "#",
        terms: "#",
        privacy: "#"
    },

    contact: "hello@cherryclient.dev"
};
