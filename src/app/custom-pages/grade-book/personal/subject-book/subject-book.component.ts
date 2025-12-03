import { Component, OnInit } from '@angular/core';
import { ClassData, SubjectBookExportFullService, TeacherInfo } from 'src/app/services/subject-book-export.service';
import { AuthService, IUser } from 'src/app/services/auth.service';
import { TeacherSubject, Teacher, SchoolBookService, SubjectBookExportData } from 'src/app/services/school-book-service.service';

@Component({
  selector: 'app-subject-book',
  templateUrl: './subject-book.component.html',
  styleUrls: ['./subject-book.component.scss']
})
export class SubjectBookComponent implements OnInit {
  
  // Thông tin giáo viên và trường
  teacherInfo: TeacherInfo = {
    truong: '',
    phuongXa: '',
    tinhTP: '',
    hoTenGV: '',
    monHoc: '',
    hocKy: 'HỌC KỲ I',
    namHoc: ''
  };

  // Danh sách các lớp
  classes: ClassData[] = [];
  
  // Danh sách môn học của giáo viên
  subjects: TeacherSubject[] = [];
  
  // Danh sách giáo viên (cho Admin)
  teachers: Teacher[] = [];
  
  // Môn học đã chọn
  selectedSubjectId: string = '';
  
  // Giáo viên đã chọn (cho Admin)
  selectedTeacherId: string = '';
  
  // Học kỳ (1 hoặc 2)
  selectedTerm: number = 1;
  
  // Năm học (optional - mặc định lấy từ backend)
  selectedSchoolYear?: number;
  
  // Kiểm tra có phải Admin/Hiệu trưởng không
  isAdmin: boolean = false;
  
  // User hiện tại
  currentUser: IUser | null = null;
  
  // Trạng thái loading
  isLoading = false;
  isLoadingSubjects = false;
  isLoadingTeachers = false;

  constructor(
    private schoolBookService: SchoolBookService, // ← Đổi tên service
    private exportService: SubjectBookExportFullService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Kiểm tra role của user
    await this.checkUserRole();
    
    // Nếu là Admin -> load danh sách giáo viên
    if (this.isAdmin) {
      this.loadTeachers();
    } else {
      // Nếu là giáo viên thường -> load luôn môn học của mình
      this.loadTeacherSubjects();
    }
  }

  /**
   * Kiểm tra role của user hiện tại
   * Cho phép: SystemAdmin (1), SchoolAdmin (2), SchoolManager/BGH (9)
   */
  async checkUserRole(): Promise<void> {
    const result = await this.authService.getUser();
    
    if (result.isOk && result.data) {
      this.currentUser = result.data;
      
      // Kiểm tra role: SystemAdmin, SchoolAdmin, SchoolManager hoặc isBGH
      this.isAdmin = this.currentUser.role === 1 ||  // SystemAdmin
                     this.currentUser.role === 2 ||  // SchoolAdmin
                     this.currentUser.role === 9 ||  // SchoolManager (BGH)
                     this.currentUser.isBGH === true; // Hoặc có flag isBGH
      
      console.log('Current user:', this.currentUser);
      console.log('Is Admin/BGH:', this.isAdmin);
    }
  }

  /**
   * Load danh sách giáo viên (chỉ cho Admin)
   */
  loadTeachers(): void {
    this.isLoadingTeachers = true;
    
    this.schoolBookService.getTeachers() // ← Dùng service mới
      .subscribe({
        next: (teachers) => {
          this.teachers = teachers;
          this.isLoadingTeachers = false;
        },
        error: (error) => {
          console.error('Lỗi khi load giáo viên:', error);
          
          // Xử lý lỗi 403 (không có quyền)
          if (error.status === 403) {
            alert('Bạn không có quyền xem danh sách giáo viên!');
            this.isAdmin = false; // Reset lại flag
          } else {
            alert('Không thể tải danh sách giáo viên. Vui lòng thử lại!');
          }
          
          this.isLoadingTeachers = false;
        }
      });
  }

  /**
   * Load danh sách môn học mà giáo viên đang dạy
   */
  loadTeacherSubjects(): void {
    this.isLoadingSubjects = true;
    
    // Nếu là admin và đã chọn giáo viên -> truyền teacherId
    const teacherId = this.isAdmin ? this.selectedTeacherId : undefined;
    
    this.schoolBookService.getTeacherSubjects(teacherId) // ← Dùng service mới
      .subscribe({
        next: (subjects) => {
          this.subjects = subjects;
          
          // Reset môn học đã chọn khi load danh sách mới
          this.selectedSubjectId = '';
          
          this.isLoadingSubjects = false;
        },
        error: (error) => {
          console.error('Lỗi khi load môn học:', error);
          alert('Không thể tải danh sách môn học. Vui lòng thử lại!');
          this.isLoadingSubjects = false;
        }
      });
  }

