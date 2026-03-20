"""
Импорт оборудования из Excel в Google Sheets
Запустите один раз для заполнения Google Таблицы
"""

import json
from pathlib import Path

try:
    import gspread
    import openpyxl
    print("✅ Библиотеки найдены")
except ImportError as e:
    print(f"❌ Ошибка: {e}")
    print("Установите: pip install gspread openpyxl")
    input("\nНажмите Enter для выхода...")
    exit(1)

# Конфигурация
SPREADSHEET_ID = '1xXhOoYUk45im6hCksWXtzFNjk0RA82OuzghMcuUDXj4'
CREDENTIALS_FILE = 'google-credentials.json'
EXCEL_FILE = 'ORC Doorhan.xlsx'

print("="*60)
print("  Импорт оборудования в Google Sheets")
print("="*60)
print()

# Проверка файлов
if not Path(CREDENTIALS_FILE).exists():
    print(f"❌ Файл {CREDENTIALS_FILE} не найден!")
    print("Настройте сервисный аккаунт Google Cloud.")
    input("\nНажмите Enter для выхода...")
    exit(1)

if not Path(EXCEL_FILE).exists():
    print(f"❌ Файл {EXCEL_FILE} не найден!")
    input("\nНажмите Enter для выхода...")
    exit(1)

# Подключение к Google Sheets
try:
    print("🔄 Подключение к Google Sheets...")
    gc = gspread.service_account(filename=CREDENTIALS_FILE)
    sh = gc.open_by_key(SPREADSHEET_ID)
    print(f"✅ Подключено к таблице: {sh.title}")
except Exception as e:
    print(f"❌ Ошибка подключения: {e}")
    input("\nНажмите Enter для выхода...")
    exit(1)

# Чтение Excel
try:
    print(f"\n📖 Чтение {EXCEL_FILE}...")
    wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    ws = wb.active
    
    equipment = []
    for row_idx, row in enumerate(ws.iter_rows(min_row=3, values_only=True), start=3):
        if row[0] is None and row[1] is None:
            continue
        if isinstance(row[0], str) and 'Журнал' in str(row[0]):
            continue
        
        if row[0] is None:
            continue
            
        equipment.append([
            str(int(row[0])) if isinstance(row[0], (int, float)) else str(row[0]),  # ID
            str(row[1]) if row[1] else 'Нет',  # Серийный номер
            str(row[2]) if row[2] else '',     # Место
            str(int(row[3])) if row[3] else '', # Год
            str(row[4]) if row[4] else '-',    # Размер
            str(row[5]) if row[5] else '',     # Тип
            str(row[6]) if row[6] else '-',    # Сервис
            str(row[7]) if row[7] else ''      # Примечание
        ])
    
    print(f"✅ Найдено {len(equipment)} записей")
    
except Exception as e:
    print(f"❌ Ошибка чтения Excel: {e}")
    input("\nНажмите Enter для выхода...")
    exit(1)

# Запись в Google Sheets
try:
    print("\n📝 Запись в Google Sheets...")
    
    # Получаем или создаём лист Оборудование
    try:
        worksheet = sh.worksheet("Оборудование")
        print("ℹ️ Лист 'Оборудование' найден")
        # Очищаем
        worksheet.clear()
    except gspread.exceptions.WorksheetNotFound:
        print("📄 Создание листа 'Оборудование'...")
        worksheet = sh.add_worksheet(title="Оборудование", rows=1000, cols=10)
    
    # Заголовки
    headers = ['ID', 'Серийный номер', 'Место', 'Год', 'Размер', 'Тип', 'Сервис', 'Примечание']
    worksheet.update('A1:H1', [headers])
    
    # Данные
    if equipment:
        worksheet.update('A2', equipment)
    
    # Автоширина колонок (примерно)
    worksheet.column_dimensions('A').width = 5
    worksheet.column_dimensions('B').width = 15
    worksheet.column_dimensions('C').width = 15
    worksheet.column_dimensions('D').width = 8
    worksheet.column_dimensions('E').width = 10
    worksheet.column_dimensions('F').width = 20
    worksheet.column_dimensions('G').width = 10
    worksheet.column_dimensions('H').width = 20
    
    print(f"✅ Записано {len(equipment)} записей")
    
except Exception as e:
    print(f"❌ Ошибка записи: {e}")
    input("\nНажмите Enter для выхода...")
    exit(1)

# Создание листа Осмотры
try:
    print("\n📝 Создание листа 'Осмотры'...")
    try:
        inspections_sheet = sh.worksheet("Осмотры")
        print("ℹ️ Лист 'Осмотры' уже существует")
    except gspread.exceptions.WorksheetNotFound:
        inspections_sheet = sh.add_worksheet(title="Осмотры", rows=1000, cols=10)
        headers = ['Дата/Время', 'ID оборудования', 'Место установки', 'Тип оборудования', 
                   'Серийный номер', 'Статус', 'Инспектор', 'Комментарий']
        inspections_sheet.update('A1:H1', [headers])
        inspections_sheet.format('A1:H1', {'textFormat': {'bold': True}, 'backgroundColor': {'red': 0.95, 'green': 0.95, 'blue': 0.95}})
        print("✅ Лист 'Осмотры' создан")
except Exception as e:
    print(f"⚠️ Предупреждение: {e}")

print("\n" + "="*60)
print("  ✅ ГОТОВО! Оборудование импортировано в Google Sheets")
print("="*60)
print()
print("Теперь откройте PWA:")
print("https://toochah.github.io/doorhan-pwa/")
print()
input("Нажмите Enter для выхода...")
