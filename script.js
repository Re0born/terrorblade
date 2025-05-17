const API_BASE_URL = '/local';
let authToken = null;
let currentUser = null;
const CORRECT_PIN = "1234";

const MOCK_defectTypes = [
    { id: 'dt1', name: 'Механічне пошкодження' }, { id: 'dt2', name: 'Невідповідність розміру' },
    { id: 'dt3', name: 'Помилка збірки' }, { id: 'dt4', name: 'Дефект покриття' }, { id: 'dt0', name: 'Інше' }
];
const MOCK_departments = [
    { id: 'dep1', name: 'Цех №1 (Механічний)' }, { id: 'dep2', name: 'Цех №2 (Термічний)' },
    { id: 'dep3', name: 'Складальний цех' }, { id: 'dep4', name: 'Відділ контролю якості (ВТК)' }
];
const MOCK_defectCauses = [
    { id: 'dc1', name: 'Помилка оператора' }, { id: 'dc2', name: 'Збій обладнання' },
    { id: 'dc3', name: 'Неякісні комплектуючі' }, { id: 'dc4', name: 'Порушення технологічного процесу' },
    { id: 'dc0', name: 'Невизначена причина' }
];

let MOCK_defectCasesArray = [];
const LOCAL_STORAGE_KEY_DEFECTS = 'defectTrackingApp_cases';

// Глобальні змінні для екземплярів графіків
let defectsByTypeChartInstance = null;
let defectsByCauseChartInstance = null;
let defectsByDepartmentChartInstance = null;


//Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', () => {
    const pinScreen = document.getElementById('pin-screen');
    const appContent = document.getElementById('app-content');
    const pinForm = document.getElementById('pinForm');
    const addDefectForm = document.getElementById('addDefectForm');
    const exportToExcelButton = document.getElementById('exportToExcel');
    
    const filterStartDateElement = document.getElementById('filterStartDate');
    const filterEndDateElement = document.getElementById('filterEndDate');

    pinScreen.style.display = 'block';
    appContent.style.display = 'none';

    if (pinForm) pinForm.addEventListener('submit', handlePinLogin);
    if (addDefectForm) addDefectForm.addEventListener('submit', handleDefectFormSubmit);
    if (exportToExcelButton) exportToExcelButton.addEventListener('click', handleExportToExcel);
    
    if (filterStartDateElement) {
        filterStartDateElement.addEventListener('change', () => {
            if (document.getElementById('viewReportsSection').style.display === 'block') {
                loadAndDisplayDefectCases();
            }
        });
    }
    if (filterEndDateElement) {
        filterEndDateElement.addEventListener('change', () => {
            if (document.getElementById('viewReportsSection').style.display === 'block') {
                loadAndDisplayDefectCases();
            }
        });
    }
    setupNavigation();
});


//АВуТЕНТИФІКАЦІЯ
async function handlePinLogin(event) {
    event.preventDefault();
    const pinInput = document.getElementById('pinCode');
    const pin = pinInput.value;

    if (!/^\d{4}$/.test(pin)) {
        displayMessage('pinMessages', 'ПІН-код має складатися з 4 цифр.', 'error');
        pinInput.value = '';
        return;
    }
    try {
        const data = await MOCK_authenticatePin(pin);
        authToken = data.token;
        currentUser = { userName: data.userName, role: data.role };
        displayMessage('pinMessages', `Ласкаво просимо, ${currentUser.userName}!`, 'success');
        pinInput.value = '';
        setTimeout(() => {
            document.getElementById('pin-screen').style.display = 'none';
            document.getElementById('app-content').style.display = 'block';
            loadDefectsFromLocalStorage();
            loadInitialAppData();
        }, 1000);
    } catch (error) {
        displayMessage('pinMessages', error.message, 'error');
        pinInput.value = '';
    }
}

async function MOCK_authenticatePin(pin) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (pin === CORRECT_PIN) {
                resolve({
                    token: 'local_mock_token_for_pin_' + pin,
                    userName: 'Користувач ' + pin.slice(-2),
                    role: 'Operator'
                });
            } else {
                reject(new Error('Неправильний ПІН-код. Спробуйте ще раз.'));
            }
        }, 500);
    });
}

