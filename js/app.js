// Конфигурация
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
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Оборудование?key=${API_KEY}`;
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
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Осмотры?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.values) {
            parseInspections(data.values);
        }
    } catch (error) {
        console.error('Ошибка загрузки осмотров:', error);
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
    const container = document.getElementById('equipment-list');
    container.innerHTML = '';
    
    let filtered = equipment;
    if (filter !== 'all') {
        filtered = equipment.filter(eq => eq.location && eq.location.includes(filter));
    }
    
    document.getElementById('total-count').textContent = filtered.length;
    
    filtered.forEach(eq => {
        const inspection = inspections[eq.id];
        const statusIcon = getStatusIcon(inspection?.status);
        
        const item = document.createElement('div');
        item.className = 'equipment-item';
        item.innerHTML = `
            <div class="equipment-info">
                <h3>№${eq.id} - ${eq.location}</h3>
                <p>${eq.type} | ${eq.serial}</p>
                ${inspection ? `<p style="font-size:12px;color:#888;">Последний осмотр: ${inspection.last_date} (${inspection.inspector})</p>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
                <span class="equipment-status">${statusIcon}</span>
                <button class="btn-inspect" onclick="openModal('${eq.id}')">✏️ Осмотр</button>
            </div>
        `;
        container.appendChild(item);
    });
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
    document.getElementById('inspect-gate').checked = false;
    document.getElementById('inspect-platform').checked = false;
    
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
    
    if (!inspector) {
        showResult('Выберите инспектора', 'error');
        return;
    }
    
    if (!inspectGate && !inspectPlatform) {
        showResult('Выберите хотя бы одно оборудование', 'error');
        return;
    }
    
    if (inspectGate && !gateStatus) {
        showResult('Выберите статус ворот', 'error');
        return;
    }
    
    if (inspectPlatform && !platformStatus) {
        showResult('Выберите статус платформы', 'error');
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
        renderEquipment(document.querySelector('.filter-btn.active').dataset.filter);
        updateStats();
        
        // Закрываем модалку через 2 секунды
        setTimeout(() => {
            document.getElementById('modal').classList.remove('active');
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
