# Cherry Client — сайт

Статический сайт без сборки: чистые HTML/CSS/JS. Открывается двойным кликом по `index.html`
или через локальный сервер:

```powershell
cd F:\Projects\CherrySite
python -m http.server 8123 --bind 127.0.0.1
# http://127.0.0.1:8123/index.html
```

## Структура

| Файл | Зачем |
| --- | --- |
| `index.html` | вся страница: hero, возможности, ClickGUI, HUD, скачивание, FAQ, футер |
| `css/base.css` | дизайн-система сайта, адаптив |
| `css/mainmenu.css` | реплика главного меню 960×540 |
| `css/clickgui.css` | реплика ClickGUI, тёмная/светлая темы |
| `js/config.js` | **все ссылки** — версия, скачивание, соцсети |
| `js/data.js` | модули, настройки и конфиги для демо |
| `js/clickgui.js` | логика ClickGUI (`window.CherryGUI`) |
| `js/mainmenu.js` | логика меню и аккаунтов (`window.CherryMenu`) |
| `js/ui.js` | прелоадер, скролл, анимации появления, тосты |
| `js/app.js` | привязка кнопок скачивания, тулбар, версия |

## Ссылки и скачивание

Всё меняется в одном файле — `js/config.js`:

```js
downloadsReady: false,          // false = кнопки показывают подсказку вместо битой ссылки
downloads: {
  launcher: "https://…/CherryLauncher.exe",
  jar:      "https://…/cherry-client.jar",
  manifest: "https://…/version.json"
}
```

Порядок:

1. Загрузить `CherryLauncher.exe` из `F:\Projects\CherryLauncher\publish` на файлохостинг
   (лучше всего GitHub Releases — см. раздел ниже).
2. Вставить **прямую** ссылку (такую, которая сразу отдаёт файл) в `downloads.launcher`.
3. Поставить `downloadsReady: true`.

## Демо-реплики

* Меню: реальные `<input>`, создание/поиск/избранное/удаление аккаунтов, вход, стрелки и drag.
* ClickGUI: тумблеры, слайдеры, режимы, мульти-выбор, HSV-пикер, бинды, конфиги,
  поиск по всем категориям, избранное, компактный режим, светлая тема, акцент, зум/пан.
* Данные живут только в памяти страницы и сбрасываются при перезагрузке — это витрина,
  а не хранилище. Никакого Microsoft-логина нигде нет.

## GitHub Releases — прямая ссылка

Репозиторий должен быть публичным, файл — прикреплён к релизу (не в git-историю).

```text
https://github.com/<user>/<repo>/releases/latest/download/CherryLauncher.exe
```

Это постоянная ссылка: она всегда ведёт на ассет с тем же именем из последнего релиза.
Рядом можно положить `version.json` для автообновления лаунчера.