function loadDefectsFromLocalStorage() {
    const storedCases = localStorage.getItem(LOCAL_STORAGE_KEY_DEFECTS);
    if (storedCases) {
        MOCK_defectCasesArray = JSON.parse(storedCases);
    } else {
        MOCK_defectCasesArray = [];
    }
    console.log('Дані завантажено з localStorage:', MOCK_defectCasesArray);
}

function saveDefectsToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY_DEFECTS, JSON.stringify(MOCK_defectCasesArray));
    console.log('Дані збережено в localStorage:', MOCK_defectCasesArray);
}


function loadInitialAppData() {
    fetchAndPopulateSelect('defectType', `${API_BASE_URL}/defecttypes`, MOCK_defectTypes, 'id', 'name', '-- Оберіть тип --');
    fetchAndPopulateSelect('department', `${API_BASE_URL}/departments`, MOCK_departments, 'id', 'name', '-- Оберіть підрозділ --');
    fetchAndPopulateSelect('defectCause', `${API_BASE_URL}/defectcauses`, MOCK_defectCauses, 'id', 'name', '-- Оберіть причину --');
    fetchAndPopulateSelect('filterDefectType', `${API_BASE_URL}/defecttypes`, MOCK_defectTypes, 'id', 'name', '-- Всі типи --');

    if (document.getElementById('viewReportsSection').style.display === 'block') {
        loadAndDisplayDefectCases();
    }
}

async function fetchAndPopulateSelect(selectId, apiUrl, mockData, valueField, textField, promptOptionText) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`Елемент select з ID "${selectId}" не знайдено.`);
        return;
    }
    while (selectElement.options.length > (selectElement.options[0]?.value === "" ? 1 : 0)) {
        selectElement.remove(selectElement.options.length > 1 ? 1 : 0);
    }
    if (selectElement.options.length === 0 || selectElement.options[0]?.value !== "") {
        if (promptOptionText) {
            const promptOption = document.createElement('option');
            promptOption.value = "";
            promptOption.textContent = promptOptionText;
            selectElement.insertBefore(promptOption, selectElement.firstChild);
            selectElement.value = "";
        }
    }
    try {
        const data = await MOCK_fetchReferenceData(mockData);
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(`Помилка завантаження даних для ${selectId}:`, error);
    }
}

async function MOCK_fetchReferenceData(mockDataToReturn) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockDataToReturn);
        }, 100);
    });
}

function clearFieldErrors(formElement) {
    const errorMessages = formElement.querySelectorAll('.error-message');
    errorMessages.forEach(span => span.textContent = '');

    const invalidFields = formElement.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => field.classList.remove('is-invalid'));
    
    const validFields = formElement.querySelectorAll('.is-valid'); 
    validFields.forEach(field => field.classList.remove('is-valid'));
}

function displayFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (field) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid'); 
    }
    if (errorSpan) errorSpan.textContent = message;
}

function markFieldAsValid(fieldId) { 
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    }
    if (errorSpan) errorSpan.textContent = ''; 
}

function validateAddDefectForm() {
    const form = document.getElementById('addDefectForm');
    clearFieldErrors(form); 
    let isValid = true;

    const defectDateInput = document.getElementById('defectDate');
    const defectTypeInput = document.getElementById('defectType');
    const quantityInput = document.getElementById('quantity');
    const departmentInput = document.getElementById('department');
    const causeInput = document.getElementById('defectCause');

    if (!defectDateInput.value) {
        displayFieldError('defectDate', 'Будь ласка, вкажіть дату виявлення.');
        isValid = false;
    } else {
        markFieldAsValid('defectDate'); 
    }

    if (!defectTypeInput.value) {
        displayFieldError('defectType', 'Будь ласка, оберіть тип браку.');
        isValid = false;
    } else {
        markFieldAsValid('defectType'); 
    }

    const quantity = parseInt(quantityInput.value, 10);
    if (isNaN(quantity) || quantity <= 0) {
        displayFieldError('quantity', 'Кількість має бути числом більшим за нуль.');
        isValid = false;
    } else {
        markFieldAsValid('quantity'); 
    }

    if (!departmentInput.value) {
        displayFieldError('department', 'Будь ласка, оберіть підрозділ.');
        isValid = false;
    } else {
        markFieldAsValid('department'); 
    }

    if (!causeInput.value) {
        displayFieldError('defectCause', 'Будь ласка, оберіть причину браку.');
        isValid = false;
    } else {
        markFieldAsValid('defectCause'); 
    }
    
    return isValid;
}


