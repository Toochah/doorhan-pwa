/**
 * Скрипт для импорта оборудования из Excel в Google Sheets
 * Запустите один раз для заполнения таблицы
 */

const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

// Путь к credentials
const CREDENTIALS_PATH = path.join(__dirname, '..', 'google-credentials.json');
const SPREADSHEET_ID = '1xXhOoYUk45im6hCksWXtzFNjk0RA82OuzghMcuUDXj4';

async function importEquipment() {
    console.log('Импорт оборудования из Excel в Google Sheets...\n');
    
    // Загрузка credentials
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.error('❌ Файл google-credentials.json не найден!');
        console.error('Настройте сервисный аккаунт сначала.');
        return;
    }
    
    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Чтение Excel
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, '..', 'ORC Doorhan.xlsx'));
    const worksheet = workbook.getWorksheet(1);
    
    // Подготовка данных
    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
        const values = row.values;
        if (rowNumber >= 3 && values[1]) { // Пропускаем заголовки
            rows.push([
                values[1], // ID
                values[2], // Серийный номер
                values[3], // Место
                values[4], // Год
                values[5], // Размер
                values[6], // Тип
                values[7], // Сервис
                values[8]  // Примечание
            ]);
        }
    });
    
    console.log(`📊 Найдено ${rows.length} записей`);
    
    // Очистка и запись в Google Sheets
    try {
        // Очищаем лист Оборудование если есть
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Оборудование!A:Z'
        });
        
        // Записываем данные
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Оборудование!A1',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    ['ID', 'Серийный номер', 'Место', 'Год', 'Размер', 'Тип', 'Сервис', 'Примечание'],
                    ...rows
                ]
            }
        });
        
        console.log('✅ Оборудование успешно импортировано!');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

importEquipment();
