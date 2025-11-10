import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ==================== INTERFACES ====================

export interface StudentInfo {
  stt: number;
  maHocSinh: string;
  hoTen: string;
  ngaySinh: string;
  noiSinh?: string;
  gioiTinh?: 'Nam' | 'Nữ';
  danToc?: string;
  doiTuongUuTien?: string;
  diaChiGiaDinh?: string;
}

export interface ParentInfo {
  hoTenCha?: string;
  ngheNghiepCha?: string;
  dienThoaiCha?: string;
  emailCha?: string;
  hoTenMe?: string;
  ngheNghiepMe?: string;
  dienThoaiMe?: string;
  emailMe?: string;
  ghiChu?: string;
}

export interface StudentFullInfo extends StudentInfo {
  parentInfo?: ParentInfo;
}

export interface AttendanceRecord {
  studentId: string;
  days: { [day: number]: boolean }; // true = có mặt, false = vắng
  totalAbsent: number;
  permittedAbsent: number;
  unpermittedAbsent: number;
}

export interface SubjectScore {
  thuongXuyen: number[];  // Điểm thường xuyên
  giuaKy?: number;        // Điểm giữa kỳ
  cuoiKy?: number;        // Điểm cuối kỳ
  trungBinhHocKy?: number; // Điểm TB học kỳ
  trungBinhCaNam?: number; // Điểm TB cả năm
}

export interface SubjectAssessment {
  thuongXuyen: string[];  // Đ hoặc CĐ
  giuaKy?: string;
  cuoiKy?: string;
  hocKy?: string;
  caNam?: string;
}

export interface StudentScores {
  studentId: string;
  
  // Các môn đánh giá bằng nhận xét
  giaoDucTheChat?: SubjectAssessment;
  ngheThuat?: SubjectAssessment;
  hoatDongTraiNghiem?: SubjectAssessment;
  giaoDucDinhHuong?: SubjectAssessment;
  
  // Các môn đánh giá bằng điểm số
  nguVan?: SubjectScore;
  toan?: SubjectScore;
  ngoaiNgu1?: SubjectScore;
  giaoDucCongDan?: SubjectScore;
  lichSuVaDiaLy?: SubjectScore;
  khoaHocTuNhien?: SubjectScore;
  congNghe?: SubjectScore;
  tinHoc?: SubjectScore;
}

export interface ClassInfo {
  tenLop: string;
  siSo: number;
  students: StudentFullInfo[];
  attendance?: { [studentId: string]: AttendanceRecord };
  scores?: { [studentId: string]: StudentScores };
}

export interface TeacherInfo {
  truong: string;
  phuongXa?: string;
  huyenQuan?: string;
  tinhTP: string;
  hoTenGV: string;
  namHoc: string;
}

