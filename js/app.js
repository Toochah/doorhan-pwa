// Конфигурация
const BUILD_VERSION = 'v13 - ' + new Date().toISOString();
console.log('PWA Version:', BUILD_VERSION);

const SPREADSHEET_ID = '1xXhOoYUk45im6hCksWXtzFNjk0RA82OuzghMcuUDXj4';
const API_KEY = 'AIzaSyAQQgNfyc66ywxeWauLFAYyCVaQS7dli1I';

// Глобальные данные
let equipment = [];
let inspections = {};
let inspectors = [];

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleConfig();
    updateDate();
    setupFilters();
    setupModal();
    setupForm();
});

// Обновление даты
function updateDate() {
    const dateEl = document.getElementById('current-date');
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Загрузка конфигурации из Google Sheets
async function loadGoogleConfig() {
    try {
        // Загружаем инспекторов из google-config.json
        const response = await fetch('google-config.json');
        const config = await response.json();
        inspectors = config.inspectors || [];
        
        // Заполняем селект инспекторов
        const select = document.getElementById('inspector');
        inspectors.forEach(insp => {
            const option = document.createElement('option');
            option.value = insp.name;
            option.textContent = insp.name;
            select.appendChild(option);
        });
        
        // Загружаем оборудование
        await loadEquipment();
        
        // Загружаем осмотры
        await loadInspections();
        
    } catch (error) {
        console.error('Ошибка загрузки конфига:', error);
        // Пробуем загрузить локальные данные
        loadLocalData();
    }
}

// Загрузка оборудования из Google Sheets
async function loadEquipment() {
    try {
        const sheetName = 'Оборудование';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
        console.log('Loading from:', url);
        const response = await fetch(url);
        const data = await response.json();

        if (data.values) {
            parseEquipment(data.values);
            renderEquipment();
            updateStats();
        }
    } catch (error) {
        console.error('Ошибка загрузки оборудования:', error);
    }
}

// Парсинг оборудования
function parseEquipment(rows) {
    equipment = [];
    // Пропускаем заголовки (первые 2 строки)
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0] && !row[1]) continue;
        if (row[0] && row[0].includes('Журнал')) continue;
        
        const id = row[0];
        if (!id) continue;
        
        equipment.push({
            id: id,
            serial: row[1] || 'Нет',
            location: row[2] || '',
            year: row[3],
            size: row[4] || '-',
            type: row[5] || '',
            service: row[6] || '-',
            note: row[7] || ''
        });
    }
}

// Загрузка осмотров
async function loadInspections() {
    try {
        const sheetName = 'Осмотры';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
        console.log('Loading from:', url);
        const response = await fetch(url);
        const data = await response.json();

        if (data.values) {
            parseInspections(data.values);
        } else if (data.error) {
            console.warn('Осмотры:', data.error.message);
            // Лист может не существовать - это нормально
            inspections = {};
        }
    } catch (error) {
        console.error('Ошибка загрузки осмотров:', error);
        inspections = {};
    }
}

// Парсинг осмотров
function parseInspections(rows) {
    inspections = {};
    // Пропускаем заголовок
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const eqId = row[1]; // ID оборудования
        if (!eqId) continue;
        
        inspections[eqId] = {
            last_date: row[0],
            status: mapStatus(row[5]),
            comment: row[7],
            inspector: row[6]
        };
    }
}

// Маппинг статуса
function mapStatus(statusText) {
    if (statusText && statusText.includes('Исправно')) return 'ok';
    if (statusText && statusText.includes('внимания')) return 'warning';
    if (statusText && statusText.includes('Неисправно')) return 'critical';
    return null;
}

// Локальные данные (резерв)
function loadLocalData() {
    // Пытаемся загрузить локальный config
    fetch('google-config.json')
        .then(r => r.json())
        .then(config => {
            inspectors = config.inspectors || [];
            const select = document.getElementById('inspector');
            inspectors.forEach(insp => {
                const option = document.createElement('option');
                option.value = insp.name;
                option.textContent = insp.name;
                select.appendChild(option);
            });
        })
        .catch(() => {
            // Инспекторы по умолчанию
            inspectors = [
                { name: 'Косогоров Сергей Леонидович' },
                { name: 'Барыкин Александр Геннадьевич' }
            ];
        });
}

