# 🚀 ФИНАЛЬНАЯ НАСТРОЙКА - Doorhan Inspection

## ✅ Что уже работает

1. ✅ **Backend (FastAPI)** - сервер на http://127.0.0.1:8000
2. ✅ **Google Sheets** - данные синхронизируются
3. ✅ **Telegram** - уведомления настроены
4. ✅ **Email** - отчёты отправляются
5. ✅ **Excel** - выгрузка работает
6. ✅ **PWA** - frontend готов к деплою

---

## 📋 ЧЕК-ЛИСТ: Настройка GitHub Pages

### 1. Google Apps Script (5 минут)

```
1. Откройте таблицу:
   https://docs.google.com/spreadsheets/d/1xXhOoYUk45im6hCksWXtzFNjk0RA82OuzghMcuUDXj4/edit

2. Расширения → Apps Script

3. Вставьте код из файла: pwa/apps-script.js

4. Разверните:
   - Развернуть → Новое развертывание
   - Тип: Веб-приложение
   - Доступ: Все (Anyone)
   
5. Скопируйте URL (вида: https://script.google.com/macros/s/...../exec)
```

### 2. Обновите PWA (1 минута)

```
1. Откройте: pwa/js/app.js

2. Найдите строку 362:
   const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

3. Вставьте ваш URL от Apps Script
```

### 3. Деплой на GitHub (3 минуты)

```bash
# Вариант A: Через deploy.bat
cd c:\proj\doorhan\pwa
deploy.bat

# Вариант B: Вручную
cd c:\proj\doorhan\pwa
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ВАШ_USERNAME/doorhan-inspection.git
git push -u origin main
```

### 4. Настройте GitHub Pages (2 минуты)

```
1. Откройте: https://github.com/ВАШ_USERNAME/doorhan-inspection

2. Settings → Pages

3. Source: Deploy from a branch
   Branch: main / root

4. Save
```

### 5. Проверка (1 минута)

```
1. Откройте URL: https://ВАШ_USERNAME.github.io/doorhan-inspection/

2. Проверьте:
   - Загрузилось ли оборудование?
   - Работает ли фильтр?
   - Отправляется ли осмотр?

3. Проверьте Google Таблицу - должна появиться запись
```

---

## 📱 Доступ из интернета

### После деплоя у вас будет 2 URL:

| Где | URL | Для чего |
|-----|-----|----------|
| **Локально** | http://127.0.0.1:8000 | Для работы в локальной сети |
| **GitHub Pages** | https://.....github.io/doorhan-inspection/ | Для доступа из интернета |

### Мобильное приложение

**Android:**
1. Откройте сайт в Chrome
2. Меню → "Установить приложение"
3. Иконка появится на главном экране

**iOS:**
1. Откройте сайт в Safari
2. "Поделиться" → "На экран «Домой»"

---

## 🔄 Как обновлять приложение

После изменений в коде:

```bash
cd c:\proj\doorhan\pwa
git add .
git commit -m "Описание изменений"
git push
```

GitHub Pages обновится автоматически через 1-2 минуты.

---

## 📊 Мониторинг

### Логи сервера
```bash
# Сервер пишет логи в:
c:\proj\doorhan\server.log
```

### Google Sheets
- Все осмотры дублируются в таблицу
- Лист "Осмотры" - история всех проверок

### Telegram
- Краткие уведомления приходят сразу
- Проверьте бота: @DoorhanInspectionBot

### Email
- Полные отчёты с Excel вложением
- На email из config.json

---

## ⚠️ Возможные проблемы

### PWA не загружает данные
```
1. Проверьте API ключ в app.js
2. Убедитесь, что Google Sheets API включён
3. Проверьте консоль браузера (F12)
```

### Ошибка CORS при отправке
```
Это нормально для no-cors режима.
Данные всё равно отправляются в Google Sheets.
```

### Forms Script не работает
```
1. Проверьте, что Apps Script развёрнут с доступом "Все"
2. URL должен заканчиваться на /exec
3. Пересоздайте развёртывание
```

---

## 📞 Поддержка

### Файлы проекта

```
c:\proj\doorhan/
├── app.py                      # Backend сервер
├── config.json                 # Настройки (Telegram, Email)
├── google-config.json          # Google Sheets конфиг
├── ORC Doorhan.xlsx            # Исходные данные
├── reports/                    # Excel отчёты
├── data/                       # JSON данные
├── templates/                  # HTML шаблоны
└── pwa/                        # Frontend для GitHub Pages
    ├── index.html              # Главная страница
    ├── dashboard.html          # Дашборд
    ├── js/app.js               # Логика PWA
    ├── apps-script.js          # Код для Google Apps Script
    └── DEPLOY_GITHUB.md        # Подробная инструкция
```

### Команды

```bash
# Запуск сервера
cd c:\proj\doorhan
python -m uvicorn app:app --host 0.0.0.0 --port 8000

# Проверка Google Sheets
python check_google_sheets.py

# Деплой PWA
cd pwa
deploy.bat
```

---

## ✅ ИТОГОВАЯ ПРОВЕРКА

- [ ] Сервер запущен и работает
- [ ] Telegram уведомления приходят
- [ ] Email отчёты отправляются
- [ ] Google Sheets синхронизируется
- [ ] Apps Script настроен
- [ ] PWA загружается на GitHub Pages
- [ ] Мобильное приложение установлено

**После всех проверок - система готова к работе! 🎉**
