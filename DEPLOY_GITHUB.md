# 🚀 Деплой на GitHub Pages

## Шаг 1: Настройка Google Apps Script

### 1.1 Откройте таблицу
Перейдите: https://docs.google.com/spreadsheets/d/1xXhOoYUk45im6hCksWXtzFNjk0RA82OuzghMcuUDXj4/edit

### 1.2 Откройте Apps Script
```
Расширения → Apps Script
```

### 1.3 Вставьте код
1. Удалите весь существующий код
2. Вставьте код из файла `pwa/apps-script.js`
3. Нажмите 💾 Сохранить
4. Назовите проект: "Doorhan Inspection"

### 1.4 Разверните веб-приложение
1. Нажмите **"Развернуть"** (Deploy) → **"Новое развертывание"**
2. Нажмите ⚙️ → **"Веб-приложение"**
3. Заполните:
   - **Описание**: Doorhan Inspection API v1
   - **Выполнять от**: Меня (ваш email)
   - **У кого есть доступ**: **Все** (Anyone) ⚠️
4. Нажмите **"Развернуть"**
5. Разрешите доступ (Authorize access)
6. **Скопируйте URL** веб-приложения (вида: `https://script.google.com/macros/s/...../exec`)

### 1.5 Обновите файл app.js
1. Откройте `pwa/js/app.js`
2. Найдите строку 362: `const SCRIPT_URL = '...'`
3. Вставьте ваш URL вместо `YOUR_DEPLOYMENT_ID`

---

## Шаг 2: Создание GitHub репозитория

### 2.1 Создайте репозиторий
1. Откройте: https://github.com/new
2. Название: `doorhan-inspection`
3. Видимость: **Public** или **Private**
4. Нажмите **"Create repository"**

### 2.2 Инициализируйте Git
```bash
cd c:\proj\doorhan\pwa
git init
git add .
git commit -m "Initial commit - Doorhan PWA"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/doorhan-inspection.git
git push -u origin main
```

---

## Шаг 3: Настройка GitHub Pages

### 3.1 Включите Pages
1. Откройте репозиторий на GitHub
2. **Settings** → **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: main / root
5. Нажмите **Save**

### 3.2 Подождите деплой
Через 1-2 минуты страница будет доступна по URL:
```
https://ВАШ_USERNAME.github.io/doorhan-inspection/
```

---

## Шаг 4: Настройка CORS (если нужно)

Если возникают ошибки CORS, создайте файл `static.json` в корне pwa/:

```json
{
  "root": "/",
  "headers": {
    "Access-Control-Allow-Origin": "*"
  }
}
```

---

## Шаг 5: Проверка

### 5.1 Откройте приложение
Перейдите по URL GitHub Pages

### 5.2 Проверьте загрузку данных
- Должно загрузиться оборудование из Google Sheets
- Должны отобразиться инспекторы

### 5.3 Протестируйте осмотр
1. Нажмите "✏️ Осмотр" на любом оборудовании
2. Заполните форму
3. Нажмите "💾 Сохранить и отправить"
4. Проверьте Google Таблицу - должна появиться новая строка

---

## 🔧 Обновление приложения

После изменений в коде:

```bash
cd c:\proj\doorhan\pwa
git add .
git commit -m "Update: описание изменений"
git push
```

GitHub Pages автоматически обновится через 1-2 минуты.

---

## 📱 Установка на телефон

### Android (Chrome)
1. Откройте сайт в Chrome
2. Меню → **"Установить приложение"**
3. Приложение появится на главном экране

### iOS (Safari)
1. Откройте сайт в Safari
2. Нажмите **"Поделиться"**
3. **"На экран «Домой»"**

---

## 📊 Структура файлов

```
pwa/
├── index.html          # Главная страница
├── dashboard.html      # Дашборд (можно скопировать из templates/)
├── manifest.json       # PWA манифест
├── google-config.json  # Конфигурация (инспекторы)
├── apps-script.js      # Код для Google Apps Script
├── js/
│   └── app.js          # Основная логика
└── static/
    └── style.css       # Стили
```

---

## ⚠️ Важные замечания

1. **API ключ** в `app.js` должен иметь доступ к Google Sheets API
2. **Таблица должна быть доступна** по API ключу
3. **Apps Script URL** должен быть развёрнут с доступом "Все"
4. **CORS** может блокировать запросы - используйте `mode: 'no-cors'`

---

## 🆘 Решение проблем

### Данные не загружаются
- Проверьте API ключ в Google Cloud Console
- Убедитесь, что таблица доступна по ссылке

### Ошибка CORS при отправке
- Это нормально для `no-cors` режима
- Данные всё равно отправляются

### Форма не отправляется
- Проверьте URL Apps Script в консоли браузера
- Убедитесь, что Apps Script развёрнут правильно
