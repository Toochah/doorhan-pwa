/**
 * Google Apps Script для приёма данных осмотра
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 
 * 1. Откройте Google Таблицу: https://docs.google.com/spreadsheets/d/1xXhOoYUk45im6hCksWXtzFNjk0RA82OuzghMcuUDXj4/edit
 * 
 * 2. Расширения → Apps Script
 * 
 * 3. Вставьте этот код и сохраните
 * 
 * 4. Развернуть → Новое развертывание:
 *    - Тип: Веб-приложение
 *    - Описание: Doorhan Inspection API
 *    - Выполнять от: Меня
 *    - У кого есть доступ: Все (Anyone)
 * 
 * 5. Скопируйте URL веб-приложения
 * 
 * 6. Вставьте URL в файл pwa/js/app.js (строка SCRIPT_URL)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Открываем таблицу
    var ss = SpreadsheetApp.openById('1xXhOoYUk45im6hCksWXtzFNjk0RA82OuzghMcuUDXj4');
    
    // Получаем или создаём лист осмотров
    var sheet = ss.getSheetByName('Осмотры');
    if (!sheet) {
      sheet = ss.insertSheet('Осмотры');
      // Заголовки
      sheet.appendRow([
        'Дата/Время', 'ID оборудования', 'Место установки',
        'Тип оборудования', 'Серийный номер', 'Статус',
        'Инспектор', 'Комментарий'
      ]);
      // Форматирование заголовков
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f3f4f6');
    }
    
    // Получаем данные об оборудовании
    var equipmentSheet = ss.getSheetByName('Оборудование');
    var location = '';
    var type = '';
    var serial = '';
    
    if (equipmentSheet && data.equipment_id) {
      var eqData = equipmentSheet.getDataRange().getValues();
      for (var i = 2; i < eqData.length; i++) {
        if (eqData[i][0] == data.equipment_id) {
          location = eqData[i][2] || '';
          type = eqData[i][5] || '';
          serial = eqData[i][1] || '';
          break;
        }
      }
    }
    
    // Маппинг статуса
    var statusText = mapStatus(data.status);
    
    // Формируем комментарий
    var fullComment = data.comment || '';
    var parts = [];
    if (data.gate_status) {
      parts.push('Ворота: ' + mapStatus(data.gate_status));
    }
    if (data.platform_status) {
      parts.push('Платформа: ' + mapStatus(data.platform_status));
    }
    if (parts.length > 0) {
      fullComment += (fullComment ? '\n\n' : '') + parts.join('; ');
    }
    
    // Добавляем запись
    sheet.appendRow([
      data.datetime,
      data.equipment_id,
      location,
      type,
      serial,
      statusText,
      data.inspector,
      fullComment
    ]);
    
    // Автоширина колонок
    sheet.autoResizeColumns(1, 8);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Данные сохранены'
    })).setMimeType(ContentService.Application.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.Application.JSON);
  }
}

function mapStatus(status) {
  switch(status) {
    case 'ok': return 'Исправно';
    case 'warning': return 'Требует внимания';
    case 'critical': return 'Неисправно';
    default: return status || 'Неизвестно';
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Doorhan Inspection API работает'
  })).setMimeType(ContentService.Application.JSON);
}