export interface SemesterInfo {
  hocKy: 'I' | 'II';
  thang: number;
  nam: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClassBookExportFullService {

  constructor() { }

  /**
   * Xuất file Excel đầy đủ cho một lớp học
   */
  async exportCompleteClassBook(
    teacherInfo: TeacherInfo,
    classInfo: ClassInfo,
    semesterInfo: SemesterInfo
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // 1. Bìa
    this.createBiaSheet(workbook, teacherInfo, classInfo);

    // 2. Hướng dẫn
    this.createHuongDanSheet(workbook);

    // 3. Bìa lót
    this.createBiaLotSheet(workbook, teacherInfo, classInfo);

    // 4. Sơ yếu lý lịch
    this.createSoYeuLyLichSheet(workbook, classInfo);

    // 5. Điểm danh HK2
    this.createDiemDanhSheet(workbook, classInfo, semesterInfo);

    // 6. Bìa phần ghi điểm HKII
    this.createBiaPhanGhiDiemSheet(workbook, classInfo, semesterInfo);

    // 7. Điểm HKII - Môn nhận xét
    this.createDiemMonNhanXetSheet(workbook, classInfo, semesterInfo);

    // 8. Điểm HKII - Môn tính điểm
    this.createDiemMonTinhDiemSheet(workbook, classInfo, semesterInfo);

    // 9. Điểm tổng kết HKII
    this.createDiemTongKetHKIISheet(workbook, classInfo);

    // 10. Tổng hợp cả năm
    this.createTongHopCaNamSheet(workbook, classInfo);

    // 11. Đánh giá xếp loại
    this.createDanhGiaXepLoaiSheet(workbook, classInfo);

    // 12. Nhận xét của Hiệu trưởng
    this.createNhanXetHieuTruongSheet(workbook);

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `SO_GOI_TEN_GHI_DIEM_${classInfo.tenLop}_${teacherInfo.namHoc}_HK${semesterInfo.hocKy}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  }

  // ==================== 1. BÌA ====================
  private createBiaSheet(workbook: ExcelJS.Workbook, info: TeacherInfo, classInfo: ClassInfo): void {
    const ws = workbook.addWorksheet('Bia');

    // Set column widths
    this.setColumnWidths(ws, [5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);

    // Row heights
    ws.getRow(4).height = 18;
    ws.getRow(5).height = 18;
    ws.getRow(6).height = 18;
    ws.getRow(18).height = 27;
    ws.getRow(19).height = 27;
    ws.getRow(43).height = 24;

    // Thông tin trường (Row 4-6)
    ws.mergeCells('C4:P4');
    ws.getCell('C4').value = `TRƯỜNG: ${info.truong}`;
    this.styleCell(ws.getCell('C4'), { size: 14, bold: true }, 'left');

    ws.mergeCells('C5:P5');
    ws.getCell('C5').value = `Huyện/Quận/Thị xã/Thành phố: ${info.huyenQuan || info.phuongXa || ''}`;
    this.styleCell(ws.getCell('C5'), { size: 14, bold: true }, 'left');

    ws.mergeCells('C6:P6');
    ws.getCell('C6').value = `Tỉnh/Thành phố: ${info.tinhTP}`;
    this.styleCell(ws.getCell('C6'), { size: 14, bold: true }, 'left');

    // Tiêu đề chính (Row 18-19)
    ws.mergeCells('A18:R18');
    ws.getCell('A18').value = 'SỔ GỌI TÊN VÀ GHI ĐIỂM';
    this.styleCell(ws.getCell('A18'), { size: 20, bold: true }, 'center');

    ws.mergeCells('A19:R19');
    ws.getCell('A19').value = 'CẤP TRUNG HỌC CƠ SỞ';
    this.styleCell(ws.getCell('A19'), { size: 18, bold: true }, 'center');

    // Thông tin lớp
    ws.mergeCells('E31:I31');
    ws.getCell('E31').value = `Lớp: ${classInfo.tenLop}`;
    this.styleCell(ws.getCell('E31'), { size: 14, bold: true }, 'left');

    ws.mergeCells('E33:I33');
    ws.getCell('E33').value = `Giáo viên chủ nhiệm: ${info.hoTenGV}`;
    this.styleCell(ws.getCell('E33'), { size: 14, bold: true }, 'left');

    // Footer - NĂM HỌC
    ws.mergeCells('A43:R43');
    ws.getCell('A43').value = `NĂM HỌC ${info.namHoc}`;
    this.styleCell(ws.getCell('A43'), { size: 14, bold: true }, 'center');

    // Page setup
    this.setupPage(ws, 'A1:R48');
  }

  // ==================== 2. HƯỚNG DẪN ====================
  private createHuongDanSheet(workbook: ExcelJS.Workbook): void {
    const ws = workbook.addWorksheet('Huong_Dan');

    this.setColumnWidths(ws, [5.5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 19]);

    // Tiêu đề
    ws.mergeCells('A2:P2');
    ws.getCell('A2').value = 'HƯỚNG DẪN SỬ DỤNG SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH';
    this.styleCell(ws.getCell('A2'), { size: 16, bold: true }, 'center');

    // Nội dung hướng dẫn
    ws.mergeCells('A4:P28');
    const contentCell = ws.getCell('A4');
    contentCell.value = `1. Sổ theo dõi và đánh giá học sinh (theo lớp học) được quy định tại Điều lệ trường trung học cơ sở, trường trung học phổ thông và trường phổ thông có nhiều cấp học. 

2. Sổ theo dõi và đánh giá học sinh (theo lớp học) do nhà trường quản lý và sử dụng.

3. Giáo viên môn học trực tiếp ghi vào Sổ theo dõi và đánh giá học sinh (theo lớp học) đầy đủ các thông tin cần thiết của môn học do giáo viên phụ trách, khớp với các thông tin trong Sổ theo dõi và đánh giá học sinh (của giáo viên), kí tên và ghi rõ họ tên vào cuối danh sách học sinh đối với từng môn học.  
Trường hợp có nhiều giáo viên cùng tham gia dạy học thì các giáo viên môn học cùng kí tên và ghi rõ họ tên vào cuối danh sách học sinh đối với từng môn học.

Giáo viên chủ nhiệm trực tiếp ghi vào Sổ theo dõi và đánh giá học sinh (theo lớp học) những thông tin thuộc nhiệm vụ quy định cho giáo viên chủ nhiệm lớp.

4. Không ghi bằng mực đỏ (trừ trường hợp sửa chữa), các loại mực có thể tẩy xóa được; việc ghi Sổ theo dõi và đánh giá học sinh (theo lớp học) phải cập nhật đúng tiến độ thời gian kế hoạch dạy học và giáo dục của tổ chuyên môn và bảo quản, giữ gìn cẩn thận, sạch sẽ.

5. Khi sửa chữa dùng bút đỏ gạch ngang nội dung cũ, ghi nội dung mới vào phía trên bên phải vị trí ghi nội dung cũ, ký xác nhận về sự sửa chữa ở ngay cạnh hoặc ở cột Ghi chú.

6. Nhà trường, giáo viên chủ nhiệm lớp, giáo viên môn học chỉ cung cấp các thông tin về kết quả rèn luyện và học tập của học sinh trong Sổ theo dõi và đánh giá học sinh (theo lớp học) cho riêng từng học sinh hoặc cha mẹ học sinh.`;
    
    contentCell.font = { name: 'Times New Roman', size: 14 };
    contentCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    ws.getRow(4).height = 450;

    this.setupPage(ws, 'A1:P32');
  }

  // ==================== 3. BÌA LÓT ====================
  private createBiaLotSheet(workbook: ExcelJS.Workbook, info: TeacherInfo, classInfo: ClassInfo): void {
    const ws = workbook.addWorksheet('Bia lot');

    // Similar to Bia but with more details
    this.setColumnWidths(ws, Array(37).fill(5.5));

    ws.mergeCells('C3:S3');
    ws.getCell('C3').value = `TRƯỜNG: ${info.truong}`;
    this.styleCell(ws.getCell('C3'), { size: 14, bold: true }, 'left');

    ws.mergeCells('C4:S4');
    ws.getCell('C4').value = `Huyện/Quận/Thị xã/Thành phố: ${info.huyenQuan || info.phuongXa || ''}`;
    this.styleCell(ws.getCell('C4'), { size: 14, bold: true }, 'left');

    ws.mergeCells('C5:S5');
    ws.getCell('C5').value = `Tỉnh/Thành phố: ${info.tinhTP}`;
    this.styleCell(ws.getCell('C5'), { size: 14, bold: true }, 'left');

    ws.mergeCells('A18:AK18');
    ws.getCell('A18').value = 'SỔ GỌI TÊN VÀ GHI ĐIỂM';
    this.styleCell(ws.getCell('A18'), { size: 20, bold: true }, 'center');

    ws.mergeCells('A19:AK19');
    ws.getCell('A19').value = 'CẤP TRUNG HỌC CƠ SỞ';
    this.styleCell(ws.getCell('A19'), { size: 18, bold: true }, 'center');

    // Class info with all subject teachers
    ws.mergeCells('E31:J31');
    ws.getCell('E31').value = `Lớp: ${classInfo.tenLop}`;
    this.styleCell(ws.getCell('E31'), { size: 14, bold: true }, 'left');

    ws.mergeCells('K31:T31');
    ws.getCell('K31').value = `Sĩ số: ${classInfo.siSo || classInfo.students.length}`;
    this.styleCell(ws.getCell('K31'), { size: 14, bold: true }, 'left');

    ws.mergeCells('E33:J33');
    ws.getCell('E33').value = 'Giáo viên chủ nhiệm:';
    this.styleCell(ws.getCell('E33'), { size: 14, bold: true }, 'left');

    ws.mergeCells('K33:T33');
    ws.getCell('K33').value = info.hoTenGV;
    this.styleCell(ws.getCell('K33'), { size: 14, bold: true }, 'left');

    // Subject teachers section (rows 35-50)
    const subjects = [
      'Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Giáo dục công dân',
      'Lịch sử và Địa lý', 'Khoa học tự nhiên', 'Công nghệ',
      'Tin học', 'Giáo dục thể chất', 'Nghệ thuật'
    ];

    let currentRow = 35;
    subjects.forEach(subject => {
      ws.mergeCells(`E${currentRow}:J${currentRow}`);
      ws.getCell(`E${currentRow}`).value = `${subject}:`;
      this.styleCell(ws.getCell(`E${currentRow}`), { size: 13 }, 'left');

      ws.mergeCells(`K${currentRow}:T${currentRow}`);
      // Leave blank for teacher name
      
      currentRow++;
    });

    ws.mergeCells('A56:AK56');
    ws.getCell('A56').value = `NĂM HỌC ${info.namHoc}`;
    this.styleCell(ws.getCell('A56'), { size: 14, bold: true }, 'center');

    this.setupPage(ws, 'A1:AK60');
  }

  // ==================== 4. SƠ YẾU LÝ LỊCH ====================
  private createSoYeuLyLichSheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo): void {
    const ws = workbook.addWorksheet('So_Yeu_Ly_Lich');

    // Column widths
    this.setColumnWidths(ws, [5, 18, 12, 12, 7, 7, 9, 25, 2, 5, 22, 22, 25, 2, 2]);

    // Title row
    ws.mergeCells('G1:I1');  // ✅ Sửa: Chỉ merge đến I1
    ws.getCell('G1').value = 'SƠ YẾU LÝ LỊCH';
    this.styleCell(ws.getCell('G1'), { size: 16, bold: true }, 'center');

    ws.mergeCells('J1:K1');  // ✅ Giờ J1 tự do để merge với K1
    ws.getCell('J1').value = 'HỌC SINH';
    this.styleCell(ws.getCell('J1'), { size: 16, bold: true }, 'center');

    // Headers (row 2)
    const headers = [
      { cell: 'A2', value: 'Số \nTT', width: 5 },
      { cell: 'B2', value: 'Họ và tên học sinh', width: 18 },
      { cell: 'C2', value: 'Ngày, tháng, năm sinh', width: 12 },
      { cell: 'D2', value: 'Nơi sinh', width: 12 },
      { cell: 'E2', value: 'Nam\n nữ', width: 7 },
      { cell: 'F2', value: 'Dân tộc', width: 7 },
      { cell: 'G2', value: 'Đối tượng\n ưu tiên', width: 9 },
      { cell: 'H2', value: 'Địa chỉ gia đình', width: 25 },
      { cell: 'J2', value: 'Số \nTT', width: 5 },
      { cell: 'K2', value: 'Họ và tên cha, nghề nghiệp, \nđiện thoại, email\n(hoặc người giám hộ)', width: 22 },
      { cell: 'L2', value: 'Họ và tên mẹ, nghề nghiệp, \nđiện thoại, email\n(hoặc người giám hộ)', width: 22 },
      { cell: 'M2', value: 'Những thay đổi cần chú ý trong năm học\n(gia đình, sức khỏe, nơi ở…)', width: 25 }
    ];

    headers.forEach(h => {
      const cell = ws.getCell(h.cell);
      cell.value = h.value;
      this.styleCell(cell, { size: 11, bold: true }, 'center');
      this.applyThinBorder(cell);
    });

    // Data rows
    classInfo.students.forEach((student, index) => {
      const rowNum = index + 3;
      
      ws.getCell(`A${rowNum}`).value = student.stt;
      ws.getCell(`B${rowNum}`).value = student.hoTen;
      ws.getCell(`C${rowNum}`).value = student.ngaySinh;
      ws.getCell(`D${rowNum}`).value = student.noiSinh || '';
      ws.getCell(`E${rowNum}`).value = student.gioiTinh || '';
      ws.getCell(`F${rowNum}`).value = student.danToc || 'Kinh';
      ws.getCell(`G${rowNum}`).value = student.doiTuongUuTien || '';
      ws.getCell(`H${rowNum}`).value = student.diaChiGiaDinh || '';
      ws.getCell(`J${rowNum}`).value = student.stt;
      
      if (student.parentInfo) {
        const parentText = `${student.parentInfo.hoTenCha || ''} - ${student.parentInfo.ngheNghiepCha || ''} - ${student.parentInfo.dienThoaiCha || ''}`;
        ws.getCell(`K${rowNum}`).value = parentText;
        
        const motherText = `${student.parentInfo.hoTenMe || ''} - ${student.parentInfo.ngheNghiepMe || ''} - ${student.parentInfo.dienThoaiMe || ''}`;
        ws.getCell(`L${rowNum}`).value = motherText;
      }

      // Apply borders and formatting
      for (let col = 1; col <= 15; col++) {
        if (col !== 9 && col !== 14 && col !== 15) {
          const cell = ws.getRow(rowNum).getCell(col);
          this.applyThinBorder(cell);
          cell.font = { name: 'Times New Roman', size: 11 };
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
      }
    });

    this.setupPage(ws, `A1:M${classInfo.students.length + 10}`);
  }

  // ==================== 5. ĐIỂM DANH ====================
  private createDiemDanhSheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo, semesterInfo: SemesterInfo): void {
    const ws = workbook.addWorksheet('Diem_Danh_HK2');

    // Column widths: STT, Họ tên, 31 ngày, Tổng số
    this.setColumnWidths(ws, [5, 18, ...Array(31).fill(3), 7, 7, 7]);

    // Title
    ws.mergeCells('A1:Z1');  // ✅ Text bên trái (A đến Z)
    ws.getCell('A1').value = `Tháng ${semesterInfo.thang} năm ${semesterInfo.nam}`;
    this.styleCell(ws.getCell('A1'), { size: 13, bold: true }, 'left');

    ws.mergeCells('AA1:AK1');  // ✅ Text bên phải (AA đến AK)
    ws.getCell('AA1').value = `Tổng số học sinh của lớp ${classInfo.tenLop}: ${classInfo.siSo || classInfo.students.length}`;
    this.styleCell(ws.getCell('AA1'), { size: 11, bold: true }, 'right');

    // Headers
    ws.mergeCells('A2:A3');
    ws.getCell('A2').value = 'Số \nTT';
    this.styleCell(ws.getCell('A2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('B2:B3');
    ws.getCell('B2').value = 'Ngày\n\nHọ và tên                Thứ';
    this.styleCell(ws.getCell('B2'), { size: 11, bold: true }, 'left');

    // Days 1-31
    for (let day = 1; day <= 31; day++) {
    const col = this.getColumnName(day + 2); // ✅ +2 vì A,B đã dùng, bắt đầu từ C
    ws.getCell(`${col}2`).value = day;
    this.styleCell(ws.getCell(`${col}2`), { size: 11, bold: true }, 'center');
    
    // Day of week (mock data)
    const dayOfWeek = ['CN', '2', '3', '4', '5', '6', '7'][(day - 1) % 7];
    ws.getCell(`${col}3`).value = dayOfWeek;
    this.styleCell(ws.getCell(`${col}3`), { size: 10 }, 'center');
    }

    // Total columns
    ws.mergeCells('AH2:AH3');
    ws.getCell('AH2').value = 'Tổng số \nbuổi nghỉ';
    this.styleCell(ws.getCell('AH2'), { size: 10, bold: true }, 'center');

    ws.mergeCells('AI2:AI3');
    ws.getCell('AI2').value = 'TS ';
    this.styleCell(ws.getCell('AI2'), { size: 10, bold: true }, 'center');

    ws.mergeCells('AJ2:AJ3');
    ws.getCell('AJ2').value = 'P';
    this.styleCell(ws.getCell('AJ2'), { size: 10, bold: true }, 'center');

    ws.mergeCells('AK2:AK3');
    ws.getCell('AK2').value = 'K';
    this.styleCell(ws.getCell('AK2'), { size: 10, bold: true }, 'center');

    // Student rows
    classInfo.students.forEach((student, index) => {
      const rowNum = index + 4;
      ws.getCell(`A${rowNum}`).value = student.stt;
      ws.getCell(`B${rowNum}`).value = student.hoTen;
      
      // Apply borders
      for (let col = 1; col <= 37; col++) {
        const cell = ws.getRow(rowNum).getCell(col);
        this.applyThinBorder(cell);
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    this.setupPage(ws, `A1:AK${classInfo.students.length + 10}`);
  }

  // ==================== 6. BÌA PHẦN GHI ĐIỂM ====================
  private createBiaPhanGhiDiemSheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo, semesterInfo: SemesterInfo): void {
    const ws = workbook.addWorksheet('BiaPhanGhiDiem_HKII');

    this.setColumnWidths(ws, Array(30).fill(6));

    ws.mergeCells('A10:AD10');
    ws.getCell('A10').value = 'PHẦN II';
    this.styleCell(ws.getCell('A10'), { size: 16, bold: true }, 'center');

    ws.mergeCells('A12:AD12');
    ws.getCell('A12').value = `GHI ĐIỂM HỌC KỲ ${semesterInfo.hocKy === 'I' ? 'I' : 'II'}`;
    this.styleCell(ws.getCell('A12'), { size: 16, bold: true }, 'center');

    ws.mergeCells('A15:AD15');
    ws.getCell('A15').value = `Lớp: ${classInfo.tenLop}`;
    this.styleCell(ws.getCell('A15'), { size: 14, bold: true }, 'center');

    ws.mergeCells('A17:AD17');
    ws.getCell('A17').value = `Sĩ số: ${classInfo.siSo || classInfo.students.length}`;
    this.styleCell(ws.getCell('A17'), { size: 14, bold: true }, 'center');

    this.setupPage(ws, 'A1:AD66');
  }

  // ==================== 7. ĐIỂM CÁC MÔN NHẬN XÉT ====================
  private createDiemMonNhanXetSheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo, semesterInfo: SemesterInfo): void {
    const ws = workbook.addWorksheet('Diem_HKII_MonNX');

    this.setColumnWidths(ws, [5, 18, 8, 8, 8, 8, 8, 8, 8, 8, 10, 15, 2, 2, 2]);

    const subjects = [
      'Giáo dục thể chất',
      'Nghệ thuật',
      'Hoạt động trải nghiệm',
      'Giáo dục định hướng'
    ];

    let currentRow = 1;

    subjects.forEach((subject, subjectIndex) => {
      // Subject header
      ws.mergeCells(`A${currentRow}:O${currentRow}`);
      ws.getCell(`A${currentRow}`).value = `HỌC KÌ ${semesterInfo.hocKy === 'I' ? 'I' : 'II'}`;
this.styleCell(ws.getCell(`A${currentRow}`), { size: 14, bold: true }, 'center');
      currentRow++;

      ws.mergeCells(`A${currentRow}:O${currentRow}`);
      ws.getCell(`A${currentRow}`).value = `Môn ${subject}`;
      this.styleCell(ws.getCell(`A${currentRow}`), { size: 14, bold: true }, 'left');
      currentRow++;

      // Column headers
      ws.mergeCells(`A${currentRow}:A${currentRow + 1}`);
      ws.getCell(`A${currentRow}`).value = 'Số \nTT';
      this.styleCell(ws.getCell(`A${currentRow}`), { size: 11, bold: true }, 'center');

      ws.mergeCells(`B${currentRow}:B${currentRow + 1}`);
      ws.getCell(`B${currentRow}`).value = 'Họ và tên';
      this.styleCell(ws.getCell(`B${currentRow}`), { size: 11, bold: true }, 'center');

      ws.mergeCells(`C${currentRow}:J${currentRow}`);
      ws.getCell(`C${currentRow}`).value = 'Mức đánh giá\nĐạt (Đ), Chưa đạt (CĐ)';
      this.styleCell(ws.getCell(`C${currentRow}`), { size: 11, bold: true }, 'center');

      ws.mergeCells(`K${currentRow}:K${currentRow + 1}`);
      ws.getCell(`K${currentRow}`).value = 'Mức đánh giá lại ';
      this.styleCell(ws.getCell(`K${currentRow}`), { size: 11, bold: true }, 'center');

      ws.mergeCells(`L${currentRow}:L${currentRow + 1}`);
      ws.getCell(`L${currentRow}`).value = 'Ghi chú';
      this.styleCell(ws.getCell(`L${currentRow}`), { size: 11, bold: true }, 'center');

      currentRow++;

      // Sub-headers
      const subHeaders = ['Thường xuyên', '', '', '', 'Giữa kì', 'Cuối kì', 'Học\n kì', 'Cả năm'];
      subHeaders.forEach((header, idx) => {
        const col = String.fromCharCode(67 + idx); // C = 67
        ws.getCell(`${col}${currentRow}`).value = header;
        this.styleCell(ws.getCell(`${col}${currentRow}`), { size: 10, bold: true }, 'center');
      });

      currentRow++;

      // Student data
      classInfo.students.forEach((student, index) => {
        ws.getCell(`A${currentRow}`).value = student.stt;
        ws.getCell(`B${currentRow}`).value = student.hoTen;
        
        // Default values "Đ" for assessment subjects
        ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
          ws.getCell(`${col}${currentRow}`).value = 'Đ';
          this.styleCell(ws.getCell(`${col}${currentRow}`), { size: 11 }, 'center');
          this.applyThinBorder(ws.getCell(`${col}${currentRow}`));
        });

        // Apply borders to all cells
        for (let col = 1; col <= 12; col++) {
          const cell = ws.getRow(currentRow).getCell(col);
          this.applyThinBorder(cell);
          cell.font = { name: 'Times New Roman', size: 11 };
        }

        currentRow++;
      });

      currentRow += 2; // Space between subjects
    });

    this.setupPage(ws, `A1:O${currentRow}`);
  }

  // ==================== 8. ĐIỂM CÁC MÔN TÍNH ĐIỂM ====================
  private createDiemMonTinhDiemSheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo, semesterInfo: SemesterInfo): void {
    const ws = workbook.addWorksheet('Diem_HKII_MonTinhDiem');

    this.setColumnWidths(ws, [5, 18, 8, 8, 8, 8, 8, 8, 10, 10, 12, 15, 2, 2]);

    const subjects = [
      'Ngữ văn',
      'Toán',
      'Ngoại ngữ 1',
      'Giáo dục công dân',
      'Lịch sử và Địa lý',
      'Khoa học tự nhiên',
      'Công nghệ',
      'Tin học'
    ];

    let currentRow = 1;

    subjects.forEach(subject => {
      // Subject header
      ws.mergeCells(`A${currentRow}:N${currentRow}`);
      ws.getCell(`A${currentRow}`).value = `HỌC KÌ ${semesterInfo.hocKy === 'I' ? 'I' : 'II'}`;
      this.styleCell(ws.getCell(`A${currentRow}`), { size: 14, bold: true }, 'center');
      currentRow++;

      ws.mergeCells(`A${currentRow}:N${currentRow}`);
      ws.getCell(`A${currentRow}`).value = `Môn ${subject}`;
      this.styleCell(ws.getCell(`A${currentRow}`), { size: 14, bold: true }, 'left');
      currentRow++;

      // Column headers
      const headers = [
        { cell: `A${currentRow}`, value: 'Số TT', merge: `A${currentRow}:A${currentRow + 1}` },
        { cell: `B${currentRow}`, value: 'Họ và tên', merge: `B${currentRow}:B${currentRow + 1}` },
        { cell: `C${currentRow}`, value: 'ĐĐGtx', merge: `C${currentRow}:F${currentRow}` },
        { cell: `G${currentRow}`, value: 'ĐĐG\ngk', merge: `G${currentRow}:G${currentRow + 1}` },
        { cell: `H${currentRow}`, value: 'ĐĐG\nck', merge: `H${currentRow}:H${currentRow + 1}` },
        { cell: `I${currentRow}`, value: 'ĐTB\nmhkII', merge: `I${currentRow}:I${currentRow + 1}` },
        { cell: `J${currentRow}`, value: 'ĐTB\nmcn', merge: `J${currentRow}:J${currentRow + 1}` },
        { cell: `K${currentRow}`, value: 'Đánh giá lại', merge: `K${currentRow}:K${currentRow + 1}` },
        { cell: `L${currentRow}`, value: 'Ghi chú', merge: `L${currentRow}:L${currentRow + 1}` }
      ];

      headers.forEach(h => {
        if (h.merge) ws.mergeCells(h.merge);
        ws.getCell(h.cell).value = h.value;
        this.styleCell(ws.getCell(h.cell), { size: 11, bold: true }, 'center');
        this.applyThinBorder(ws.getCell(h.cell));
      });

      currentRow += 2;

      // Student data
      classInfo.students.forEach(student => {
        ws.getCell(`A${currentRow}`).value = student.stt;
        ws.getCell(`B${currentRow}`).value = student.hoTen;
        
        // Leave score cells empty for teachers to fill in
        for (let col = 3; col <= 12; col++) {
          const cell = ws.getRow(currentRow).getCell(col);
          this.applyThinBorder(cell);
          cell.font = { name: 'Times New Roman', size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Apply borders to all cells
        for (let col = 1; col <= 12; col++) {
          const cell = ws.getRow(currentRow).getCell(col);
          this.applyThinBorder(cell);
          if (col <= 2) {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }
        }

        currentRow++;
      });

      currentRow += 2; // Space between subjects
    });

    this.setupPage(ws, `A1:N${currentRow}`);
  }

  // ==================== 9. TỔNG KẾT HỌC KỲ II ====================
  private createDiemTongKetHKIISheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo): void {
    const ws = workbook.addWorksheet('DiemTongKet_HKII');

    this.setColumnWidths(ws, [5, 18, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12, 12]);

    // Title
    ws.mergeCells('A1:P1');
    ws.getCell('A1').value = 'TỔNG HỢP HỌC KỲ II';
    this.styleCell(ws.getCell('A1'), { size: 16, bold: true }, 'center');

    // Headers
    ws.mergeCells('A2:A3');
    ws.getCell('A2').value = 'Số \nTT';
    this.styleCell(ws.getCell('A2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('B2:B3');
    ws.getCell('B2').value = 'Họ và tên';
    this.styleCell(ws.getCell('B2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('C2:F2');
    ws.getCell('C2').value = 'Môn học đánh giá bằng\n nhận xét';
    this.styleCell(ws.getCell('C2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('G2:N2');
    ws.getCell('G2').value = 'Môn học đánh giá bằng nhận xét kết hợp đánh giá bằng điểm số';
    this.styleCell(ws.getCell('G2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('O2:O3');
    ws.getCell('O2').value = 'Kết quả học tập';
    this.styleCell(ws.getCell('O2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('P2:P3');
    ws.getCell('P2').value = 'Kết quả rèn luyện';
    this.styleCell(ws.getCell('P2'), { size: 11, bold: true }, 'center');

    // Subject names in row 3
    const subjects = [
      'Giáo dục thể chất', 'Nghệ thuật', 'HĐTN', 'GDĐP',
      'Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Giáo dục công dân',
      'Lịch sử và địa lý', 'Khoa học Tự nhiên', 'Công nghệ', 'Tin học'
    ];

    subjects.forEach((subject, idx) => {
      const col = String.fromCharCode(67 + idx); // C = 67
      ws.getCell(`${col}3`).value = subject;
      this.styleCell(ws.getCell(`${col}3`), { size: 10, bold: true }, 'center');
      this.applyThinBorder(ws.getCell(`${col}3`));
    });

    // Student data
    classInfo.students.forEach((student, index) => {
      const rowNum = index + 4;
      ws.getCell(`A${rowNum}`).value = student.stt;
      ws.getCell(`B${rowNum}`).value = student.hoTen;
      
      // Default assessment subjects: Đ
      ['C', 'D', 'E', 'F'].forEach(col => {
        ws.getCell(`${col}${rowNum}`).value = 'Đ';
      });

      // Score subjects: leave empty
      // Results: default values
      ws.getCell(`O${rowNum}`).value = 'Tốt';
      ws.getCell(`P${rowNum}`).value = 'Tốt';

      // Apply borders and formatting
      for (let col = 1; col <= 16; col++) {
        const cell = ws.getRow(rowNum).getCell(col);
        this.applyThinBorder(cell);
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    this.setupPage(ws, `A1:P${classInfo.students.length + 10}`);
  }

  // ==================== 10. TỔNG HỢP CẢ NĂM ====================
  private createTongHopCaNamSheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo): void {
    const ws = workbook.addWorksheet('TongHopCaNam');

    this.setColumnWidths(ws, [5, 18, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);

    // Title
    ws.mergeCells('A1:N1');
    ws.getCell('A1').value = 'TỔNG HỢP CẢ NĂM HỌC';
    this.styleCell(ws.getCell('A1'), { size: 16, bold: true }, 'center');

    // Headers (similar to DiemTongKet but without results columns)
    ws.mergeCells('A2:A3');
    ws.getCell('A2').value = 'Số \nTT';
    this.styleCell(ws.getCell('A2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('B2:B3');
    ws.getCell('B2').value = 'Họ và tên';
    this.styleCell(ws.getCell('B2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('C2:F2');
    ws.getCell('C2').value = 'Môn học đánh giá bằng\n nhận xét';
    this.styleCell(ws.getCell('C2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('G2:N2');
    ws.getCell('G2').value = 'Môn học đánh giá bằng nhận xét kết hợp đánh giá bằng điểm số';
    this.styleCell(ws.getCell('G2'), { size: 11, bold: true }, 'center');

    // Subject names
    const subjects = [
      'Giáo dục thể chất', 'Nghệ thuật', 'HĐTN', 'GDĐP',
      'Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Giáo dục công dân',
      'Lịch sử và địa lý', 'Khoa học Tự nhiên', 'Công nghệ', 'Tin học'
    ];

    subjects.forEach((subject, idx) => {
      const col = String.fromCharCode(67 + idx);
      ws.getCell(`${col}3`).value = subject;
      this.styleCell(ws.getCell(`${col}3`), { size: 10, bold: true }, 'center');
      this.applyThinBorder(ws.getCell(`${col}3`));
    });

    // Student data
    classInfo.students.forEach((student, index) => {
      const rowNum = index + 4;
      ws.getCell(`A${rowNum}`).value = student.stt;
      ws.getCell(`B${rowNum}`).value = student.hoTen;
      
      // Default values
      ['C', 'D', 'E', 'F'].forEach(col => {
        ws.getCell(`${col}${rowNum}`).value = 'Đ';
      });

      // Apply borders
      for (let col = 1; col <= 14; col++) {
        const cell = ws.getRow(rowNum).getCell(col);
        this.applyThinBorder(cell);
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    this.setupPage(ws, `A1:N${classInfo.students.length + 10}`);
  }

  // ==================== 11. ĐÁNH GIÁ XẾP LOẠI ====================
  private createDanhGiaXepLoaiSheet(workbook: ExcelJS.Workbook, classInfo: ClassInfo): void {
    const ws = workbook.addWorksheet('DanhGiaXepLoai');

    this.setColumnWidths(ws, [5, 18, 10, 10, 10, 10, 10, 12, 12, 12, 30]);

    // Title
    ws.mergeCells('A1:R1');
    ws.getCell('A1').value = 'XẾP LOẠI CẢ NĂM HỌC';
    this.styleCell(ws.getCell('A1'), { size: 16, bold: true }, 'center');

    // Complex headers
    ws.mergeCells('A2:A3');
    ws.getCell('A2').value = 'Số \nTT';
    this.styleCell(ws.getCell('A2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('B2:B3');
    ws.getCell('B2').value = 'Họ và tên';
    this.styleCell(ws.getCell('B2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('C2:D2');
    ws.getCell('C2').value = 'Mức đánh giá';
    this.styleCell(ws.getCell('C2'), { size: 11, bold: true }, 'center');

    ws.getCell('C3').value = 'Kết quả rèn luyện';
    this.styleCell(ws.getCell('C3'), { size: 10, bold: true }, 'center');

    ws.getCell('D3').value = 'Kết quả học tập';
    this.styleCell(ws.getCell('D3'), { size: 10, bold: true }, 'center');

    ws.mergeCells('E2:F2');
    ws.getCell('E2').value = 'Mức đánh giá sau khi rèn luyện trong kì nghỉ hè; kiểm tra, đánh giá lại';
    this.styleCell(ws.getCell('E2'), { size: 10, bold: true }, 'center');

    ws.getCell('E3').value = 'Kết quả rèn luyện';
    this.styleCell(ws.getCell('E3'), { size: 10, bold: true }, 'center');

    ws.getCell('F3').value = 'Kết quả học tập';
    this.styleCell(ws.getCell('F3'), { size: 10, bold: true }, 'center');

    ws.mergeCells('G2:G3');
    ws.getCell('G2').value = 'Tổng số buổi nghỉ học';
    this.styleCell(ws.getCell('G2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('H2:H3');
    ws.getCell('H2').value = 'Được lên lớp';
    this.styleCell(ws.getCell('H2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('I2:I3');
    ws.getCell('I2').value = 'Không được\n lên lớp';
    this.styleCell(ws.getCell('I2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('J2:J3');
    ws.getCell('J2').value = 'Khen thưởng';
    this.styleCell(ws.getCell('J2'), { size: 11, bold: true }, 'center');

    ws.mergeCells('K2:R3');
    ws.getCell('K2').value = 'Tổng hợp chung';
    this.styleCell(ws.getCell('K2'), { size: 11, bold: true }, 'center');

    // Student data
    classInfo.students.forEach((student, index) => {
      const rowNum = index + 4;
      ws.getCell(`A${rowNum}`).value = student.stt;
      ws.getCell(`B${rowNum}`).value = student.hoTen;
      ws.getCell(`C${rowNum}`).value = 'Tốt';
      ws.getCell(`D${rowNum}`).value = 'Tốt';
      ws.getCell(`G${rowNum}`).value = 0;
      ws.getCell(`H${rowNum}`).value = 'Lên lớp';
      ws.getCell(`J${rowNum}`).value = 'HSG';

      // Summary text for first student
      if (index === 0) {
        ws.mergeCells(`K${rowNum}:R${rowNum + classInfo.students.length - 1}`);
        ws.getCell(`K${rowNum}`).value = `\nTổng số học sinh: ${classInfo.siSo || classInfo.students.length}\n\nĐược lên lớp: ${classInfo.siSo || classInfo.students.length}\nTrong đó ... được lên lớp sau khi học tập, rèn luyện thêm trong hè.\n\nKhông được lên lớp: ... \n\n\n\n`;
        ws.getCell(`K${rowNum}`).alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      }

      // Apply borders
      for (let col = 1; col <= 18; col++) {
        const cell = ws.getRow(rowNum).getCell(col);
        this.applyThinBorder(cell);
        cell.font = { name: 'Times New Roman', size: 11 };
        if (col <= 10) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      }
    });

    this.setupPage(ws, `A1:R${classInfo.students.length + 10}`);
  }

  // ==================== 12. NHẬN XÉT HIỆU TRƯỞNG ====================
  private createNhanXetHieuTruongSheet(workbook: ExcelJS.Workbook): void {
    const ws = workbook.addWorksheet('NhanXetCuaHT_CaNam');

    this.setColumnWidths(ws, [8, 2, 30, 2, 2, 2, 2, 2, 2, 20, 2, 2]);

    // Title
    ws.mergeCells('A1:L1');
    ws.getCell('A1').value = 'NHẬN XÉT CỦA HIỆU TRƯỞNG \nVỀ SỬ DỤNG SỔ THEO DÕI VÀ ĐÁNH GIÁ HỌC SINH';
    this.styleCell(ws.getCell('A1'), { size: 14, bold: true }, 'center');

    // Headers
    ws.mergeCells('A3:B3');
    ws.getCell('A3').value = 'Tháng';
    this.styleCell(ws.getCell('A3'), { size: 12, bold: true }, 'center');

    ws.mergeCells('C3:I3');
    ws.getCell('C3').value = 'Nhận xét';
    this.styleCell(ws.getCell('C3'), { size: 12, bold: true }, 'center');

    ws.mergeCells('J3:L3');
    ws.getCell('J3').value = 'Ký tên, đóng dấu';
    this.styleCell(ws.getCell('J3'), { size: 12, bold: true }, 'center');

    // Month rows (1-12)
    for (let month = 1; month <= 12; month++) {
      const rowNum = month + 4;
      ws.mergeCells(`A${rowNum}:B${rowNum}`);
      ws.getCell(`A${rowNum}`).value = month;
      this.styleCell(ws.getCell(`A${rowNum}`), { size: 11 }, 'center');

      ws.mergeCells(`C${rowNum}:I${rowNum}`);
      ws.mergeCells(`J${rowNum}:L${rowNum}`);

      // Apply borders
      for (let col = 1; col <= 12; col++) {
        const cell = ws.getRow(rowNum).getCell(col);
        this.applyThinBorder(cell);
        cell.font = { name: 'Times New Roman', size: 11 };
      }
    }

    this.setupPage(ws, 'A1:L20');
  }

  // ==================== HELPER METHODS ====================

  private setColumnWidths(ws: ExcelJS.Worksheet, widths: number[]): void {
    ws.columns = widths.map(width => ({ width }));
  }

  private styleCell(cell: ExcelJS.Cell, font: { size: number; bold?: boolean; color?: string }, align: 'left' | 'center' | 'right'): void {
    cell.font = {
      name: 'Times New Roman',
      size: font.size,
      bold: font.bold || false,
      color: font.color ? { argb: font.color } : undefined
    };
    cell.alignment = {
      horizontal: align,
      vertical: 'middle',
      wrapText: true
    };
  }

  private applyThinBorder(cell: ExcelJS.Cell): void {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  private setupPage(ws: ExcelJS.Worksheet, printArea: string): void {
    ws.pageSetup.printArea = printArea;
    ws.pageSetup.orientation = 'portrait';
    ws.pageSetup.paperSize = 9; // A4
    ws.pageSetup.fitToPage = true;
    ws.pageSetup.fitToWidth = 1;
    ws.pageSetup.margins = {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    };
  }
  private getColumnName(columnNumber: number): string {
    let columnName = '';
    while (columnNumber > 0) {
        const modulo = (columnNumber - 1) % 26;
        columnName = String.fromCharCode(65 + modulo) + columnName;
        columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return columnName;
    }
}