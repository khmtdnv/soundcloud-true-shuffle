# 🎵 SoundCloud Full Shuffle Fixer

<p align="center">
  <img src="icons/icon128.png" width="96" alt="SoundCloud Full Shuffle Fixer Logo" />
</p>

<p align="center">
  <b>Chrome / Brave / Edge extension that fixes SoundCloud's broken shuffle button by fully loading entire playlists and Likes (1500+ tracks) before shuffling.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-orange?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Yandex-blue?style=flat-square" alt="Compatible Browsers" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## 🧐 The Problem
By default, SoundCloud only loads the first **10–25 tracks** into the player queue ("Next up"). When you click the **Shuffle** button, SoundCloud only shuffles those few initially loaded tracks. If you have a playlist or "Liked Tracks" with **500, 1000, or 2000+ tracks**, you will hear the exact same first batch of songs repeatedly, while the rest of your music library is never played.

## ⚡ The Solution
**SoundCloud Full Shuffle Fixer** seamlessly intercepts the native Shuffle button:
1. Opens the queue in the background.
2. Smoothly scrolls and auto-loads **all tracks** via lazy-load triggers.
3. Automatically handles network recovery and retry jiggles if SoundCloud's API stutters.
4. Rewinds to the top and triggers the native SoundCloud shuffle on the **entire** track collection.
5. Provides an instant **«⚡ Перемешать сейчас / Shuffle Now»** button in the notification toast if you wish to skip waiting and shuffle immediately.

---

## 🚀 Установка / Installation

### Способ 1: Установка распакованного расширения (10 секунд)
1. Скачайте репозиторий (кнопка **Code → Download ZIP**) и распакуйте архив в любую удобную папку.
2. Откройте страницу расширений в вашем браузере:
   - **Chrome / Brave**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Yandex Browser**: `browser://extensions`
3. В правом верхнем углу включите переключатель **«Режим разработчика» (Developer mode)**.
4. Нажмите кнопку **«Загрузить распакованное расширение» (Load unpacked)** в левом верхнем углу.
5. Выберите распакованную папку `sc-scroller`.
6. Готово! Расширение установлено и активно.

---

## 🎧 Как пользоваться / How to Use

1. Откройте [SoundCloud](https://soundcloud.com/) и включите любой длинный плейлист или страницу **«Понравившиеся треки» (Likes)**.
2. Нажмите на стандартную кнопку **Перемешать (Shuffle)** в нижнем плеере.
3. В правом нижнем углу появится плавающее уведомление со статусом загрузки (`Загрузка (~850)...`).
4. Когда все треки загрузятся, плеер автоматически перемешает **весь** список!
   > 💡 *Совет:* Вы можете нажать кнопку **«⚡ Перемешать сейчас»** прямо в уведомлении в любой момент, чтобы не ждать окончания фоновой загрузки.

---

## 📁 Структура проекта / Project Structure

```
├── manifest.json       # Chrome Extension Manifest V3
├── content.js          # Основная логика перехвата и плавной подгрузки очереди
├── styles.css          # Стили для всплывающего уведомления
├── icons/              # Иконки расширения (16px, 48px, 128px)
├── README.md           # Документация пользователя
└── PUBLISHING.md       # Инструкция по загрузке в Chrome Web Store
```

---

## 📄 Лицензия / License

Распространяется под лицензией [MIT](LICENSE). Свободно для использования, модификации и распространения.

