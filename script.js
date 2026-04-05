(function () {
    'use strict';

    const STORAGE_KEY = 'mathClassData';
    const DATA_VERSION = '1.1';
    const DEFAULT_PEOPLE = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
    const MONTHS_TO_SHOW = 5;
    const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

    const THEME_PRESETS = {
        blue: {
            'bg-page': '#f3f4f6',
            'text-main': '#1f2937',
            'text-muted': '#6b7280',
            'surface': '#ffffff',
            'surface-strong': '#f9fafb',
            'border': '#d1d5db',
            'card-border': '#e5e7eb',
            'toolbar-bg': '#ffffff',
            'input-bg': '#ffffff',
            'primary': '#0078d4',
            'primary-hover': '#106ebe',
            'secondary': '#0f766e',
            'secondary-hover': '#115e59',
            'success': '#10b981',
            'success-hover': '#0f766e',
            'danger': '#ef4444',
            'danger-hover': '#dc2626',
            'warning': '#f59e0b',
            'warning-hover': '#d97706',
            'day-bg': '#ffffff',
            'day-hover': '#f3f4f6',
            'today-border': '#0078d4'
        },
        dark: {
            'bg-page': '#111827',
            'text-main': '#f8fafc',
            'text-muted': '#9ca3af',
            'surface': '#1f2937',
            'surface-strong': '#111827',
            'border': '#374151',
            'card-border': '#4b5563',
            'toolbar-bg': '#111827',
            'input-bg': '#1f2937',
            'primary': '#3b82f6',
            'primary-hover': '#2563eb',
            'secondary': '#0ea5e9',
            'secondary-hover': '#0284c7',
            'success': '#22c55e',
            'success-hover': '#16a34a',
            'danger': '#ef4444',
            'danger-hover': '#dc2626',
            'warning': '#f59e0b',
            'warning-hover': '#d97706',
            'day-bg': '#1f2937',
            'day-hover': '#111827',
            'today-border': '#3b82f6'
        },
        green: {
            'bg-page': '#eefaf4',
            'text-main': '#065f46',
            'text-muted': '#4d7c63',
            'surface': '#ffffff',
            'surface-strong': '#ecfdf5',
            'border': '#d1fae5',
            'card-border': '#a7f3d0',
            'toolbar-bg': '#ffffff',
            'input-bg': '#ffffff',
            'primary': '#047857',
            'primary-hover': '#065f46',
            'secondary': '#0f766e',
            'secondary-hover': '#115e59',
            'success': '#16a34a',
            'success-hover': '#15803d',
            'danger': '#ef4444',
            'danger-hover': '#dc2626',
            'warning': '#f59e0b',
            'warning-hover': '#d97706',
            'day-bg': '#ffffff',
            'day-hover': '#ecfdf5',
            'today-border': '#047857'
        },
        soft: {
            'bg-page': '#fff1f2',
            'text-main': '#7f1d1d',
            'text-muted': '#a21caf',
            'surface': '#ffffff',
            'surface-strong': '#fdf2f8',
            'border': '#f5d0fe',
            'card-border': '#fbcfe8',
            'toolbar-bg': '#ffffff',
            'input-bg': '#ffffff',
            'primary': '#db2777',
            'primary-hover': '#be185d',
            'secondary': '#8b5cf6',
            'secondary-hover': '#7c3aed',
            'success': '#14b8a6',
            'success-hover': '#0d9488',
            'danger': '#ef4444',
            'danger-hover': '#dc2626',
            'warning': '#f59e0b',
            'warning-hover': '#d97706',
            'day-bg': '#ffffff',
            'day-hover': '#fdf2f8',
            'today-border': '#db2777'
        }
    };

    const state = {
        available: [...DEFAULT_PEOPLE],
        selected: [],
        assignments: {},
        selectedDates: [],
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        theme: 'blue',
        layout: 'standard',
        customColors: {
            'primary': '#007acc',
            'secondary': '#f0f0f0',
            'accent': '#ff6b6b'
        },
        loading: false
    };

    const elements = {};

    const utils = {
        storage: {
            save(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (error) {
                    console.error('存储失败：', error);
                }
            },
            load(key) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (error) {
                    console.error('读取失败：', error);
                    return null;
                }
            }
        },

        validateName(name) {
            return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 20 && !/[<>]/.test(name);
        },

        formatDate(year, month, day) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        },

        shuffle(array) {
            const result = [...array];
            for (let i = result.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            return result;
        },

        showToast(message) {
            if (!elements.toast) return;
            elements.toast.textContent = message;
            elements.toast.classList.add('visible');
            clearTimeout(elements.toast.timeoutId);
            elements.toast.timeoutId = setTimeout(() => {
                elements.toast.classList.remove('visible');
            }, 2200);
        },

        setLoading(value) {
            state.loading = value;
            elements.drawButton.disabled = value;
            elements.drawButton.textContent = value ? '抽取中...' : '一键抽取';
        }
    };

    const dataManager = {
        load() {
            const data = utils.storage.load(STORAGE_KEY);
            if (!data || data.version !== DATA_VERSION) {
                return;
            }
            state.available = Array.isArray(data.available) ? data.available : [...DEFAULT_PEOPLE];
            state.selected = Array.isArray(data.selected) ? data.selected : [];
            state.assignments = typeof data.assignments === 'object' && data.assignments ? data.assignments : {};
            state.selectedDates = Array.isArray(data.selectedDates) ? data.selectedDates : [];
            state.currentMonth = Number.isInteger(data.currentMonth) ? data.currentMonth : state.currentMonth;
            state.currentYear = Number.isInteger(data.currentYear) ? data.currentYear : state.currentYear;
            state.theme = typeof data.theme === 'string' ? data.theme : state.theme;
            state.layout = typeof data.layout === 'string' ? data.layout : state.layout;
            state.customColors = typeof data.customColors === 'object' && data.customColors ? data.customColors : state.customColors;
        },
        save() {
            utils.storage.save(STORAGE_KEY, {
                version: DATA_VERSION,
                available: state.available,
                selected: state.selected,
                assignments: state.assignments,
                selectedDates: state.selectedDates,
                currentMonth: state.currentMonth,
                currentYear: state.currentYear,
                theme: state.theme,
                layout: state.layout,
                customColors: state.customColors
            });
        },
        reset() {
            state.available = [...DEFAULT_PEOPLE];
            state.selected = [];
            state.assignments = {};
            state.selectedDates = [];
            state.currentMonth = new Date().getMonth();
            state.currentYear = new Date().getFullYear();
            state.theme = 'blue';
            state.layout = 'standard';
        }
    };

    const uiManager = {
        applyTheme(theme) {
            let preset;
            if (theme === 'custom') {
                preset = { ...THEME_PRESETS.blue }; // 使用blue作为基础
                preset['primary'] = state.customColors.primary;
                preset['secondary'] = state.customColors.secondary;
                preset['accent'] = state.customColors.accent;
                // 可以添加更多映射如果需要
            } else {
                preset = THEME_PRESETS[theme] || THEME_PRESETS.blue;
            }
            const root = document.documentElement;
            Object.entries(preset).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value);
            });
            state.theme = theme;
            if (elements.themeSelect) {
                elements.themeSelect.value = theme;
            }
        },

        applyLayout(layout) {
            const classes = ['layout-standard', 'layout-compact', 'layout-spacious'];
            document.body.classList.remove(...classes);
            const target = `layout-${layout}`;
            document.body.classList.add(target);
            state.layout = layout;
            if (elements.layoutSelect) {
                elements.layoutSelect.value = layout;
            }
        }
    };

    const renderer = {
        renderLists() {
            elements.availableUl.innerHTML = '';
            elements.selectedUl.innerHTML = '';

            state.available.forEach((name) => {
                const item = document.createElement('li');
                item.textContent = name;
                item.tabIndex = 0;
                item.role = 'button';
                item.addEventListener('click', () => actions.movePerson(name, true));
                item.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        actions.movePerson(name, true);
                    }
                });
                elements.availableUl.appendChild(item);
            });

            state.selected.forEach((name) => {
                const item = document.createElement('li');
                item.textContent = name;
                item.tabIndex = 0;
                item.role = 'button';
                item.addEventListener('click', () => actions.movePerson(name, false));
                item.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        actions.movePerson(name, false);
                    }
                });
                elements.selectedUl.appendChild(item);
            });
        },

        renderCalendar() {
            const html = [];

            for (let offset = 0; offset < MONTHS_TO_SHOW; offset += 1) {
                const monthDate = new Date(state.currentYear, state.currentMonth + offset, 1);
                const year = monthDate.getFullYear();
                const month = monthDate.getMonth() + 1;
                const monthLabel = monthDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long'
                });
                const daysInMonth = new Date(year, month, 0).getDate();
                const firstWeekday = monthDate.getDay();

                html.push('<section class="month" aria-label="' + monthLabel + '">');
                html.push('<div class="month-header">' + monthLabel + '</div>');
                html.push('<div class="week-days">');
                WEEK_DAYS.forEach((weekday) => {
                    html.push('<div class="week-day">' + weekday + '</div>');
                });
                html.push('</div>');
                html.push('<div class="calendar-grid">');

                if (offset === 0) {
                    // 显示上个月的尾部日期
                    const prevMonth = month - 1;
                    const prevYear = prevMonth === 0 ? year - 1 : year;
                    const prevMonthAdjusted = prevMonth === 0 ? 12 : prevMonth;
                    const daysInPrevMonth = new Date(prevYear, prevMonthAdjusted, 0).getDate();
                    for (let blank = firstWeekday - 1; blank >= 0; blank -= 1) {
                        const prevDay = daysInPrevMonth - blank;
                        const prevDateKey = utils.formatDate(prevYear, prevMonthAdjusted, prevDay);
                        const assignedName = state.assignments[prevDateKey];
                        const isSelected = state.selectedDates.includes(prevDateKey);
                        const classes = ['day-card', 'prev-month'];
                        if (isSelected) classes.push('selected');
                        if (assignedName) classes.push('assigned');
                        html.push('<div class="' + classes.join(' ') + '" data-date="' + prevDateKey + '" tabindex="0" role="button" aria-pressed="' + isSelected + '">');
                        html.push('<div class="day-number">' + prevDay + '</div>');
                        if (assignedName) {
                            html.push('<div class="assigned-name" draggable="true" data-name="' + assignedName + '" data-date="' + prevDateKey + '">' + assignedName + '</div>');
                        }
                        html.push('</div>');
                    }
                } else {
                    for (let blank = 0; blank < firstWeekday; blank += 1) {
                        html.push('<div class="empty-card"></div>');
                    }
                }

                for (let day = 1; day <= daysInMonth; day += 1) {
                    const dateKey = utils.formatDate(year, month, day);
                    const assignedName = state.assignments[dateKey];
                    const isSelected = state.selectedDates.includes(dateKey);
                    const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString();

                    const classes = ['day-card'];
                    if (isSelected) classes.push('selected');
                    if (assignedName) classes.push('assigned');
                    if (isToday) classes.push('today');

                    html.push('<div class="' + classes.join(' ') + '" data-date="' + dateKey + '" tabindex="0" role="button" aria-pressed="' + isSelected + '">');
                    html.push('<div class="day-number">' + day + '</div>');
                    if (assignedName) {
                        html.push('<div class="assigned-name" draggable="true" data-name="' + assignedName + '" data-date="' + dateKey + '">' + assignedName + '</div>');
                    }
                    html.push('</div>');
                }

                html.push('</div>');
                html.push('</section>');
            }

            elements.calendarDiv.innerHTML = html.join('');
        },

        updateStats() {
            elements.statsDiv.textContent = `未抽取: ${state.available.length} 人  已抽取: ${state.selected.length} 人`;
        }
    };

    const actions = {
        movePerson(name, toSelected) {
            if (toSelected) {
                const index = state.available.indexOf(name);
                if (index === -1) return;
                state.available.splice(index, 1);
                state.selected.push(name);
            } else {
                const index = state.selected.indexOf(name);
                if (index === -1) return;
                state.selected.splice(index, 1);
                state.available.push(name);
                Object.keys(state.assignments).forEach((date) => {
                    if (state.assignments[date] === name) {
                        delete state.assignments[date];
                    }
                });
            }
            renderer.renderLists();
            renderer.renderCalendar();
            renderer.updateStats();
            dataManager.save();
        },

        toggleDateSelection(dateKey) {
            if (state.assignments[dateKey]) {
                return;
            }
            const index = state.selectedDates.indexOf(dateKey);
            if (index >= 0) {
                state.selectedDates.splice(index, 1);
            } else {
                state.selectedDates.push(dateKey);
            }
            renderer.renderCalendar();
            dataManager.save();
        },

        drawSelected() {
            if (state.selectedDates.length === 0) {
                utils.showToast('请先选择要抽取的日期');
                return;
            }

            if (state.available.length === 0) {
                const recycled = actions.recyclePreviousMonth();
                if (recycled.length === 0) {
                    utils.showToast('无可抽取人员，且上一个月无可回收人员');
                    return;
                }
                renderer.renderLists();
                renderer.updateStats();
            }

            utils.setLoading(true);
            setTimeout(() => {
                const shuffled = utils.shuffle(state.available);
                const assignCount = Math.min(shuffled.length, state.selectedDates.length);

                for (let i = 0; i < assignCount; i += 1) {
                    const dateKey = state.selectedDates[i];
                    const name = shuffled[i];
                    state.assignments[dateKey] = name;
                    actions.movePerson(name, true);
                }

                state.selectedDates = [];
                renderer.renderCalendar();
                renderer.updateStats();
                utils.setLoading(false);
                dataManager.save();
            }, 600);
        },

        recyclePreviousMonth() {
            const previousDate = new Date(state.currentYear, state.currentMonth - 1, 1);
            const prevYear = previousDate.getFullYear();
            const prevMonth = previousDate.getMonth() + 1;
            const recycled = [];

            Object.keys(state.assignments).forEach((dateKey) => {
                const [year, month] = dateKey.split('-').map(Number);
                if (year === prevYear && month === prevMonth) {
                    const name = state.assignments[dateKey];
                    if (state.selected.includes(name)) {
                        const index = state.selected.indexOf(name);
                        state.selected.splice(index, 1);
                        state.available.push(name);
                        recycled.push(name);
                    }
                    delete state.assignments[dateKey];
                }
            });
            return recycled;
        },

        addPerson() {
            const name = prompt('请输入要添加的人员姓名：');
            if (!name) {
                return;
            }
            const trimmed = name.trim();
            if (!utils.validateName(trimmed)) {
                utils.showToast('姓名无效，请输入 1-20 个字符');
                return;
            }
            if (state.available.includes(trimmed) || state.selected.includes(trimmed)) {
                utils.showToast('该姓名已存在');
                return;
            }
            state.available.push(trimmed);
            renderer.renderLists();
            renderer.updateStats();
            dataManager.save();
        },

        removePerson() {
            const allPeople = [...state.available, ...state.selected];
            if (allPeople.length === 0) {
                utils.showToast('当前没有可删除人员');
                return;
            }
            const name = prompt(`请输入要删除的人员姓名：\n${allPeople.join('，')}`);
            if (!name) {
                return;
            }
            const trimmed = name.trim();
            const availableIndex = state.available.indexOf(trimmed);
            const selectedIndex = state.selected.indexOf(trimmed);
            if (availableIndex === -1 && selectedIndex === -1) {
                utils.showToast('未找到该人员');
                return;
            }
            if (availableIndex >= 0) {
                state.available.splice(availableIndex, 1);
            }
            if (selectedIndex >= 0) {
                state.selected.splice(selectedIndex, 1);
                Object.keys(state.assignments).forEach((dateKey) => {
                    if (state.assignments[dateKey] === trimmed) {
                        delete state.assignments[dateKey];
                    }
                });
            }
            renderer.renderLists();
            renderer.renderCalendar();
            renderer.updateStats();
            dataManager.save();
        },

        clearAssignments() {
            if (!confirm('⚠️ 确认清除所有分配？\n\n这将把所有已抽取人员移回未抽取列表。')) {
                return;
            }
            state.available.push(...state.selected);
            state.selected = [];
            state.assignments = {};
            state.selectedDates = [];
            renderer.renderLists();
            renderer.renderCalendar();
            renderer.updateStats();
            dataManager.save();
            utils.showToast('已清除所有分配');
        },

        resetData() {
            if (!confirm('🚨 确认重置数据？\n\n此操作将恢复到初始状态，所有数据将被清空。')) {
                return;
            }
            dataManager.reset();
            renderer.renderLists();
            renderer.renderCalendar();
            renderer.updateStats();
            dataManager.save();
            utils.showToast('数据已重置');
        },

        editAssignment(dateKey, currentName) {
            const choice = prompt(`当前分配：${currentName} (${dateKey})\n1. 修改姓名\n2. 删除分配\n请输入操作编号：`);
            if (choice === '1') {
                const newName = prompt('请输入新姓名：', currentName);
                if (!newName) {
                    return;
                }
                const trimmed = newName.trim();
                if (!utils.validateName(trimmed)) {
                    utils.showToast('姓名格式无效');
                    return;
                }
                if (!state.available.includes(trimmed) && !state.selected.includes(trimmed) && trimmed !== currentName) {
                    utils.showToast('新姓名必须在人员列表中');
                    return;
                }
                state.assignments[dateKey] = trimmed;
                if (state.available.includes(trimmed)) {
                    actions.movePerson(trimmed, true);
                }
                renderer.renderCalendar();
                dataManager.save();
            } else if (choice === '2') {
                if (confirm(`确定删除 ${dateKey} 的分配吗？`)) {
                    delete state.assignments[dateKey];
                    renderer.renderCalendar();
                    dataManager.save();
                }
            }
        },

        exportData() {
            const payload = {
                version: DATA_VERSION,
                available: state.available,
                selected: state.selected,
                assignments: state.assignments,
                selectedDates: state.selectedDates,
                currentMonth: state.currentMonth,
                currentYear: state.currentYear
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mathClassData.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        importData(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                try {
                    const data = JSON.parse(loadEvent.target.result);
                    if (data.version !== DATA_VERSION) {
                        utils.showToast('数据版本不兼容');
                        return;
                    }
                    state.available = Array.isArray(data.available) ? data.available : [...DEFAULT_PEOPLE];
                    state.selected = Array.isArray(data.selected) ? data.selected : [];
                    state.assignments = typeof data.assignments === 'object' && data.assignments ? data.assignments : {};
                    state.selectedDates = Array.isArray(data.selectedDates) ? data.selectedDates : [];
                    state.currentMonth = Number.isInteger(data.currentMonth) ? data.currentMonth : state.currentMonth;
                    state.currentYear = Number.isInteger(data.currentYear) ? data.currentYear : state.currentYear;
                    dataManager.save();
                    renderer.renderLists();
                    renderer.renderCalendar();
                    renderer.updateStats();
                    utils.showToast('数据导入成功');
                } catch (error) {
                    utils.showToast('导入失败：文件格式错误');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    };

    const handlers = {
        calendarClick(event) {
            const assignedName = event.target.closest('.assigned-name');
            if (assignedName) {
                actions.editAssignment(assignedName.dataset.date, assignedName.dataset.name);
                return;
            }
            const card = event.target.closest('.day-card');
            if (!card || card.classList.contains('assigned')) {
                return;
            }
            actions.toggleDateSelection(card.dataset.date);
        },

        calendarKeydown(event) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }
            const card = event.target.closest('.day-card');
            if (!card || card.classList.contains('assigned')) {
                return;
            }
            event.preventDefault();
            actions.toggleDateSelection(card.dataset.date);
        },

        dragStart(event) {
            const target = event.target.closest('.assigned-name');
            if (!target) {
                return;
            }
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', JSON.stringify({
                name: target.dataset.name,
                date: target.dataset.date
            }));
        },

        dragOver(event) {
            event.preventDefault();
        },

        drop(event) {
            event.preventDefault();
            const card = event.target.closest('.day-card');
            if (!card) {
                return;
            }
            const payload = event.dataTransfer.getData('text/plain');
            if (!payload) {
                return;
            }
            const data = JSON.parse(payload);
            const targetDate = card.dataset.date;
            if (data.date === targetDate) {
                return;
            }
            state.assignments[targetDate] = data.name;
            delete state.assignments[data.date];
            renderer.renderCalendar();
            dataManager.save();
        }
    };

    function cacheElements() {
        elements.calendarDiv = document.getElementById('calendar');
        elements.availableUl = document.getElementById('available-ul');
        elements.selectedUl = document.getElementById('selected-ul');
        elements.statsDiv = document.getElementById('stats');
        elements.drawButton = document.getElementById('draw-button');
        elements.clearAssignmentsButton = document.getElementById('clear-assignments');
        elements.exportButton = document.getElementById('export-data');
        elements.importInput = document.getElementById('import-data');
        elements.importLabel = document.getElementById('import-label');
        elements.addPersonButton = document.getElementById('add-person');
        elements.removePersonButton = document.getElementById('remove-person');
        elements.resetDataButton = document.getElementById('reset-data');
        elements.themeSelect = document.getElementById('theme-select');
        elements.layoutSelect = document.getElementById('layout-select');
        elements.toast = document.getElementById('toast');
    }

    function bindEvents() {
        elements.drawButton.addEventListener('click', actions.drawSelected);
        elements.clearAssignmentsButton.addEventListener('click', actions.clearAssignments);
        elements.exportButton.addEventListener('click', actions.exportData);
        elements.importInput.addEventListener('change', actions.importData);
        elements.importLabel.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                elements.importInput.click();
            }
        });
        elements.addPersonButton.addEventListener('click', actions.addPerson);
        elements.removePersonButton.addEventListener('click', actions.removePerson);
        elements.resetDataButton.addEventListener('click', actions.resetData);
        if (elements.themeSelect) {
            elements.themeSelect.addEventListener('change', (event) => {
                const selectedTheme = event.target.value;
                uiManager.applyTheme(selectedTheme);
                const customColorsDiv = document.getElementById('custom-colors');
                if (selectedTheme === 'custom') {
                    customColorsDiv.style.display = 'block';
                } else {
                    customColorsDiv.style.display = 'none';
                }
                dataManager.save();
            });
        }
        if (elements.layoutSelect) {
            elements.layoutSelect.addEventListener('change', (event) => {
                uiManager.applyLayout(event.target.value);
                dataManager.save();
            });
        }
        // 自定义颜色输入器事件
        const primaryColorInput = document.getElementById('primary-color');
        const secondaryColorInput = document.getElementById('secondary-color');
        const accentColorInput = document.getElementById('accent-color');
        if (primaryColorInput) {
            primaryColorInput.addEventListener('input', (event) => {
                state.customColors.primary = event.target.value;
                if (state.theme === 'custom') {
                    uiManager.applyTheme('custom');
                }
                dataManager.save();
            });
        }
        if (secondaryColorInput) {
            secondaryColorInput.addEventListener('input', (event) => {
                state.customColors.secondary = event.target.value;
                if (state.theme === 'custom') {
                    uiManager.applyTheme('custom');
                }
                dataManager.save();
            });
        }
        if (accentColorInput) {
            accentColorInput.addEventListener('input', (event) => {
                state.customColors.accent = event.target.value;
                if (state.theme === 'custom') {
                    uiManager.applyTheme('custom');
                }
                dataManager.save();
            });
        }
        elements.calendarDiv.addEventListener('click', handlers.calendarClick);
        elements.calendarDiv.addEventListener('keydown', handlers.calendarKeydown);
        elements.calendarDiv.addEventListener('dragstart', handlers.dragStart);
        elements.calendarDiv.addEventListener('dragover', handlers.dragOver);
        elements.calendarDiv.addEventListener('drop', handlers.drop);
    }

    function initialize() {
        cacheElements();
        dataManager.load();
        uiManager.applyTheme(state.theme);
        uiManager.applyLayout(state.layout);
        // 设置自定义颜色输入值
        const primaryColorInput = document.getElementById('primary-color');
        const secondaryColorInput = document.getElementById('secondary-color');
        const accentColorInput = document.getElementById('accent-color');
        if (primaryColorInput) primaryColorInput.value = state.customColors.primary;
        if (secondaryColorInput) secondaryColorInput.value = state.customColors.secondary;
        if (accentColorInput) accentColorInput.value = state.customColors.accent;
        // 显示/隐藏自定义颜色
        const customColorsDiv = document.getElementById('custom-colors');
        if (customColorsDiv) {
            customColorsDiv.style.display = state.theme === 'custom' ? 'block' : 'none';
        }
        renderer.renderLists();
        renderer.renderCalendar();
        renderer.updateStats();
        bindEvents();
    }

    initialize();
})();