// Рендер оборудования
function renderEquipment(filter = 'all') {
    const container = document.getElementById('equipment-container');
    container.innerHTML = '';

    let filtered = equipment;
    if (filter !== 'all') {
        filtered = equipment.filter(eq => eq.location && eq.location.includes(filter));
    }

    // Общее количество
    const totalCount = filtered.length;
    document.getElementById('total-count').textContent = totalCount;
    console.log(`Рендер: ${totalCount} записей (фильтр: ${filter})`);
    
    // Детальная статистика по локациям
    const locationStats = {};
    filtered.forEach(eq => {
        const loc = eq.location || 'Другое';
        locationStats[loc] = (locationStats[loc] || 0) + 1;
    });
    console.log('Статистика по локациям:', locationStats);

    // Группировка по локациям
    const grouped = {};
    filtered.forEach(eq => {
        const loc = eq.location || 'Другое';
        if (!grouped[loc]) grouped[loc] = [];
        grouped[loc].push(eq);
    });

    console.log(`Группировка: ${Object.keys(grouped).length} локаций`, Object.keys(grouped));

    // Рендер по локациям
    Object.keys(grouped).sort().forEach(location => {
        const items = grouped[location];

        const section = document.createElement('section');
        section.className = 'location-block';
        section.dataset.location = location;

        // Заголовок локации
        const title = document.createElement('h2');
        title.className = 'location-title';
        title.onclick = () => toggleSection(title);
        title.innerHTML = `
            📍 ${location}
            <span class="count">${items.length} ед.</span>
            <span class="arrow">▶</span>
        `;
        section.appendChild(title);

        // Список оборудования - скрыт по умолчанию
        const list = document.createElement('div');
        list.className = 'equipment-list';
        list.style.display = 'none'; // Скрыто по умолчанию

        items.forEach(eq => {
            const inspection = inspections[eq.id];
            const statusClass = inspection?.status || 'none';
            const statusText = {
                'ok': 'Исправно',
                'warning': 'Требует внимания',
                'critical': 'Неисправно'
            }[statusClass] || 'Не осмотрено';

            const card = document.createElement('div');
            card.className = 'equipment-card';
            card.dataset.id = eq.id;

            card.innerHTML = `
                <div class="card-header">
                    <span class="eq-number">№${eq.id}</span>
                    <span class="eq-status status-${statusClass}">${statusText}</span>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <span class="label">Тип:</span>
                        <span class="value">${eq.type || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Серийный №:</span>
                        <span class="value">${eq.serial || '-'}</span>
                    </div>
                    ${inspection ? `
                    <div class="info-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                        <span class="label" style="color: #666;">Последний осмотр:</span>
                        <span class="value" style="color: #666;">${inspection.last_date} (${inspection.inspector})</span>
                    </div>
                    ` : ''}
                </div>
                <button class="btn-inspect">✏️ Пройти осмотр</button>
            `;
            
            // Добавляем обработчик клика
            const btn = card.querySelector('.btn-inspect');
            btn.addEventListener('click', () => openModal(eq.id));
            
            list.appendChild(card);
        });

        section.appendChild(list);
        container.appendChild(section);
    });
}

// Переключение секции
window.toggleSection = function(title) {
    const list = title.nextElementSibling;
    const arrow = title.querySelector('.arrow');
    if (list.style.display === 'none') {
        list.style.display = 'grid';
        arrow.textContent = '▼';
    } else {
        list.style.display = 'none';
        arrow.textContent = '▶';
    }
}

// Иконка статуса
function getStatusIcon(status) {
    switch(status) {
        case 'ok': return '✅';
        case 'warning': return '⚠️';
        case 'critical': return '❌';
        default: return '📋';
    }
}

// Фильтры
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderEquipment(btn.dataset.filter);
            updateStats(btn.dataset.filter);
        });
    });
}

// Модальное окно
function setupModal() {
    const modal = document.getElementById('modal');
    const close = document.querySelector('.close');
    
    close.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Открытие модального окна
window.openModal = function(equipmentId) {
    const eq = equipment.find(e => e.id == equipmentId);
    if (!eq) return;

    document.getElementById('equipment-id').value = eq.id;
    document.getElementById('modal-title').textContent = `Осмотр №${eq.id} - ${eq.location}`;
    document.getElementById('form-result').className = '';
    document.getElementById('form-result').style.display = 'none';

    // Сброс формы
    document.getElementById('inspection-form').reset();
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('gate-status').value = '';
    document.getElementById('platform-status').value = '';

    // По умолчанию выбираем Ворота и Платформу (если есть)
    const gateCheckbox = document.getElementById('inspect-gate');
    const platformCheckbox = document.getElementById('inspect-platform');
    if (gateCheckbox) gateCheckbox.checked = true;
    if (platformCheckbox) platformCheckbox.checked = true;

    // Показываем/скрываем секции (если существуют)
    const gateSection = document.getElementById('gateSection');
    const platformSection = document.getElementById('platformSection');
    if (gateSection) gateSection.style.display = 'block';
    if (platformSection) platformSection.style.display = 'block';

    document.getElementById('modal').classList.add('active');
}

// Настройка формы
function setupForm() {
    // Выбор статуса
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.parentElement;
            const input = parent.querySelector('input[type="hidden"]');
            
            parent.querySelectorAll('.status-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            input.value = this.dataset.status;
        });
    });
    
    // Отправка формы
    document.getElementById('inspection-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitInspection();
    });
}

