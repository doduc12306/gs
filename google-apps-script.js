<<<<<<< HEAD
/**
 * ================================================
 * CODE.GS - Google Apps Script
 * 
 * File này KHÔNG chạy trên website. 
 * Bạn cần COPY nội dung file này vào Google Apps Script Editor.
 * Xem README.md để biết hướng dẫn chi tiết.
 * 
 * Chức năng:
 * - Đọc tất cả buổi học từ Google Sheets (GET)
 * - Thêm buổi học mới (POST action=add)
 * - Cập nhật bài tập (POST action=update)
 * - Xoá buổi học (POST action=delete)
 * ================================================
 */

// ===== CẤU HÌNH =====
// Tên sheet chứa dữ liệu (tab trong Google Sheets)
const SHEET_NAME = 'Sessions';

/**
 * Lấy sheet dữ liệu
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

/**
 * Khởi tạo sheet với tiêu đề cột (chạy 1 lần)
 * Vào menu Extensions > Apps Script, chạy hàm này 1 lần để tạo header
 */
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // Tạo sheet nếu chưa có
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Đặt tiêu đề cột
  const headers = ['id', 'date', 'content', 'homework', 'comment', 'reviewNeeded', 'understandLevel'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff');
  
  // Auto resize cột
  headers.forEach((_, i) => sheet.autoResizeColumn(i + 1));
  
  Logger.log('Sheet đã được khởi tạo thành công!');
}

// ===== XỬ LÝ REQUEST GET =====
/**
 * Xử lý request GET - trả về tất cả buổi học dạng JSON
 * Được gọi tự động khi có HTTP GET request đến Web App URL
 */
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Nếu sheet trống (chỉ có header hoặc không có gì)
    if (data.length <= 1) {
      return createResponse({ success: true, sessions: [] });
    }
    
    const headers = data[0]; // Hàng đầu tiên là tiêu đề
    const sessions = [];
    
    // Chuyển từng hàng thành object
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Bỏ qua hàng trống
      if (!row[0]) continue;
      
      const session = {};
      headers.forEach((header, j) => {
        if (header === 'homework') {
          // homework lưu dạng JSON string, cần parse
          try {
            session[header] = JSON.parse(row[j]);
          } catch {
            session[header] = [];
          }
        } else if (header === 'understandLevel' || header === 'id') {
          session[header] = Number(row[j]);
        } else {
          session[header] = row[j];
        }
      });
      
      sessions.push(session);
    }
    
    return createResponse({ success: true, sessions: sessions });
    
  } catch (error) {
    return createResponse({ success: false, error: error.message });
  }
}

// ===== XỬ LÝ REQUEST POST =====
/**
 * Xử lý request POST - thêm/sửa/xoá buổi học
 * @param {Object} e - Event object chứa postData
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    switch (action) {
      case 'add':
        return handleAdd(body.session);
      case 'update':
        return handleUpdate(body.session);
      case 'delete':
        return handleDelete(body.id);
      default:
        return createResponse({ success: false, error: 'Action không hợp lệ' });
    }
    
  } catch (error) {
    return createResponse({ success: false, error: error.message });
  }
}

/**
 * Thêm buổi học mới vào sheet
 * @param {Object} session - Dữ liệu buổi học
 */
function handleAdd(session) {
  const sheet = getSheet();
  
  // Tạo hàng mới với thứ tự cột: id, date, content, homework, comment, reviewNeeded, understandLevel
  const newRow = [
    session.id,
    session.date,
    session.content,
    JSON.stringify(session.homework), // Lưu homework dạng JSON string
    session.comment,
    session.reviewNeeded,
    session.understandLevel
  ];
  
  sheet.appendRow(newRow);
  
  return createResponse({ success: true, message: 'Đã thêm buổi học' });
}

/**
 * Cập nhật buổi học (dùng cho toggle homework checkbox)
 * @param {Object} session - Dữ liệu buổi học đã cập nhật
 */
function handleUpdate(session) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Tìm hàng có id trùng
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === Number(session.id)) {
      // Cập nhật hàng đó
      const updatedRow = [
        session.id,
        session.date,
        session.content,
        JSON.stringify(session.homework),
        session.comment,
        session.reviewNeeded,
        session.understandLevel
      ];
      
      sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      return createResponse({ success: true, message: 'Đã cập nhật' });
    }
  }
  
  return createResponse({ success: false, error: 'Không tìm thấy buổi học' });
}

/**
 * Xoá buổi học theo ID
 * @param {number} id - ID buổi học cần xoá
 */
function handleDelete(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Tìm hàng có id trùng và xoá
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === Number(id)) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true, message: 'Đã xoá buổi học' });
    }
  }
  
  return createResponse({ success: false, error: 'Không tìm thấy buổi học' });
}