  /**
   * Khi Admin chọn giáo viên khác
   */
  onTeacherChange(): void {
    // Reset dữ liệu cũ
    this.selectedSubjectId = '';
    this.subjects = [];
    this.classes = [];
    this.resetTeacherInfo();
    
    // Load lại môn học của giáo viên mới
    if (this.selectedTeacherId) {
      this.loadTeacherSubjects();
    }
  }

  /**
   * Khi thay đổi môn học
   */
  onSubjectChange(): void {
    if (this.selectedSubjectId) {
      this.loadData();
    }
  }

  /**
   * Khi thay đổi học kỳ
   */
  onTermChange(): void {
    if (this.selectedSubjectId) {
      this.loadData();
    }
  }

  /**
   * Load dữ liệu từ API
   */
  async loadData(): Promise<void> {
    if (!this.selectedSubjectId) {
      alert('Vui lòng chọn môn học!');
      return;
    }

    this.isLoading = true;

    try {
      // Nếu là admin và đã chọn giáo viên -> truyền teacherId
      const teacherId = this.isAdmin && this.selectedTeacherId ? this.selectedTeacherId : undefined;

      // 1. Load danh sách lớp và học sinh
      const data = await this.schoolBookService.getSubjectBookData(
        this.selectedSubjectId,
        this.selectedSchoolYear,
        this.selectedTerm,
        teacherId
      ).toPromise();

      if (!data) {
        throw new Error('Không có dữ liệu trả về');
      }

      this.teacherInfo = data.teacherInfo;
      this.classes = data.classes;

      console.log('Đã load dữ liệu lớp:', data);

      // 2. Load điểm cho từng lớp
      if (this.classes.length > 0) {
        await this.loadMarksForAllClasses();
      }

      this.isLoading = false;
      console.log('Hoàn thành load điểm cho tất cả lớp');

    } catch (error: any) {
      console.error('Lỗi khi load dữ liệu:', error);

      // Xử lý lỗi 403
      if (error.status === 403) {
        alert('Bạn không có quyền xem sổ điểm của giáo viên này!');
      } else {
        alert('Không thể tải dữ liệu. Vui lòng thử lại!');
      }

      this.isLoading = false;
    }
  }

  /**
   * Load điểm cho tất cả lớp
   */
  async loadMarksForAllClasses(): Promise<void> {
    for (const classData of this.classes) {
      try {
        // Gọi API lấy điểm
        const marks = await this.schoolBookService.getListMarkByClass(
          classData.classId,
          this.selectedTerm,
          this.selectedSubjectId
        ).toPromise();

        if (marks && marks.length > 0) {
          // Merge điểm vào danh sách học sinh
          this.mergeMarksToStudents(classData, marks);
        }

        console.log(`Đã load điểm cho lớp ${classData.tenLop}:`, marks);
      } catch (error) {
        console.error(`Lỗi khi load điểm lớp ${classData.tenLop}:`, error);
        // Tiếp tục load lớp khác nếu có lỗi
      }
    }
  }

  /**
   * Merge điểm từ MarkResponse vào StudentInfo
   */
  mergeMarksToStudents(classData: ClassData, marks: any[]): void {
    classData.students.forEach(student => {
      // Tìm điểm của học sinh này theo mã học sinh
      const mark = marks.find(m => m.studentCode === student.maHocSinh);

      if (mark) {
        student.score151 = mark.score151;
        student.score152 = mark.score152;
        student.score153 = mark.score153;
        student.score154 = mark.score154;
        student.score155 = mark.score155;
        student.score4510 = mark.score4510;
        student.finalExamScore = mark.finalExamScore;
        student.averageTerm1 = mark.averageTerm1;
        student.averageTerm2 = mark.averageTerm2;
        student.averageYear = mark.averageYear;
      }
    });
  }

  /**
   * Xuất file Excel hoàn chỉnh
   */
  async exportComplete(): Promise<void> {
    if (this.classes.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    try {
      this.isLoading = true;
      
      await this.exportService.exportCompleteBook(this.teacherInfo, this.classes);
      
      console.log('Xuất file thành công!');
      alert('Xuất file Excel thành công!');
      
    } catch (error) {
      console.error('Lỗi khi xuất file:', error);
      alert('Có lỗi xảy ra khi xuất file. Vui lòng thử lại!');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Thêm lớp mới (không cần thiết nữa vì đã lấy từ API)
   */
  addClass(): void {
    alert('Danh sách lớp được lấy tự động từ hệ thống!');
  }

  /**
   * Xóa lớp
   */
  removeClass(index: number): void {
    if (confirm('Bạn có chắc muốn xóa lớp này khỏi danh sách xuất?')) {
      this.classes.splice(index, 1);
    }
  }

  /**
   * Reset thông tin giáo viên
   */
  resetTeacherInfo(): void {
    this.teacherInfo = {
      truong: '',
      phuongXa: '',
      tinhTP: '',
      hoTenGV: '',
      monHoc: '',
      hocKy: 'HỌC KỲ I',
      namHoc: ''
    };
  }

  /**
   * Tính tổng số học sinh
   */
  getTotalStudents(): number {
    return this.classes.reduce((total, classData) => total + classData.students.length, 0);
  }
}