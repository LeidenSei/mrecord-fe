// good-deeds.component.ts
import { Component, OnInit } from '@angular/core';
import { GoodDeedService } from 'src/app/services/good-deed.service';
import { ClassService } from 'src/app/services/class.service';
import { StudentService } from 'src/app/services/student.service';
import notify from 'devextreme/ui/notify';
import { AuthService } from 'src/app/services';

interface GoodDeed {
  id?: string;
  stt: number;
  date: Date;
  studentName: string;
  title: string;
  recognizedBy: string;
  note?: string;
}

@Component({
  selector: 'app-good-deeds',
  templateUrl: './good-deeds.component.html',
  styleUrls: ['./good-deeds.component.scss']
})
export class GoodDeedsComponent implements OnInit {
  datas: GoodDeed[] = [];
  goodDeedsCount = 0;
  
  // Current user info
  currentSchoolId: string = '';
  currentYearId: number = 0;
  currentPersonId: string = ''; // Thêm personId
  isAdmin: boolean = false; // ✅ THÊM PROPERTY NÀY
  
  // Filter data
  gradeSource: string[] = ['Tất cả'];
  selectedGrade: string = 'Tất cả';
  filterClassSource: any[] = [];
  filterClassId: any = null;
  
  studentSource: any[] = [];

  exportTexts = {
    exportAll: 'Xuất toàn bộ',
    exportSelectedRows: 'Xuất dòng được chọn',
    exportTo: 'Xuất ra'
  };

  constructor(
    private goodDeedService: GoodDeedService,
    private classService: ClassService,
    private studentService: StudentService,
    public authService: AuthService,
  ) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getUser();
    this.currentSchoolId = user.data.schoolId;
    this.currentPersonId = user.data.personId;
    
    this.currentYearId = new Date().getFullYear();
    
    this.isAdmin = user.data.role === 2 || user.data.isBGH;

