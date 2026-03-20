# 🔧 Doorhan Inspection PWA

PWA приложение для осмотра оборудования Doorhan.

## 🚀 Быстрый старт

### Локальный запуск
```bash
cd pwa
python -m http.server 8080
```
Откройте: http://localhost:8080

### Деплой на GitHub Pages
Смотрите инструкцию: [DEPLOY_GITHUB.md](DEPLOY_GITHUB.md)

---

## 📋 Возможности

- ✅ Офлайн работа (Service Worker)
- ✅ Установка на телефон как приложение
- ✅ Синхронизация с Google Sheets
- ✅ Адаптивный дизайн
- ✅ Фильтрация оборудования
- ✅ Статистика осмотров

---

## 📁 Структура

```
pwa/
├── index.html          # Главная страница
├── manifest.json       # PWA манифест
├── js/app.js           # Логика приложения
├── static/style.css    # Стили
└── google-config.json  # Конфигурация
```

---

## 🔧 Настройка

### 1. Google Apps Script
Скопируйте код из `apps-script.js` в Google Apps Script вашей таблицы.

### 2. Обновите URL
В `js/app.js` укажите ваш URL от Apps Script.

### 3. Инспекторы
Отредактируйте `google-config.json` - добавьте ваших инспекторов.

---

## 📱 Установка

### Android
Откройте в Chrome → Меню → "Установить приложение"

### iOS
Откройте в Safari → "Поделиться" → "На экран «Домой»"
