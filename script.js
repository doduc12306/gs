/**
 * ================================================
 * SCRIPT.JS - Dashboard theo dõi học tập (read-only)
 *
 * Chức năng:
 * 1. Tải dữ liệu buổi học từ Google Sheets (chỉ đọc)
 * 2. Hiển thị danh sách buổi học
 * 3. Tính toán và hiển thị thống kê
 * 4. Vẽ biểu đồ mức hiểu bài bằng CSS
 *
 * Dữ liệu được quản lý trực tiếp trên Google Sheets.
 * Website chỉ hiển thị, không có chức năng thêm/sửa/xoá.
 * ================================================
 */

// ===== CẤU HÌNH GOOGLE SHEETS =====
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8ZJT3XVRMBmq7xKzs5GW6UT6ars9WbC5HC-pC9VdgkOImv0-bhRnfYxfsFKhYWRB9/exec';

// Cache dữ liệu trong bộ nhớ
let cachedSessions = [];

// Bộ lọc tháng hiện tại ('all' = tất cả, hoặc 'YYYY-MM')
let currentMonthFilter = 'all';

// ===== HÀM GỌI GOOGLE SHEETS API =====

/**
 * Kiểm tra URL đã được cấu hình chưa
 */
function isConfigured() {
    return APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('YOUR_GOOGLE');
}

/**
 * Lấy danh sách buổi học từ Google Sheets
 */
async function fetchSessions() {
    if (!isConfigured()) {
        showToast('⚠️ Chưa cấu hình Google Sheets URL! Xem README.md');
        hideLoading();
        return [];
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();

        if (data.success) {
            cachedSessions = data.sessions || [];
            return cachedSessions;
        } else {
            console.error('Lỗi từ server:', data.error);
            showToast('❌ Lỗi tải dữ liệu: ' + data.error);
            return [];
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        showToast('❌ Không thể kết nối đến Google Sheets');
        return [];
    }
}

/**
 * Lấy sessions từ cache
 */
function getSessions() {
    return cachedSessions;
}

// ===== LOADING OVERLAY =====

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('show');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('show');
}

// ===== BỘ LỌC THÁNG =====

/**
 * Lấy danh sách sessions đã lọc theo tháng
 */