// Отправка осмотра
async function submitInspection() {
    const eqId = document.getElementById('equipment-id').value;
    const inspector = document.getElementById('inspector').value;
    const comment = document.getElementById('comment').value;
    const inspectGate = document.getElementById('inspect-gate').checked;
    const inspectPlatform = document.getElementById('inspect-platform').checked;
    const gateStatus = document.getElementById('gate-status').value;
    const platformStatus = document.getElementById('platform-status').value;

    console.log('Отправка осмотра:', { 
        eqId, 
        inspector, 
        inspectGate, 
        inspectPlatform, 
        gateStatus, 
        platformStatus,
        gateStatusSelected: document.querySelector('#gateSection .status-btn.selected')?.textContent,
        platformStatusSelected: document.querySelector('#platformSection .status-btn.selected')?.textContent
    });

    if (!inspector) {
        showResult('Выберите инспектора', 'error');
        return;
    }

    if (!inspectGate && !inspectPlatform) {
        showResult('Выберите хотя бы одно оборудование', 'error');
        return;
    }

    // Проверка статуса для ворот
    if (inspectGate && !gateStatus) {
        console.error('Ворота: статус не выбран!');
        showResult('Выберите статус ворот (нажмите на кнопку ✅, ⚠️ или ❌)', 'error');
        return;
    }

    // Проверка статуса для платформы
    if (inspectPlatform && !platformStatus) {
        console.error('Платформа: статус не выбран!');
        showResult('Выберите статус платформы (нажмите на кнопку ✅, ⚠️ или ❌)', 'error');
        return;
    }

    // Определяем основной статус
    const mainStatus = gateStatus || platformStatus;

    // Формируем данные
    const now = new Date();
    const dateTime = now.toLocaleString('ru-RU');

    const inspectionData = {
        datetime: dateTime,
        equipment_id: eqId,
        inspector: inspector,
        comment: comment,
        gate_status: gateStatus,
        platform_status: platformStatus,
        status: mainStatus
    };

    try {
        // Отправляем в Google Sheets через Apps Script
        console.log('Отправка в Google Sheets:', inspectionData);
        await sendToGoogleSheets(inspectionData);

        // Обновляем локальные данные
        inspections[eqId] = {
            last_date: dateTime,
            status: mainStatus,
            comment: comment,
            inspector: inspector
        };

        showResult('Осмотр успешно сохранён!', 'success');

        // Обновляем UI
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        renderEquipment(activeFilter);
        updateStats(activeFilter);

        // Закрываем модалку через 2 секунды
        setTimeout(() => {
            document.getElementById('modal').classList.remove('active');
            document.getElementById('inspection-form').reset();
            document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('selected'));
        }, 2000);

    } catch (error) {
        console.error('Ошибка отправки:', error);
        showResult('Ошибка при сохранении: ' + error.message, 'error');
    }
}

// Отправка в Google Sheets
async function sendToGoogleSheets(data) {
    // Используем Google Apps Script Web App
    // ВСТАВЬТЕ СЮДА ВАШ URL от Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbye8VyU3woORBNih0e9GDgBidD6GlWA3Imvryyr85UntReStO_ciENW77oLRA2pTj2u/exec';
    
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    // no-cors режим не позволяет читать ответ, но запрос отправляется
    return true;
}

// Показ результата
function showResult(message, type) {
    const result = document.getElementById('form-result');
    result.textContent = message;
    result.className = type;
    result.style.display = 'block';
}

// Обновление статистики
function updateStats(filter = 'all') {
    let filtered = equipment;
    if (filter !== 'all') {
        filtered = equipment.filter(eq => eq.location && eq.location.includes(filter));
    }
    
    const ids = filtered.map(e => e.id);
    
    let ok = 0, warning = 0, critical = 0, none = 0;
    
    ids.forEach(id => {
        const inspection = inspections[id];
        if (!inspection) {
            none++;
        } else {
            switch(inspection.status) {
                case 'ok': ok++; break;
                case 'warning': warning++; break;
                case 'critical': critical++; break;
                default: none++;
            }
        }
    });
    
    document.getElementById('count-ok').textContent = ok;
    document.getElementById('count-warning').textContent = warning;
    document.getElementById('count-critical').textContent = critical;
    document.getElementById('count-none').textContent = none;
}
