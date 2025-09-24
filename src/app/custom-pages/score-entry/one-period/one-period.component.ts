import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services';
import { GeneralService } from '../../../services/general.service';

export interface Student {
  id: number;
  name: string;
  selected: boolean;
  subjectComment: string;
  regularComment: string;
  abilityComment: string;
  qualityComment: string;
  status: 'not-sent' | 'sent' | 'active'; 
}

@Component({
  selector: 'app-one-period',
  templateUrl: './one-period.component.html',
  styleUrls: ['./one-period.component.scss']
})
export class OnePeriodComponent implements OnInit {
  // Filter properties
  selectedClass: string = '5B';
  selectedMonth: string = '7/2025';

  studentList: Student[] = [];
  selectAll: boolean = false;

  loading: boolean = false;
  
  userData: any;

  constructor(
    private authService: AuthService,
    private generalService: GeneralService
  ) {}

  async ngOnInit() {
    this.userData = await this.authService.getUser();
    await this.loadStudentData();
  }

  async loadStudentData() {
    try {
      this.loading = true;

      this.studentList = [
        {
          id: 1,
          name: 'Nguyễn Xuân Trường',
          selected: false,
          subjectComment: '',
          regularComment: '',
          abilityComment: '',
          qualityComment: '',
          status: 'not-sent'
        },
        {
          id: 2,
          name: 'Nguyễn Lam Anh',
          selected: false,
          subjectComment: 'Em có khả năng tiếp thu tốt các môn học',
          regularComment: 'Năng lực chung ở mức khá',
          abilityComment: 'Đặc biệt giỏi môn Toán',
          qualityComment: 'Em có ý thức học tập tốt',
          status: 'sent'
        },
        {
          id: 3,
          name: 'Nguyễn Tùng Lâm',
          selected: false,
          subjectComment: 'Cần cố gắng hơn trong các môn học',
          regularComment: 'Năng lực chung trung bình',
          abilityComment: 'Yêu thích môn Thể dục',
          qualityComment: 'Em cần rèn luyện thêm tính kiên trì',
          status: 'active'
        },
        {
          id: 4,
          name: 'Nguyễn Hoàng Trúc Linh',
          selected: false,
          subjectComment: 'Em học tập chăm chỉ và có tiến bộ',
          regularComment: 'Năng lực chung tốt',
          abilityComment: 'Giỏi môn Văn và Sử',
          qualityComment: 'Em có phẩm chất tốt, thân thiện với bạn bè',
          status: 'sent'
        }
      ];
      
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      this.loading = false;
    }
  }

  onClassChanged() {
    this.loadStudentData();
  }

  onMonthChanged() {
    this.loadStudentData();
  }

  toggleSelectAll() {
    this.studentList.forEach(student => {
      student.selected = this.selectAll;
    });
  }

  onCellFocus(studentId: number, field: string) {
  }

  sendNotification() {
    const selectedStudents = this.studentList.filter(s => s.selected);
    if (selectedStudents.length === 0) {
      alert('Vui lòng chọn ít nhất một học sinh để gửi thông tin!');
      return;
    }
    
    console.log('Sending notifications to:', selectedStudents);
    alert(`Đã gửi thông tin đến ${selectedStudents.length} học sinh!`);
    
    selectedStudents.forEach(student => {
      student.status = 'sent';
      student.selected = false;
    });
    this.selectAll = false;
  }

  importData() {
    console.log('Import/Export data clicked');
    // Implement import/export logic
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.csv';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        console.log('Selected file:', file.name);
        // Implement file processing logic
        this.processImportFile(file);
      }
    };
    fileInput.click();
  }

  private processImportFile(file: File) {
    alert('Đã nhập dữ liệu thành công!');
    this.loadStudentData();
  }

  generateTemplate() {
    alert('Đã tạo mẫu nhận xét thành công!');
  }

  saveComments() {
    const hasEmptyComments = this.studentList.some(student => 
      !student.subjectComment.trim() && student.selected
    );
    
    if (hasEmptyComments) {
      alert('Vui lòng điền đầy đủ nhận xét cho các học sinh đã chọn!');
      return;
    }

    const dataToSave = this.studentList.map(student => ({
      id: student.id,
      name: student.name,
      comments: {
        subject: student.subjectComment,
        regular: student.regularComment,
        ability: student.abilityComment,
        quality: student.qualityComment
      },
      class: this.selectedClass,
      month: this.selectedMonth
    }));
    
    console.log('Data to save:', dataToSave);
    setTimeout(() => {
      alert('Đã lưu nhận xét thành công!');
    }, 500);
  }

  exportToExcel() {
    const exportData = this.studentList.map(student => ({
      'STT': this.studentList.indexOf(student) + 1,
      'Tên học sinh': student.name,
      'Môn học và hoạt động giáo dục': student.subjectComment,
      'Nhận xét năng lực chung': student.regularComment,
      'Năng lực đặc thù': student.abilityComment,
      'Nhận xét phẩm chất chủ yếu': student.qualityComment
    }));
    
    alert('Đã xuất file Excel thành công!');
  }
}