//     ОБРОБКА ФОРМИ ДОДАВАННЯ ВИПАДКУ БРАКУ
async function handleDefectFormSubmit(event) {
    event.preventDefault();

    if (!validateAddDefectForm()) {
        displayMessage('messages', 'Будь ласка, виправте помилки у формі.', 'error');
        return;
    }
    clearMessage('messages');

    const defectData = {
        date: document.getElementById('defectDate').value,
        typeId: document.getElementById('defectType').value,
        quantity: parseInt(document.getElementById('quantity').value, 10),
        departmentId: document.getElementById('department').value,
        responsiblePersonName: document.getElementById('responsiblePerson').value.trim(),
        causeId: document.getElementById('defectCause').value,
        description: document.getElementById('description').value.trim()
    };

    try {
        const savedDefect = await MOCK_saveDefectCase(defectData);
        displayMessage('messages', `Випадок браку успішно додано (ID: ${savedDefect.id})!`, 'success');
        document.getElementById('addDefectForm').reset();
        clearFieldErrors(document.getElementById('addDefectForm')); 
        
        if (document.getElementById('viewReportsSection').style.display === 'block') {
           loadAndDisplayDefectCases();
        }
    } catch (error) {
        displayMessage('messages', `Помилка збереження: ${error.message}`, 'error');
    }
}

async function MOCK_saveDefectCase(defectData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newCase = {
                ...defectData,
                typeName: MOCK_defectTypes.find(t => t.id === defectData.typeId)?.name || defectData.typeId,
                departmentName: MOCK_departments.find(d => d.id === defectData.departmentId)?.name || defectData.departmentId,
                causeName: MOCK_defectCauses.find(c => c.id === defectData.causeId)?.name || defectData.causeId,
                id: 'locID_' + Date.now(),
                recordedAt: new Date().toISOString()
            };
            MOCK_defectCasesArray.push(newCase);
            saveDefectsToLocalStorage();
            resolve(newCase);
        }, 100);
    });
}


// ЛОГІКА ВІДОБРАЖЕННЯ ЗВІТІВ
async function loadAndDisplayDefectCases() {
    const reportsMessagesContainer = document.getElementById('reportsMessages');
    displayMessage('reportsMessages', 'Завантаження даних...', 'info');

    const filterDefectTypeElement = document.getElementById('filterDefectType');
    const filterStartDateElement = document.getElementById('filterStartDate');
    const filterEndDateElement = document.getElementById('filterEndDate');

    const filterParams = {
        defectTypeId: filterDefectTypeElement ? filterDefectTypeElement.value : "",
        startDate: filterStartDateElement ? filterStartDateElement.value : "",
        endDate: filterEndDateElement ? filterEndDateElement.value : ""
    };
    console.log("Застосовані фільтри:", filterParams);

    try {
        const cases = await MOCK_fetchDefectCases(filterParams);
        renderDefectCasesTable(cases);

        if (cases.length > 0) {
            const defectsByTypeData = prepareDefectsByTypeData(cases);
            renderDefectsByTypeChart(defectsByTypeData);
            const defectsByCauseData = prepareDefectsByCauseData(cases);
            renderDefectsByCauseChart(defectsByCauseData);
            const defectsByDepartmentData = prepareDefectsByDepartmentData(cases);
            renderDefectsByDepartmentChart(defectsByDepartmentData);
            clearMessage('reportsMessages');
        } else {
            if (defectsByTypeChartInstance) { defectsByTypeChartInstance.destroy(); defectsByTypeChartInstance = null; }
            if (defectsByCauseChartInstance) { defectsByCauseChartInstance.destroy(); defectsByCauseChartInstance = null; }
            if (defectsByDepartmentChartInstance) { defectsByDepartmentChartInstance.destroy(); defectsByDepartmentChartInstance = null; }
        }
    } catch (error) {
        console.error("Помилка завантаження випадків браку:", error);
        displayMessage('reportsMessages', 'Не вдалося завантажити дані.', 'error');
    }
}

