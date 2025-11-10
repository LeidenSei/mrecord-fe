import { Component, OnInit } from '@angular/core';
import { AuthService, IUser } from 'src/app/services/auth.service';
import { ClassBookExportData, ClassDto, SchoolBookService } from 'src/app/services/school-book-service.service';

@Component({
  selector: 'app-class-book',
  templateUrl: './class-book.component.html',
  styleUrls: ['./class-book.component.scss']
})
export class ClassBookComponent implements OnInit {
  
  // Danh sách lớp học
  classes: ClassDto[] = [];
  
  // Lớp học đã chọn
  selectedClassId: string = '';
  
  // Học kỳ (1 hoặc 2)
  selectedTerm: number = 1;
  
  // Năm học (mặc định là năm hiện tại)
  selectedSchoolYear: number = new Date().getFullYear();
  
  // Dữ liệu preview
  previewData: ClassBookExportData | null = null;  // ← Đổi tên type
  
  // Kiểm tra có phải Admin/Hiệu trưởng không
  isAdmin: boolean = false;
  
  // User hiện tại
  currentUser: IUser | null = null;
  
  // Trạng thái loading
  isLoading = false;
  isLoadingClasses = false;
  isLoadingPreview = false;
  isExporting = false;

  constructor(
    private schoolBookService: SchoolBookService,  // ← Đổi tên service
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Kiểm tra role của user
    await this.checkUserRole();
    
    // Load danh sách lớp
    this.loadClasses();
  }

  /**
   * Kiểm tra role của user hiện tại
   */
  async checkUserRole(): Promise<void> {
    const result = await this.authService.getUser();
    
    if (result.isOk && result.data) {
      this.currentUser = result.data;
      
      // Admin/BGH được xem tất cả lớp, GVCN chỉ xem lớp của mình
      this.isAdmin = this.currentUser.role === 1 ||  // SystemAdmin
                     this.currentUser.role === 2 ||  // SchoolAdmin
                     this.currentUser.role === 9 ||  // SchoolManager (BGH)
                     this.currentUser.isBGH === true;
      
      console.log('Current user:', this.currentUser);
      console.log('Is Admin/BGH:', this.isAdmin);
    }
  }

  /**
   * Load danh sách lớp học
   */
  loadClasses(): void {
    this.isLoadingClasses = true;
    
    // TODO: Cần thêm endpoint getClasses() vào SchoolBookService
    // hoặc sử dụng service khác để lấy danh sách lớp
    
    // Tạm thời comment lại cho đến khi có endpoint
    /*
    this.schoolBookService.getClasses()
      .subscribe({
        next: (classes) => {
          this.classes = classes;
          this.isLoadingClasses = false;
        },
        error: (error) => {
          console.error('Lỗi khi load danh sách lớp:', error);
          
          if (error.status === 403) {
            alert('Bạn không có quyền xem danh sách lớp!');
          } else {
            alert('Không thể tải danh sách lớp. Vui lòng thử lại!');
          }
          
          this.isLoadingClasses = false;
        }
      });
    */
    
    console.warn('TODO: Implement getClasses() endpoint');
    this.isLoadingClasses = false;
  }

  /**
   * Khi thay đổi lớp học
   */
  onClassChange(): void {
    this.previewData = null;
    
    if (this.selectedClassId) {
      this.loadPreview();
    }
  }

  /**
   * Khi thay đổi học kỳ
   */
  onTermChange(): void {
    if (this.selectedClassId) {
      this.loadPreview();
    }
  }

  /**
   * Khi thay đổi năm học
   */
  onSchoolYearChange(): void {
    if (this.selectedClassId) {
      this.loadPreview();
    }
  }

  /**
   * Load preview data
   */
  loadPreview(): void {
    if (!this.selectedClassId) {
      alert('Vui lòng chọn lớp học!');
      return;
    }

    this.isLoadingPreview = true;
    
    this.schoolBookService.getClassBookData(  // ← Sử dụng method mới
      this.selectedClassId,
      this.selectedSchoolYear,
      this.selectedTerm
    ).subscribe({
      next: (data: ClassBookExportData) => {
        this.previewData = data;
        this.isLoadingPreview = false;
        
        console.log('Đã load preview thành công:', data);
      },
      error: (error) => {
        console.error('Lỗi khi load preview:', error);
        
        if (error.status === 403) {
          alert('Bạn không có quyền xem sổ gọi tên của lớp này!');
        } else if (error.status === 404) {
          alert('Không tìm thấy thông tin lớp học!');
        } else {
          alert('Không thể tải dữ liệu. Vui lòng thử lại!');
        }
        
        this.isLoadingPreview = false;
      }
    });
  }

  /**
   * Xuất file Excel (frontend xử lý bằng ExcelJS)
   */
  async exportClassBook(): Promise<void> {
    if (!this.selectedClassId) {
      alert('Vui lòng chọn lớp học!');
      return;
    }

    if (!this.previewData) {
      alert('Vui lòng load dữ liệu trước khi export!');
      return;
    }

    try {
      this.isExporting = true;

      // TODO: Implement export logic using ExcelJS
      // Bạn có thể tạo một service riêng cho việc export Excel
      // Tương tự như SubjectBookExportFullService
      
      console.log('Export data:', this.previewData);
      
      // Tạm thời alert
      alert('Chức năng export đang được phát triển!');

    } catch (error) {
      console.error('Lỗi khi export:', error);
      alert('Có lỗi xảy ra khi xuất file. Vui lòng thử lại!');
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Reset form
   */
  reset(): void {
    this.selectedClassId = '';
    this.selectedTerm = 1;
    this.selectedSchoolYear = new Date().getFullYear();
    this.previewData = null;
  }

  /**
   * Format số thứ tự
   */
  formatStt(stt: number): string {
    return stt < 10 ? `0${stt}` : `${stt}`;
  }
}