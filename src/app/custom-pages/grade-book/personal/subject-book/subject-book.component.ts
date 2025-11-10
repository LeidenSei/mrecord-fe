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
  loadData(): void {
    if (!this.selectedSubjectId) {
      alert('Vui lòng chọn môn học!');
      return;
    }

    this.isLoading = true;
    
    // Nếu là admin và đã chọn giáo viên -> truyền teacherId
    const teacherId = this.isAdmin && this.selectedTeacherId ? this.selectedTeacherId : undefined;
    
    this.schoolBookService.getSubjectBookData( // ← Đổi tên method
      this.selectedSubjectId,
      this.selectedSchoolYear,
      this.selectedTerm,
      teacherId
    ).subscribe({
      next: (data: SubjectBookExportData) => {
        this.teacherInfo = data.teacherInfo;
        this.classes = data.classes;
        this.isLoading = false;
        
        console.log('Đã load dữ liệu thành công:', data);
      },
      error: (error) => {
        console.error('Lỗi khi load dữ liệu:', error);
        
        // Xử lý lỗi 403
        if (error.status === 403) {
          alert('Bạn không có quyền xem sổ điểm của giáo viên này!');
        } else {
          alert('Không thể tải dữ liệu. Vui lòng thử lại!');
        }
        
        this.isLoading = false;
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