async function MOCK_fetchDefectCases(filterParams = {}) {
    return new Promise(resolve => {
        setTimeout(() => {
            let filteredCases = [...MOCK_defectCasesArray];

            if (filterParams.defectTypeId && filterParams.defectTypeId !== "") {
                filteredCases = filteredCases.filter(c => c.typeId === filterParams.defectTypeId);
            }
            if (filterParams.startDate) {
                const startDate = new Date(filterParams.startDate);
                startDate.setHours(0, 0, 0, 0);
                filteredCases = filteredCases.filter(c => {
                    const caseDate = new Date(c.date);
                    caseDate.setHours(0, 0, 0, 0);
                    return caseDate >= startDate;
                });
            }
            if (filterParams.endDate) {
                const endDate = new Date(filterParams.endDate);
                endDate.setHours(23, 59, 59, 999);
                filteredCases = filteredCases.filter(c => {
                    const caseDate = new Date(c.date);
                    return caseDate <= endDate;
                });
            }
            resolve(filteredCases.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)));
        }, 100);
    });
}

function renderDefectCasesTable(cases) {
    const container = document.getElementById('reportsTableContainer');
    if (!container) {
        console.error("Контейнер для таблиці звітів не знайдено.");
        return;
    }
    container.innerHTML = '';

    if (!cases || cases.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary-color);">Немає даних для відображення згідно поточних фільтрів.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'reports-table';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const headers = ['ID', 'Дата', 'Тип браку', 'К-сть', 'Підрозділ', 'Відповідальний', 'Причина', 'Опис', 'Зареєстровано'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    cases.forEach(caseItem => {
        const row = tbody.insertRow();
        row.insertCell().textContent = caseItem.id;
        row.insertCell().textContent = new Date(caseItem.date).toLocaleDateString();
        row.insertCell().textContent = caseItem.typeName;
        row.insertCell().textContent = caseItem.quantity;
        row.insertCell().textContent = caseItem.departmentName;
        row.insertCell().textContent = caseItem.responsiblePersonName || '-';
        row.insertCell().textContent = caseItem.causeName;
        row.insertCell().textContent = caseItem.description || '-';
        row.insertCell().textContent = new Date(caseItem.recordedAt).toLocaleString();
    });
    container.appendChild(table);
}