function getFilteredSessions() {
    const sessions = getSessions();
    if (currentMonthFilter === 'all') return sessions;

    return sessions.filter(s => {
        const d = new Date(s.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === currentMonthFilter;
    });
}

/**
 * Tạo danh sách tháng từ dữ liệu và đổ vào dropdown
 */
function populateMonthFilter() {
    const sessions = getSessions();
    const select = document.getElementById('monthFilter');
    if (!select) return;

    // Lưu giá trị đang chọn
    const prevValue = select.value;

    // Thu thập các tháng duy nhất
    const monthSet = new Set();
    sessions.forEach(s => {
        const d = new Date(s.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(ym);
    });

    // Sắp xếp mới nhất lên đầu
    const months = [...monthSet].sort((a, b) => b.localeCompare(a));

    // Tạo options
    const monthNames = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    select.innerHTML = '<option value="all">Tất cả</option>';
    months.forEach(ym => {
        const [year, month] = ym.split('-');
        const monthNum = parseInt(month);
        const label = `${monthNames[monthNum]} ${year}`;
        const count = sessions.filter(s => {
            const d = new Date(s.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === ym;
        }).length;
        const option = document.createElement('option');
        option.value = ym;
        option.textContent = `${label} (${count} buổi)`;
        select.appendChild(option);
    });

    // Khôi phục giá trị nếu vẫn tồn tại
    if ([...select.options].some(o => o.value === prevValue)) {
        select.value = prevValue;
    } else {
        select.value = 'all';
        currentMonthFilter = 'all';
    }
}

/**
 * Cập nhật số buổi hiển thị theo bộ lọc
 */
function updateMonthCount() {
    const filtered = getFilteredSessions();
    const countText = document.getElementById('monthCountText');
    if (countText) {
        countText.textContent = `${filtered.length} buổi`;
    }
}

// ===== RENDER DANH SÁCH BUỔI HỌC (READ-ONLY) =====

/**
 * Hiển thị buổi học ra giao diện (theo bộ lọc tháng)
 */
function renderSessions() {
    const filtered = getFilteredSessions();
    const sessionsList = document.getElementById('sessionsList');
    const emptyState = document.getElementById('emptyState');

    // Cập nhật số buổi
    updateMonthCount();

    if (filtered.length === 0) {
        emptyState.style.display = 'block';
        const oldCards = sessionsList.querySelectorAll('.session-card');
        oldCards.forEach(c => c.remove());
        return;
    }

    emptyState.style.display = 'none';

    // Sắp xếp theo ngày mới nhất lên đầu
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Xóa các card cũ
    const oldCards = sessionsList.querySelectorAll('.session-card');
    oldCards.forEach(c => c.remove());

    // Tạo card cho từng buổi
    sorted.forEach(session => {
        const card = createSessionCard(session);
        sessionsList.appendChild(card);
    });
}

/**
 * Tạo element card cho một buổi học (read-only, không có nút xoá/checkbox)
 */
function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'card session-card';

    // Xác định class màu cho level
    let levelClass = 'level-low';
    if (session.understandLevel >= 7) levelClass = 'level-high';
    else if (session.understandLevel >= 4) levelClass = 'level-medium';

    const dateFormatted = formatDate(session.date);

    // Tạo HTML cho danh sách bài tập (read-only, hiển thị dạng text)
    let homeworkHtml = '';
    if (session.homework && session.homework.length > 0) {
        homeworkHtml = session.homework.map(hw => {
            const completedClass = hw.completed ? 'completed' : '';
            const icon = hw.completed ? 'fa-check-circle' : 'fa-circle';
            return `<div class="hw-item ${completedClass}">
                <i class="fas ${icon}"></i>
                <span>${escapeHtml(hw.name)}</span>
            </div>`;
        }).join('');
    } else {
        homeworkHtml = '<span style="color: var(--gray-500); font-size: 0.85rem;">Không có bài tập</span>';
    }

    card.innerHTML = `
        <div class="session-header">
            <div class="session-date">
                <i class="fas fa-calendar-day"></i>
                ${dateFormatted}
            </div>
            <span class="session-level ${levelClass}">
                <i class="fas fa-brain"></i> ${session.understandLevel}/10
            </span>
        </div>
        <div class="session-body">
            <div class="session-field">
                <span class="session-field-label"><i class="fas fa-pen"></i> Nội dung học</span>
                <span class="session-field-value">${escapeHtml(session.content)}</span>
            </div>
            <div class="session-field">
                <span class="session-field-label"><i class="fas fa-tasks"></i> Bài tập</span>
                <div class="session-field-value">${homeworkHtml}</div>
            </div>
            <div class="session-field">
                <span class="session-field-label"><i class="fas fa-comment-dots"></i> Nhận xét gia sư</span>
                <span class="session-field-value">${escapeHtml(session.comment)}</span>
            </div>
            <div class="session-field">
                <span class="session-field-label"><i class="fas fa-redo"></i> Cần ôn tập thêm</span>
                <span class="session-field-value">${escapeHtml(session.reviewNeeded)}</span>
            </div>
        </div>
    `;

    return card;
}

// ===== THỐNG KÊ =====

/**
 * Cập nhật toàn bộ thống kê (theo bộ lọc tháng)
 */
function updateStatistics() {
    const sessions = getFilteredSessions();

    // 1. Tổng số buổi đã học
    document.getElementById('totalSessions').textContent = sessions.length;

    // 2. Trung bình mức độ hiểu bài
    if (sessions.length > 0) {
        const avgLevel = sessions.reduce((sum, s) => sum + s.understandLevel, 0) / sessions.length;
        document.getElementById('avgUnderstanding').textContent = avgLevel.toFixed(1);
    } else {
        document.getElementById('avgUnderstanding').textContent = '0';
    }

    // 3. Tỷ lệ hoàn thành bài tập
    let totalHomework = 0;
    let completedHomework = 0;
    sessions.forEach(s => {
        if (s.homework) {
            s.homework.forEach(hw => {
                totalHomework++;
                if (hw.completed) completedHomework++;
            });
        }
    });

    const hwRate = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;
    document.getElementById('homeworkRate').textContent = hwRate + '%';

    // 4. Vẽ biểu đồ mức hiểu bài
    renderChart(sessions);
}

/**
 * Vẽ biểu đồ thanh (bar chart) mức hiểu bài theo các buổi
 */
function renderChart(sessions) {
    const chartContainer = document.getElementById('understandChart');
    const emptyChart = document.getElementById('emptyChart');

    if (sessions.length === 0) {
        emptyChart.style.display = 'block';
        const bars = chartContainer.querySelectorAll('.chart-bar-wrapper');
        bars.forEach(b => b.remove());
        return;
    }

    emptyChart.style.display = 'none';

    // Sắp xếp theo ngày cũ -> mới (trái -> phải)
    const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Xóa chart cũ
    const oldBars = chartContainer.querySelectorAll('.chart-bar-wrapper');
    oldBars.forEach(b => b.remove());

    // Tạo thanh cho từng buổi
    sorted.forEach(session => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-bar-wrapper';

        let barClass = 'low';
        if (session.understandLevel >= 7) barClass = 'high';
        else if (session.understandLevel >= 4) barClass = 'medium';

        const height = (session.understandLevel / 10) * 160;

        const d = new Date(session.date);
        const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

        wrapper.innerHTML = `
            <span class="chart-bar-value">${session.understandLevel}</span>
            <div class="chart-bar ${barClass}" style="height: ${height}px;"></div>
            <span class="chart-bar-label">${shortDate}</span>
        `;

        chartContainer.appendChild(wrapper);
    });
}

// ===== TỔNG QUAN =====

/**
 * Cập nhật thông tin trên phần tổng quan
 */
function updateOverview() {
    const sessions = getSessions();

    // Trạng thái tiến độ
    const progressStatus = document.getElementById('progressStatus');
    if (sessions.length === 0) {
        progressStatus.textContent = 'Chưa có dữ liệu';
    } else {
        const avg = sessions.reduce((sum, s) => sum + s.understandLevel, 0) / sessions.length;
        if (avg >= 8) progressStatus.textContent = 'Rất tốt! 🌟';
        else if (avg >= 6) progressStatus.textContent = 'Đang tiến bộ 📈';
        else if (avg >= 4) progressStatus.textContent = 'Cần cố gắng thêm 💪';
        else progressStatus.textContent = 'Cần tập trung hơn ⚠️';
    }

    // Thanh tiến trình
    const goalProgress = document.getElementById('goalProgress');
    const goalNote = document.getElementById('goalNote');

    if (sessions.length > 0) {
        const avg = sessions.reduce((sum, s) => sum + s.understandLevel, 0) / sessions.length;
        const percent = Math.min(Math.round((avg / 10) * 100), 100);
        if (goalProgress) goalProgress.style.width = percent + '%';
        if (goalNote) goalNote.textContent = `Mức hiểu bài trung bình: ${avg.toFixed(1)}/10 — ${sessions.length} buổi đã học`;
    } else {
        if (goalProgress) goalProgress.style.width = '30%';
        if (goalNote) goalNote.textContent = 'Chưa có dữ liệu buổi học';
    }
}

// ===== THÔNG BÁO TOAST =====

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== TIỆN ÍCH =====

/**
 * Format ngày từ yyyy-mm-dd thành "Thứ X, dd/mm/yyyy"
 */
function formatDate(dateStr) {
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const d = new Date(dateStr);
    const dayName = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dayName}, ${dd}/${mm}/${yyyy}`;
}

/**
 * Escape HTML để tránh XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== KHỞI CHẠY KHI TRANG TẢI XONG =====

document.addEventListener('DOMContentLoaded', async () => {
    // Nút tải lại dữ liệu
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', async () => {
            btnRefresh.classList.add('spinning');
            showLoading();
            try {
                await fetchSessions();
                populateMonthFilter();
                renderSessions();
                updateOverview();
                updateStatistics();
                showToast('✅ Đã cập nhật dữ liệu mới nhất!');
            } catch (err) {
                console.error('Lỗi tải lại:', err);
                showToast('❌ Có lỗi khi tải dữ liệu');
            } finally {
                hideLoading();
                btnRefresh.classList.remove('spinning');
            }
        });
    }

    // Bộ lọc tháng
    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) {
        monthFilter.addEventListener('change', () => {
            currentMonthFilter = monthFilter.value;
            renderSessions();
            updateStatistics();
        });
    }

    // Tải dữ liệu lần đầu
    showLoading();
    try {
        await fetchSessions();
        populateMonthFilter();
        renderSessions();
        updateOverview();
        updateStatistics();
    } catch (err) {
        console.error('Lỗi khởi tạo:', err);
        showToast('❌ Có lỗi khi tải dữ liệu');
    } finally {
        hideLoading();
    }
});