// ===== HÀM TIỆN ÍCH =====
/**
 * Tạo response JSON với header CORS
 * @param {Object} data - Dữ liệu trả về
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
=======
/**
 * ================================================
 * CODE.GS - Google Apps Script
 * 
 * File này KHÔNG chạy trên website. 
 * Bạn cần COPY nội dung file này vào Google Apps Script Editor.
 * Xem README.md để biết hướng dẫn chi tiết.
 * 
 * Chức năng:
 * - Đọc tất cả buổi học từ Google Sheets (GET)
 * - Thêm buổi học mới (POST action=add)
 * - Cập nhật bài tập (POST action=update)
 * - Xoá buổi học (POST action=delete)
 * ================================================
 */

// ===== CẤU HÌNH =====
// Tên sheet chứa dữ liệu (tab trong Google Sheets)
const SHEET_NAME = 'Sessions';

/**
 * Lấy sheet dữ liệu
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

/**
 * Khởi tạo sheet với tiêu đề cột (chạy 1 lần)
 * Vào menu Extensions > Apps Script, chạy hàm này 1 lần để tạo header
 */
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // Tạo sheet nếu chưa có
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Đặt tiêu đề cột
  const headers = ['id', 'date', 'content', 'homework', 'comment', 'reviewNeeded', 'understandLevel'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff');
  
  // Auto resize cột
  headers.forEach((_, i) => sheet.autoResizeColumn(i + 1));
  
  Logger.log('Sheet đã được khởi tạo thành công!');
}

// ===== XỬ LÝ REQUEST GET =====
/**
 * Xử lý request GET - trả về tất cả buổi học dạng JSON
 * Được gọi tự động khi có HTTP GET request đến Web App URL
 */
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Nếu sheet trống (chỉ có header hoặc không có gì)
    if (data.length <= 1) {
      return createResponse({ success: true, sessions: [] });
    }
    
    const headers = data[0]; // Hàng đầu tiên là tiêu đề
    const sessions = [];
    
    // Chuyển từng hàng thành object
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Bỏ qua hàng trống
      if (!row[0]) continue;
      
      const session = {};
      headers.forEach((header, j) => {
        if (header === 'homework') {
          // homework lưu dạng JSON string, cần parse
          try {
            session[header] = JSON.parse(row[j]);
          } catch {
            session[header] = [];
          }
        } else if (header === 'understandLevel' || header === 'id') {
          session[header] = Number(row[j]);
        } else {
          session[header] = row[j];
        }
      });
      
      sessions.push(session);
    }
    
    return createResponse({ success: true, sessions: sessions });
    
  } catch (error) {
    return createResponse({ success: false, error: error.message });
  }
}

// ===== XỬ LÝ REQUEST POST =====
/**
 * Xử lý request POST - thêm/sửa/xoá buổi học
 * @param {Object} e - Event object chứa postData
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    switch (action) {
      case 'add':
        return handleAdd(body.session);
      case 'update':
        return handleUpdate(body.session);
      case 'delete':
        return handleDelete(body.id);
      default:
        return createResponse({ success: false, error: 'Action không hợp lệ' });
    }
    
  } catch (error) {
    return createResponse({ success: false, error: error.message });
  }
}

/**
 * Thêm buổi học mới vào sheet
 * @param {Object} session - Dữ liệu buổi học
 */
function handleAdd(session) {
  const sheet = getSheet();
  
  // Tạo hàng mới với thứ tự cột: id, date, content, homework, comment, reviewNeeded, understandLevel
  const newRow = [
    session.id,
    session.date,
    session.content,
    JSON.stringify(session.homework), // Lưu homework dạng JSON string
    session.comment,
    session.reviewNeeded,
    session.understandLevel
  ];
  
  sheet.appendRow(newRow);
  
  return createResponse({ success: true, message: 'Đã thêm buổi học' });
}

/**
 * Cập nhật buổi học (dùng cho toggle homework checkbox)
 * @param {Object} session - Dữ liệu buổi học đã cập nhật
 */
function handleUpdate(session) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Tìm hàng có id trùng
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === Number(session.id)) {
      // Cập nhật hàng đó
      const updatedRow = [
        session.id,
        session.date,
        session.content,
        JSON.stringify(session.homework),
        session.comment,
        session.reviewNeeded,
        session.understandLevel
      ];
      
      sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      return createResponse({ success: true, message: 'Đã cập nhật' });
    }
  }
  
  return createResponse({ success: false, error: 'Không tìm thấy buổi học' });
}

/**
 * Xoá buổi học theo ID
 * @param {number} id - ID buổi học cần xoá
 */
function handleDelete(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Tìm hàng có id trùng và xoá
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === Number(id)) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true, message: 'Đã xoá buổi học' });
    }
  }
  
  return createResponse({ success: false, error: 'Không tìm thấy buổi học' });
}

// ===== HÀM TIỆN ÍCH =====
/**
 * Tạo response JSON với header CORS
 * @param {Object} data - Dữ liệu trả về
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
>>>>>>> master