//ЛОГІКА ДЛЯ ГРАФІКІВ CHART.JS
function prepareDefectsByTypeData(cases) {
    const countsByType = {};
    cases.forEach(caseItem => {
        const typeName = caseItem.typeName || 'Не вказано';
        countsByType[typeName] = (countsByType[typeName] || 0) + caseItem.quantity;
    });
    return { labels: Object.keys(countsByType), data: Object.values(countsByType) };
}
function renderDefectsByTypeChart(chartData) { 
    const ctx = document.getElementById('defectsByTypeChart')?.getContext('2d');
    if (!ctx) {
        console.error("Елемент canvas для defectsByTypeChart не знайдено.");
        return;
    }
    if (defectsByTypeChartInstance) defectsByTypeChartInstance.destroy();
    const barColors = [
        'rgba(229, 57, 53, 0.7)', 'rgba(255, 152, 0, 0.7)', 'rgba(76, 175, 80, 0.7)',
        'rgba(33, 150, 243, 0.7)', 'rgba(156, 39, 176, 0.7)', 'rgba(255, 235, 59, 0.7)',
        'rgba(0, 150, 136, 0.7)'
    ];
    const borderColors = barColors.map(color => color.replace('0.7', '1'));
    defectsByTypeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Кількість браку', data: chartData.data,
                backgroundColor: barColors, borderColor: borderColors, borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, ticks: { color: 'var(--text-secondary-color)' }, grid: { color: 'var(--border-color)' } },
                y: { ticks: { color: 'var(--text-secondary-color)' } }
            },
            plugins: {
                legend: { display: true, labels: { color: 'var(--text-primary-color)' } },
                title: { display: true, text: 'Розподіл браку за типами', color: 'var(--text-primary-color)', font: { size: 16, family: 'var(--font-family-base)' } }
            }
        }
    });
}
function prepareDefectsByCauseData(cases) { 
    const countsByCause = {};
    cases.forEach(caseItem => {
        const causeName = caseItem.causeName || 'Не вказано';
        countsByCause[causeName] = (countsByCause[causeName] || 0) + caseItem.quantity;
    });
    return { labels: Object.keys(countsByCause), data: Object.values(countsByCause) };
}
function renderDefectsByCauseChart(chartData) {
    const ctx = document.getElementById('defectsByCauseChart')?.getContext('2d');
    if (!ctx) {
        console.error("Елемент canvas для defectsByCauseChart не знайдено.");
        return;
    }
    if (defectsByCauseChartInstance) defectsByCauseChartInstance.destroy();
    const pieColors = [
        'rgba(229, 57, 53, 0.8)', 'rgba(255, 152, 0, 0.8)', 'rgba(76, 175, 80, 0.8)',
        'rgba(33, 150, 243, 0.8)', 'rgba(156, 39, 176, 0.8)', 'rgba(255, 235, 59, 0.8)',
        'rgba(0, 150, 136, 0.8)', 'rgba(121, 85, 72, 0.8)', 'rgba(96, 125, 139, 0.8)'
    ];
    defectsByCauseChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Кількість браку', data: chartData.data,
                backgroundColor: pieColors, borderColor: 'var(--bg-container-color)', borderWidth: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top', labels: { color: 'var(--text-primary-color)' } },
                title: { display: true, text: 'Розподіл браку за причинами', color: 'var(--text-primary-color)', font: { size: 16, family: 'var(--font-family-base)' } },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            if (context.parsed !== null) label += context.parsed + ' од.';
                            let total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            let percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(2) + '%' : '0.00%';
                            label += ` (${percentage})`;
                            return label;
                        }
                    }
                }
            }
        }
    });
 }
function prepareDefectsByDepartmentData(cases) {
    const countsByDepartment = {};
    cases.forEach(caseItem => {
        const departmentName = caseItem.departmentName || 'Не вказано';
        countsByDepartment[departmentName] = (countsByDepartment[departmentName] || 0) + caseItem.quantity;
    });
    return { labels: Object.keys(countsByDepartment), data: Object.values(countsByDepartment) };
}
function renderDefectsByDepartmentChart(chartData) {
    const ctx = document.getElementById('defectsByDepartmentChart')?.getContext('2d');
    if (!ctx) {
        console.error("Елемент canvas для defectsByDepartmentChart не знайдено.");
        return;
    }
    if (defectsByDepartmentChartInstance) defectsByDepartmentChartInstance.destroy();
    const barColors = [
        'rgba(229, 57, 53, 0.7)', 'rgba(255, 152, 0, 0.7)', 'rgba(76, 175, 80, 0.7)',
        'rgba(33, 150, 243, 0.7)', 'rgba(156, 39, 176, 0.7)', 'rgba(255, 235, 59, 0.7)',
        'rgba(0, 150, 136, 0.7)'
    ];
    const borderColors = barColors.map(color => color.replace('0.7', '1'));
    defectsByDepartmentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Кількість браку', data: chartData.data,
                backgroundColor: barColors, borderColor: borderColors, borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, ticks: { color: 'var(--text-secondary-color)' }, grid: { color: 'var(--border-color)' } },
                y: { ticks: { color: 'var(--text-secondary-color)' } }
            },
            plugins: {
                legend: { display: true, labels: { color: 'var(--text-primary-color)' } },
                title: { display: true, text: 'Розподіл браку за підрозділами', color: 'var(--text-primary-color)', font: { size: 16, family: 'var(--font-family-base)' } }
            }
        }
    });
}