    if (this.currentSchoolId) {
      await this.loadClassData(user);
    } else {
      notify('Không tìm thấy thông tin trường học', 'warning', 3000);
    }
  }

  async loadClassData(user: any): Promise<void> {
    try {
      let classesResponse: any;
      if (this.isAdmin) {
        classesResponse = await this.classService.getListBySchool(this.currentSchoolId).toPromise();
      } else {
        if (typeof this.classService.getListByTeacher === 'function') {
          classesResponse = await this.classService.getListByTeacher(
            this.currentSchoolId, 
            this.currentPersonId
          ).toPromise();
        } else {
          classesResponse = await this.classService.getListBySchool(this.currentSchoolId).toPromise();
        }
      }
      
      const classes = this.extractData(classesResponse);
      
      if (classes.length === 0) {
        notify('Không tìm thấy lớp học nào', 'warning', 3000);
        return;
      }
      
      const gradeIds = [...new Set(classes.map((c: any) => c.grade).filter((g: any) => g))].sort();
      this.gradeSource = ['Tất cả', ...gradeIds.map((g: number) => `Khối ${g}`)];
      
      this.filterClassSource = [
        { id: null, name: 'Tất cả lớp' },
        ...classes.map((c: any) => ({ 
          id: c.id, 
          name: c.name || c.tenLop || c.className 
        }))
      ];
      if (this.filterClassSource.length > 1) {
        this.filterClassId = this.filterClassSource[1].id;
      }
      
      this.loadStudentData();
    } catch (err) {
      console.error('Error loading classes:', err);
      notify('Lỗi khi tải danh sách lớp', 'error', 3000);
      this.filterClassSource = [{ id: null, name: 'Tất cả lớp' }];
    }
  }

  /**
   * Helper method để extract data từ response
   * Xử lý cả 2 format: { data: [...] } và direct array
   */
  private extractData(response: any): any[] {
    if (!response) return [];
    
    // Nếu response có property data
    if (response.data !== undefined) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    // Nếu response trực tiếp là array
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }

  loadStudentData(): void {
    if (this.filterClassId) {
      // Load students by class
      this.studentService.getListByClass(this.filterClassId).subscribe({
        next: (response) => {
          const data = this.extractData(response);
          this.studentSource = this.mapStudentData(data);
          this.loadGoodDeedsData();
        },
        error: (err) => {
          console.error('Error loading students:', err);
          notify('Lỗi khi tải danh sách học sinh', 'error', 3000);
          this.studentSource = [];
          this.loadGoodDeedsData();
        }
      });
    } else {
      // Load all students in school
      this.studentService.getListBySchool(this.currentSchoolId).subscribe({
        next: (response) => {
          const data = this.extractData(response);
          this.studentSource = this.mapStudentData(data);
          this.loadGoodDeedsData();
        },
        error: (err) => {
          console.error('Error loading students:', err);
          notify('Lỗi khi tải danh sách học sinh', 'error', 3000);
          this.studentSource = [];
          this.loadGoodDeedsData();
        }
      });
    }
  }

  mapStudentData(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    
    return data.map((s: any) => ({
      id: s.id,
      fullName: s.fullName || s.name || `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim(),
      className: s.className || s.class
    }));
  }

  loadGoodDeedsData(): void {
    const gradeNumber = this.getGradeNumber(this.selectedGrade);
    
    this.goodDeedService.getListBySchool(
      this.currentSchoolId,
      this.currentYearId,
      gradeNumber,
      this.filterClassId
    ).subscribe({
      next: (response) => {
        const data = this.extractData(response);
        
        this.datas = data.map((item: any, index: number) => ({
          id: item.id,
          stt: index + 1,
          date: new Date(item.date),
          studentName: item.studentName,
          title: item.title,
          recognizedBy: item.recognizedBy,
          note: item.note
        }));
        this.goodDeedsCount = this.datas.length;
      },
      error: (err) => {
        console.error('Error loading good deeds:', err);
        notify('Lỗi khi tải danh sách hoa việc tốt', 'error', 3000);
        this.datas = [];
        this.goodDeedsCount = 0;
      }
    });
  }

  getGradeNumber(gradeText: string): number | undefined {
    if (gradeText === 'Tất cả') return undefined;
    const match = gradeText.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
  }

  gradeChange(event: any): void {
    this.selectedGrade = event.itemData;
    this.loadGoodDeedsData();
  }

  classChange(event: any): void {
    this.filterClassId = event.itemData.id;
    this.loadStudentData();
  }

  onExporting(event: any): void {
    const gradeNumber = this.getGradeNumber(this.selectedGrade);
    
    this.goodDeedService.exportExcel(
      this.currentSchoolId,
      this.currentYearId,
      gradeNumber,
      this.filterClassId
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HoaViecTot_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        notify('Xuất file thành công', 'success', 3000);
      },
      error: (err) => {
        console.error('Error exporting:', err);
        notify('Lỗi khi xuất file', 'error', 3000);
      }
    });
  }

  onRowUpdating(event: any): void {
    const updatedData = {
      id: event.key.id || event.key,
      studentName: event.newData.studentName || event.oldData.studentName,
      date: event.newData.date || event.oldData.date,
      title: event.newData.title || event.oldData.title,
      recognizedBy: event.newData.recognizedBy || event.oldData.recognizedBy,
      note: event.newData.note || event.oldData.note
    };
    
    this.goodDeedService.update(updatedData).subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify('Cập nhật thành công', 'success', 3000);
          this.loadGoodDeedsData();
        } else {
          notify(response.message || 'Cập nhật thất bại', 'error', 3000);
          event.cancel = true;
        }
      },
      error: (err) => {
        console.error('Error updating:', err);
        notify('Lỗi khi cập nhật', 'error', 3000);
        event.cancel = true;
      }
    });
  }

  onRowInserting(event: any): void {
    if (!this.filterClassId) {
      notify('Vui lòng chọn lớp học trước khi thêm mới', 'warning', 3000);
      event.cancel = true;
      return;
    }

    const newData = {
      studentName: event.data.studentName,
      date: event.data.date || new Date(),
      title: event.data.title,
      recognizedBy: event.data.recognizedBy || 'Giáo viên chủ nhiệm',
      classId: this.filterClassId,
      note: event.data.note || ''
    };
    
    this.goodDeedService.create(newData).subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify('Thêm mới thành công', 'success', 3000);
          this.loadGoodDeedsData();
        } else {
          notify(response.message || 'Thêm mới thất bại', 'error', 3000);
          event.cancel = true;
        }
      },
      error: (err) => {
        console.error('Error creating:', err);
        notify('Lỗi khi thêm mới', 'error', 3000);
        event.cancel = true;
      }
    });
  }

  onRowRemoving(event: any): void {
    const id = event.key.id || event.key;
    
    this.goodDeedService.delete(id).subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify('Xóa thành công', 'success', 3000);
          this.loadGoodDeedsData();
        } else {
          notify(response.message || 'Xóa thất bại', 'error', 3000);
          event.cancel = true;
        }
      },
      error: (err) => {
        console.error('Error deleting:', err);
        notify('Lỗi khi xóa', 'error', 3000);
        event.cancel = true;
      }
    });
  }
}