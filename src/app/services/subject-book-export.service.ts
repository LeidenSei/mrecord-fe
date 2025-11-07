import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface StudentInfo {
  stt: number;
  maHocSinh: string;
  hoTen: string;
  ngaySinh: string;
}

export interface ClassData {
  tenLop: string;
  students: StudentInfo[];
}

export interface TeacherInfo {
  truong: string;
  phuongXa?: string;
  tinhTP: string;
  hoTenGV: string;
  monHoc: string;
  hocKy: string;
  namHoc: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectBookExportFullService {

  async exportCompleteBook(teacherInfo: TeacherInfo, classes: ClassData[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // 1. Tạo sheet BÌA
    this.createBiaSheet(workbook, teacherInfo);

    // 2. Tạo sheet HƯỚNG DẪN
    this.createHuongDanSheet(workbook);

    // 3. Tạo sheet BÌA LÓT
    this.createBiaLotSheet(workbook, teacherInfo, classes);

    // 4. Tạo các sheet điểm cho từng lớp
    classes.forEach(classData => {
      this.createScoreSheet(workbook, teacherInfo, classData);
    });

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `SO_DIEM_BO_MON__${teacherInfo.hoTenGV.replace(/\s/g, '')}_${teacherInfo.hocKy.replace(/\s/g, '')}_${teacherInfo.namHoc}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  }

  /**
   * Tạo sheet BÌA (trang bìa ngoài)
   */
  private createBiaSheet(workbook: ExcelJS.Workbook, info: TeacherInfo): void {
    const ws = workbook.addWorksheet('Bia');

    // Set column widths
    ws.columns = [
      { width: 4.57 },    // A
      { width: 5.5 },      // B
      { width: 5.5 },      // C
      { width: 5.5 },      // D
      { width: 5.5 },      // E
      { width: 5.5 },      // F
      { width: 5.5 },      // G
      { width: 5.5 },      // H
      { width: 5.5 },      // I
      { width: 5.5 },      // J
      { width: 5.5 },      // K
      { width: 5.5 },      // L
      { width: 5.5 },      // M
      { width: 5.5 },      // N
      { width: 5.5 },      // O
      { width: 5.5 },      // P
      { width: 5.5 },      // Q
      { width: 3.29 },    // R
      { width: 7.71 },    // S
      { width: 6.14 }     // T
    ];

    // Row heights
    ws.getRow(2).height = 21;
    ws.getRow(3).height = 18;
    ws.getRow(4).height = 18;
    ws.getRow(5).height = 18;
    ws.getRow(16).height = 24.6;
    ws.getRow(17).height = 24.6;
    ws.getRow(26).height = 17.45;
    ws.getRow(28).height = 20.45;
    ws.getRow(45).height = 24;

    // Row 2: Merge B2:S2 (dòng trống)
    ws.mergeCells('B2:S2');

    // Thông tin trường (Row 3-5)
    ws.mergeCells('B3:S3');
    const schoolCell = ws.getCell('B3');
    schoolCell.value = `TRƯỜNG: ${info.truong}`;
    schoolCell.font = { name: 'Times New Roman', size: 14, bold: true };
    schoolCell.alignment = { horizontal: 'left', vertical: 'middle' };

    ws.mergeCells('B4:S4');
    const wardCell = ws.getCell('B4');
    wardCell.value = `Phường/Xã/Thành phố: ${info.phuongXa || ''}`;
    wardCell.font = { name: 'Times New Roman', size: 14, bold: true };
    wardCell.alignment = { horizontal: 'left', vertical: 'middle' };

    ws.mergeCells('B5:S5');
    const cityCell = ws.getCell('B5');
    cityCell.value = `Tỉnh/Thành phố: ${info.tinhTP}`;
    cityCell.font = { name: 'Times New Roman', size: 14, bold: true };
    cityCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Tiêu đề chính (Row 16-17) - KHÔNG CÓ BORDER riêng
    ws.mergeCells('A16:T16');
    const titleCell = ws.getCell('A16');
    titleCell.value = 'SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH';
    titleCell.font = { name: 'Times New Roman', size: 18, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('A17:T17');
    const subtitleCell = ws.getCell('A17');
    subtitleCell.value = 'CẤP TRUNG HỌC CƠ SỞ';
    subtitleCell.font = { name: 'Times New Roman', size: 16, bold: true };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Thông tin giáo viên (Row 26)
    ws.mergeCells('D26:H26');
    const teacherLabelCell = ws.getCell('D26');
    teacherLabelCell.value = 'Họ tên giáo viên: ';
    teacherLabelCell.font = { name: 'Times New Roman', size: 14, bold: true };
    teacherLabelCell.alignment = { horizontal: 'left', vertical: 'middle' };

    ws.mergeCells('I26:S26');
    const teacherNameCell = ws.getCell('I26');
    teacherNameCell.value = info.hoTenGV;
    teacherNameCell.font = { name: 'Times New Roman', size: 14, bold: true };
    teacherNameCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Môn học (Row 28)
    ws.mergeCells('D28:H28');
    const subjectLabelCell = ws.getCell('D28');
    subjectLabelCell.value = 'Môn học: ';
    subjectLabelCell.font = { name: 'Times New Roman', size: 14, bold: true };
    subjectLabelCell.alignment = { horizontal: 'left', vertical: 'top' };

    ws.mergeCells('I28:S31');
    const subjectNameCell = ws.getCell('I28');
    subjectNameCell.value = info.monHoc;
    subjectNameCell.font = { name: 'Times New Roman', size: 14, bold: true };
    subjectNameCell.alignment = { horizontal: 'left', vertical: 'top' };

    // Footer - NĂM HỌC (Row 45) - KHÔNG CÓ BORDER riêng
    ws.mergeCells('A45:T45');
    const yearCell = ws.getCell('A45');
    yearCell.value = `NĂM HỌC ${info.namHoc}`;
    yearCell.font = { name: 'Times New Roman', size: 14, bold: true };
    yearCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // ===== TẠO KHUNG DOUBLE BORDER BAO QUANH TỪ A1:T46 =====
    // Top border: Row 1, bottom = double
    for (let col = 1; col <= 20; col++) {
      ws.getRow(1).getCell(col).border = {
        bottom: { style: 'double' }
      };
    }

    // Left border: Column A, rows 2-46, left = double
    for (let row = 2; row <= 46; row++) {
      const cell = ws.getRow(row).getCell(1);
      cell.border = {
        ...cell.border,
        left: { style: 'double' }
      };
    }

    // Right border: Column T (20), rows 2-46, right = double
    for (let row = 2; row <= 46; row++) {
      const cell = ws.getRow(row).getCell(20);
      cell.border = {
        ...cell.border,
        right: { style: 'double' }
      };
    }

    // Bottom border: Row 46, bottom = double
    for (let col = 1; col <= 20; col++) {
      const cell = ws.getRow(46).getCell(col);
      cell.border = {
        ...cell.border,
        bottom: { style: 'double' }
      };
    }

    // ===== PAGE SETUP & PRINT SETTINGS =====
    // Set print area
    ws.pageSetup.printArea = 'A1:T46';
    
    // Set page setup
    ws.pageSetup.orientation = 'portrait';
    ws.pageSetup.paperSize = 9; // A4
    ws.pageSetup.scale = 93; // Scale 93%
    ws.pageSetup.fitToHeight = 0;
    
    // Set page margins (in inches)
    ws.pageSetup.margins = {
      left: 0.67,
      right: 0.67,
      top: 0.39,
      bottom: 0.39,
      header: 0.19,
      footer: 0.0
    };
  }

  /**
   * Tạo sheet HƯỚNG DẪN
   */
  private createHuongDanSheet(workbook: ExcelJS.Workbook): void {
    const ws = workbook.addWorksheet('Huong Dan');

    // Set column widths
    ws.columns = [
      { width: 5.29 },    // A
      { width: 5.5 },      // B
      { width: 5.5 },      // C
      { width: 5.5 },      // D
      { width: 5.5 },      // E
      { width: 5.5 },      // F
      { width: 5.5 },      // G
      { width: 5.5 },      // H
      { width: 5.5 },      // I
      { width: 5.5 },      // J
      { width: 5.5 },      // K
      { width: 5.5 },      // L
      { width: 5.5 },      // M
      { width: 5.5 },      // N
      { width: 18.71 }    // O
    ];

    // Tiêu đề (Row 1) - Merge A1:O1 - KHÔNG CÓ BORDER riêng
    ws.mergeCells('A1:O1');
    const titleCell = ws.getCell('A1');
    titleCell.value = 'HƯỚNG DẪN SỬ DỤNG SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH';
    titleCell.font = { name: 'Times New Roman', size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 2 - height
    ws.getRow(2).height = 15.6;

    // Nội dung hướng dẫn (Row 3) - Merge A3:O21
    ws.mergeCells('A3:O21');
    const contentCell = ws.getCell('A3');
    contentCell.value = `1. Sổ theo dõi và đánh giá học sinh là hồ sơ quản lý hoạt động dạy học và giáo dục của giáo viên, được quy định tại Điều lệ trường trung học cơ sở, trường trung học phổ thông và trường phổ thông có nhiều cấp học.

2. Sổ theo dõi và đánh giá học sinh do giáo viên môn học quản lý và sử dụng.

3. Giáo viên trực tiếp ghi vào sổ đầy đủ các thông tin cần thiết theo quy định, khớp với các thông tin trong Sổ theo dõi và đánh giá học sinh (theo lớp học) của môn học/lớp học do giáo viên chịu trách nhiệm theo phân công của nhà trường. Riêng cột Nhận xét sự tiến bộ, ưu điểm nổi bật, hạn chế chủ yếu của học sinh, giáo viên có thể lựa chọn để ghi sao cho có đủ thông tin cần thiết để cung cấp cho giáo viên chủ nhiệm theo quy định.

4. Không ghi bằng mực đỏ (trừ trường hợp sửa chữa), các loại mực có thể tẩy xóa được. Việc ghi sổ theo dõi và đánh giá học sinh phải đúng tiến độ thời gian theo kế hoạch dạy học của tổ chuyên môn và bảo quản, giữ gìn sổ cẩn thận, sạch sẽ.

5. Khi sửa chữa dùng bút đỏ gạch ngang nội dung cũ, ghi nội dung mới vào phía trên bên phải vị trí ghi nội dung cũ, ký xác nhận về sự sửa chữa bên cạnh nội dung đã sửa.`;
    
    contentCell.font = { name: 'Times New Roman', size: 14 };
    contentCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    ws.getRow(3).height = 409.15;

    // ===== TẠO KHUNG DOUBLE BORDER BAO QUANH TỪ A1:O46 =====
    // Top border: Row 1, top = double
    for (let col = 1; col <= 15; col++) {
      const cell = ws.getRow(1).getCell(col);
      cell.border = {
        ...cell.border,
        top: { style: 'double' }
      };
    }

    // Left border: Column A, rows 1-46, left = double
    for (let row = 1; row <= 46; row++) {
      const cell = ws.getRow(row).getCell(1);
      cell.border = {
        ...cell.border,
        left: { style: 'double' }
      };
    }

    // Right border: Column O (15), rows 1-46, right = double
    for (let row = 1; row <= 46; row++) {
      const cell = ws.getRow(row).getCell(15);
      cell.border = {
        ...cell.border,
        right: { style: 'double' }
      };
    }

    // Bottom border: Row 46, bottom = double
    for (let col = 1; col <= 15; col++) {
      const cell = ws.getRow(46).getCell(col);
      cell.border = {
        ...cell.border,
        bottom: { style: 'double' }
      };
    }

    // ===== PAGE SETUP & PRINT SETTINGS =====
    // Set print area
    ws.pageSetup.printArea = 'A1:O46';
    
    // Set page setup
    ws.pageSetup.orientation = 'portrait';
    ws.pageSetup.paperSize = 9; // A4
    ws.pageSetup.scale = 93; // Scale 93%
    ws.pageSetup.fitToHeight = 0;
    
    // Set page margins (in inches)
    ws.pageSetup.margins = {
      left: 0.67,
      right: 0.67,
      top: 0.39,
      bottom: 0.39,
      header: 0.19,
      footer: 0.0
    };
  }

  /**
   * Tạo sheet BÌA LÓT (có danh sách lớp)
   */
  private createBiaLotSheet(workbook: ExcelJS.Workbook, info: TeacherInfo, classes: ClassData[]): void {
    const ws = workbook.addWorksheet('Bia Lot');

    // Set column widths
    ws.columns = [
      { width: 4.57 },    // A
      { width: 5.5 },      // B
      { width: 5.5 },      // C
      { width: 5.5 },      // D
      { width: 5.5 },      // E
      { width: 5.5 },      // F
      { width: 5.5 },      // G
      { width: 5.5 },      // H
      { width: 5.5 },      // I
      { width: 5.5 },      // J
      { width: 5.5 },      // K
      { width: 5.5 },      // L
      { width: 5.5 },      // M
      { width: 5.5 },      // N
      { width: 5.5 },      // O
      { width: 5.5 },      // P
      { width: 5.5 },      // Q
      { width: 3.29 },    // R
      { width: 7.71 },    // S
      { width: 6.14 }     // T
    ];

    // Row heights
    ws.getRow(2).height = 14.45;
    ws.getRow(3).height = 19.15;
    ws.getRow(4).height = 19.15;
    ws.getRow(5).height = 19.15;
    ws.getRow(16).height = 25.15;
    ws.getRow(17).height = 25.15;
    ws.getRow(26).height = 17.45;
    ws.getRow(28).height = 19.15;
    ws.getRow(31).height = 18;
    ws.getRow(45).height = 23.45;

    // Thông tin trường (giống Bia)
    ws.mergeCells('B3:S3');
    ws.getCell('B3').value = `TRƯỜNG: ${info.truong}`;
    ws.getCell('B3').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('B3').alignment = { horizontal: 'left', vertical: 'middle' };

    ws.mergeCells('B4:S4');
    ws.getCell('B4').value = `Phường/Xã/Thành phố: ${info.phuongXa || ''}`;
    ws.getCell('B4').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('B4').alignment = { horizontal: 'left', vertical: 'middle' };

    ws.mergeCells('B5:S5');
    ws.getCell('B5').value = `Tỉnh/Thành phố: ${info.tinhTP}`;
    ws.getCell('B5').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('B5').alignment = { horizontal: 'left', vertical: 'middle' };

    // Tiêu đề - KHÔNG CÓ BORDER riêng
    ws.mergeCells('A16:T16');
    ws.getCell('A16').value = 'SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH';
    ws.getCell('A16').font = { name: 'Times New Roman', size: 18, bold: true };
    ws.getCell('A16').alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('A17:T17');
    ws.getCell('A17').value = 'CẤP TRUNG HỌC CƠ SỞ';
    ws.getCell('A17').font = { name: 'Times New Roman', size: 16, bold: true };
    ws.getCell('A17').alignment = { horizontal: 'center', vertical: 'middle' };

    // Thông tin giáo viên
    ws.mergeCells('D26:G26');
    ws.getCell('D26').value = 'Họ tên giáo viên: ';
    ws.getCell('D26').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('D26').alignment = { horizontal: 'left', vertical: 'middle' };

    ws.mergeCells('H26:S26');
    ws.getCell('H26').value = ` ${info.hoTenGV}`;
    ws.getCell('H26').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('H26').alignment = { horizontal: 'left', vertical: 'middle' };

    // Môn học
    ws.mergeCells('D28:G28');
    ws.getCell('D28').value = 'Môn học: ';
    ws.getCell('D28').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('D28').alignment = { horizontal: 'left', vertical: 'top' };

    ws.mergeCells('H28:S29');
    ws.getCell('H28').value = ` ${info.monHoc}`;
    ws.getCell('H28').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('H28').alignment = { horizontal: 'left', vertical: 'top' };

    // Danh sách lớp giảng dạy
    ws.mergeCells('D31:G31');
    ws.getCell('D31').value = 'Lớp giảng dạy: ';
    ws.getCell('D31').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('D31').alignment = { horizontal: 'left', vertical: 'top' };

    const classList = classes.map(c => c.tenLop).join(', ');
    ws.mergeCells('H31:S34');
    ws.getCell('H31').value = ` ${classList}`;
    ws.getCell('H31').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('H31').alignment = { horizontal: 'left', vertical: 'top' };

    // Footer - NĂM HỌC (Row 45) - KHÔNG CÓ BORDER riêng
    ws.mergeCells('A45:T45');
    const yearCell = ws.getCell('A45');
    yearCell.value = `NĂM HỌC ${info.namHoc}`;
    yearCell.font = { name: 'Times New Roman', size: 14, bold: true };
    yearCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // ===== TẠO KHUNG DOUBLE BORDER BAO QUANH TỪ A1:T46 =====
    // Top border: Row 1, bottom = double
    for (let col = 1; col <= 20; col++) {
      ws.getRow(1).getCell(col).border = {
        bottom: { style: 'double' }
      };
    }

    // Left border: Column A, rows 2-46, left = double
    for (let row = 2; row <= 46; row++) {
      const cell = ws.getRow(row).getCell(1);
      cell.border = {
        ...cell.border,
        left: { style: 'double' }
      };
    }

    // Right border: Column T (20), rows 2-46, right = double
    for (let row = 2; row <= 46; row++) {
      const cell = ws.getRow(row).getCell(20);
      cell.border = {
        ...cell.border,
        right: { style: 'double' }
      };
    }

    // Bottom border: Row 46, bottom = double
    for (let col = 1; col <= 20; col++) {
      const cell = ws.getRow(46).getCell(col);
      cell.border = {
        ...cell.border,
        bottom: { style: 'double' }
      };
    }

    // ===== PAGE SETUP & PRINT SETTINGS =====
    // Set print area
    ws.pageSetup.printArea = 'A1:T46';
    
    // Set page setup
    ws.pageSetup.orientation = 'portrait';
    ws.pageSetup.paperSize = 9; // A4
    ws.pageSetup.scale = 91; // Scale 91%
    ws.pageSetup.fitToHeight = 0;
    
    // Set page margins (in inches)
    ws.pageSetup.margins = {
      left: 0.67,
      right: 0.67,
      top: 0.39,
      bottom: 0.39,
      header: 0.0,
      footer: 0.2
    };
  }

  /**
   * Tạo sheet điểm cho một lớp
   */
  private createScoreSheet(workbook: ExcelJS.Workbook, info: TeacherInfo, classData: ClassData): void {
    const sheetName = `${info.monHoc}_${classData.tenLop}_${info.hocKy.replace(/\s/g, '')}`;
    const ws = workbook.addWorksheet(sheetName);

    // Column widths
    ws.columns = [
      { width: 8 }, { width: 15 }, { width: 25 }, { width: 12 },
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 },
      { width: 10 }, { width: 10 }, { width: 10 }
    ];

    // Dòng 1: Header cảnh báo (KHÔNG CÓ BORDER)
    ws.mergeCells('A1:K1');
    const headerCell = ws.getCell('A1');
    headerCell.value = 'Nhà trường chưa Hoàn thành tổng kết, kết quả có thể sẽ không được chính xác và đầy đủ.';
    headerCell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFF0000' } };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // NO BORDER for row 1

    // Dòng 2: Thông tin lớp
    ws.mergeCells('A2:C2');
    ws.getCell('A2').value = `LỚP: ${classData.tenLop}`;
    ws.getCell('A2').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('A2').alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getCell('A2').border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    // Apply border to all cells in merged range A2:C2
    for (let col = 1; col <= 3; col++) {
      ws.getRow(2).getCell(col).border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    }

    ws.mergeCells('D2:I2');
    ws.getCell('D2').value = `Môn: ${info.monHoc}`;
    ws.getCell('D2').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('D2').alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getCell('D2').border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    // Apply border to all cells in merged range D2:I2
    for (let col = 4; col <= 9; col++) {
      ws.getRow(2).getCell(col).border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    }

    ws.mergeCells('J2:K2');
    ws.getCell('J2').value = info.hocKy;
    ws.getCell('J2').font = { name: 'Times New Roman', size: 14, bold: true };
    ws.getCell('J2').alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell('J2').border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    // Apply border to all cells in merged range J2:K2
    for (let col = 10; col <= 11; col++) {
      ws.getRow(2).getCell(col).border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    }

    // Dòng 3: Header cột
    ws.mergeCells('E3:H3');
    
    const headers = [
      { col: 'A3', value: 'Số TT' },
      { col: 'B3', value: 'Mã học sinh' },
      { col: 'C3', value: 'Họ và tên học sinh' },
      { col: 'D3', value: 'Ngày sinh' },
      { col: 'E3', value: 'ĐĐGtx' },
      { col: 'I3', value: 'ĐĐG\ngk' },
      { col: 'J3', value: 'ĐĐG\nck' },
      { col: 'K3', value: 'ĐTB\nmhk' }
    ];

    headers.forEach(header => {
      const cell = ws.getCell(header.col);
      cell.value = header.value;
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Border cho các cell merged E3:H3
    ['E3', 'F3', 'G3', 'H3'].forEach(addr => {
      ws.getCell(addr).border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Thêm học sinh (CÁC CỘT ĐIỂM ĐỂ TRỐNG)
    classData.students.forEach((student, index) => {
      const rowNumber = index + 4;
      const row = ws.getRow(rowNumber);

      row.getCell(1).value = student.stt;
      row.getCell(2).value = student.maHocSinh;
      row.getCell(3).value = student.hoTen;
      row.getCell(4).value = student.ngaySinh;

      // Các cột 5-11 để trống cho điểm

      // Style
      for (let col = 1; col <= 11; col++) {
        const cell = row.getCell(col);
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.alignment = { 
          horizontal: col === 1 || col >= 5 ? 'center' : 'left', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      }
    });

    // Dòng tổng kết - "Số học sinh đạt ( Số học sinh - tỷ lệ %)"
    const summaryRow = classData.students.length + 4;
    
    // Merge A{summaryRow}:C{summaryRow+1}
    ws.mergeCells(`A${summaryRow}:C${summaryRow + 1}`);
    ws.getCell(`A${summaryRow}`).value = 'Số học sinh đạt \n( Số học sinh - tỷ lệ %)';
    ws.getCell(`A${summaryRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
    ws.getCell(`A${summaryRow}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Apply border to all cells in merged range
    for (let row = summaryRow; row <= summaryRow + 1; row++) {
      for (let col = 1; col <= 3; col++) {
        ws.getRow(row).getCell(col).border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      }
    }

    // Row summaryRow: - Đạt
    ws.getCell(`D${summaryRow}`).value = '- Đạt';
    ws.getCell(`D${summaryRow}`).font = { name: 'Times New Roman', size: 11 };
    ws.getCell(`D${summaryRow}`).alignment = { horizontal: 'left', vertical: 'middle' };

    ws.getCell(`F${summaryRow}`).value = 'SL: 0';
    ws.getCell(`F${summaryRow}`).font = { name: 'Times New Roman', size: 11 };
    ws.getCell(`F${summaryRow}`).alignment = { horizontal: 'left', vertical: 'middle' };

    ws.getCell(`I${summaryRow}`).value = 'TL: 0%';
    ws.getCell(`I${summaryRow}`).font = { name: 'Times New Roman', size: 11 };
    ws.getCell(`I${summaryRow}`).alignment = { horizontal: 'left', vertical: 'middle' };

    // Row summaryRow+1: - Chưa đạt
    ws.getCell(`D${summaryRow + 1}`).value = '- Chưa đạt';
    ws.getCell(`D${summaryRow + 1}`).font = { name: 'Times New Roman', size: 11 };
    ws.getCell(`D${summaryRow + 1}`).alignment = { horizontal: 'left', vertical: 'middle' };

    ws.getCell(`F${summaryRow + 1}`).value = 'SL: 0';
    ws.getCell(`F${summaryRow + 1}`).font = { name: 'Times New Roman', size: 11 };
    ws.getCell(`F${summaryRow + 1}`).alignment = { horizontal: 'left', vertical: 'middle' };

    ws.getCell(`I${summaryRow + 1}`).value = 'TL: 0%';
    ws.getCell(`I${summaryRow + 1}`).font = { name: 'Times New Roman', size: 11 };
    ws.getCell(`I${summaryRow + 1}`).alignment = { horizontal: 'left', vertical: 'middle' };

    // Apply borders to all cells in summary rows
    for (let row = summaryRow; row <= summaryRow + 1; row++) {
      for (let col = 1; col <= 11; col++) {
        ws.getRow(row).getCell(col).border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      }
    }
  }
}