async function handleExportToExcel() { 
    displayMessage('reportsMessages', 'Підготовка даних для експорту...', 'info');
    const filterDefectTypeElement = document.getElementById('filterDefectType');
    const filterStartDateElement = document.getElementById('filterStartDate'); 
    const filterEndDateElement = document.getElementById('filterEndDate');     
    const filterParams = { 
        defectTypeId: filterDefectTypeElement ? filterDefectTypeElement.value : "",
        startDate: filterStartDateElement ? filterStartDateElement.value : "", 
        endDate: filterEndDateElement ? filterEndDateElement.value : ""         
    };
    try {
        const cases = await MOCK_fetchDefectCases(filterParams); 
        if (!cases || cases.length === 0) {
            displayMessage('reportsMessages', 'Немає даних для експорту.', 'error'); return;
        }
        const dataForExport = cases.map(caseItem => ({
            'ID': caseItem.id,
            'Дата виявлення': new Date(caseItem.date).toLocaleDateString(),
            'Тип браку': caseItem.typeName, 'Кількість': caseItem.quantity,
            'Підрозділ': caseItem.departmentName, 'Відповідальна особа': caseItem.responsiblePersonName || '-',
            'Причина браку': caseItem.causeName, 'Додатковий опис': caseItem.description || '-',
            'Дата реєстрації': new Date(caseItem.recordedAt).toLocaleString()
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Звіт по браку');
        const today = new Date();
        const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        XLSX.writeFile(workbook, `Звіт_по_браку_${dateString}.xlsx`);
        displayMessage('reportsMessages', 'Дані успішно експортовано!', 'success');
    } catch (error) {
        console.error("Помилка експорту в Excel:", error);
        displayMessage('reportsMessages', 'Не вдалося експортувати дані.', 'error');
    }
}

// --- НАВіГАЦІЯ МЕНЮ
function setupNavigation() {
    const navAddReport = document.getElementById('navAddReport');
    const navViewReports = document.getElementById('navViewReports');
    const addReportSection = document.getElementById('addReportSection');
    const viewReportsSection = document.getElementById('viewReportsSection');
    const filterDefectTypeElement = document.getElementById('filterDefectType');
    if (navAddReport) {
        navAddReport.addEventListener('click', (e) => {
            e.preventDefault();
            addReportSection.style.display = 'block';
            viewReportsSection.style.display = 'none';
            navAddReport.classList.add('active');
            if (navViewReports) navViewReports.classList.remove('active');
        });
    }
    if (navViewReports) {
        navViewReports.addEventListener('click', (e) => {
            e.preventDefault();
            addReportSection.style.display = 'none';
            viewReportsSection.style.display = 'block';
            if (navAddReport) navAddReport.classList.remove('active');
            navViewReports.classList.add('active');
            loadAndDisplayDefectCases();
        });
    }
    if (filterDefectTypeElement) {
        filterDefectTypeElement.addEventListener('change', () => {
            if (viewReportsSection && viewReportsSection.style.display === 'block') {
                loadAndDisplayDefectCases();
            }
        });
    }
}

//УТИЛІТИ
function displayMessage(containerId, message, type) { 
    const messagesContainer = document.getElementById(containerId);
    if (!messagesContainer) {
        console.error(`Контейнер повідомлень з ID "${containerId}" не знайдено.`);
        return;
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(messageDiv);
    if (type !== 'info') {
        setTimeout(() => {
            if (messagesContainer.contains(messageDiv)) {
                messagesContainer.removeChild(messageDiv);
            }
        }, type === 'error' ? 5000 : 3000);
    }
}
function clearMessage(containerId) {
    const messagesContainer = document.getElementById(containerId);
    if (messagesContainer) messagesContainer.innerHTML = '';
 }
window.addEventListener('unhandledrejection', function (event) {
    console.error('Неперехоплена помилка Promise:', event.reason);
 });
 