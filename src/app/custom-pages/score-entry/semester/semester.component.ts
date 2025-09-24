import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../services';
import { GeneralService } from '../../../services/general.service';

export interface SemesterStudent {
  id: number;
  name: string;
  achievement: string; // 'T', 'H', 'C', or ''
  commentCode: string;
  content: string;
}

@Component({
  selector: 'app-semester',
  templateUrl: './semester.component.html',
  styleUrls: ['./semester.component.scss']
})
export class SemesterComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  // Filter properties
  selectedSemester: string = '1';
  selectedGrade: string = '5';
  selectedClass: string = '5B';
  selectedSubject: string = '';
  selectedPeriod: string = '';
  
  // Data properties
  studentList: SemesterStudent[] = [];
  emptyRows: number[] = [];
  
  // Loading state
  loading: boolean = false;
  
  userData: any;

  constructor(
    private authService: AuthService,
    private generalService: GeneralService
  ) {}

  async ngOnInit() {
    this.userData = await this.authService.getUser();
    await this.loadStudentData();
    this.generateEmptyRows();
  }

  async loadStudentData() {
    try {
      this.loading = true;
      
      // Mock data for semester evaluation
      this.studentList = [
        {
          id: 1,
          name: 'Nguyễn Văn An',
          achievement: 'T',
          commentCode: 'A1',
          content: 'Em có khả năng tiếp thu kiến thức tốt, tích cực tham gia các hoạt động học tập.'
        },
        {
          id: 2,
          name: 'Trần Thị Bình',
          achievement: 'H',
          commentCode: 'B2',
          content: 'Em học tập khá, cần cải thiện thêm về khả năng tự học.'
        },
        {
          id: 3,
          name: 'Lê Văn Cường',
          achievement: 'C',
          commentCode: 'C1',
          content: 'Em cần nỗ lực hơn trong việc học tập và hoàn thành bài tập.'
        }
      ];
      
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      this.loading = false;
    }
  }

  generateEmptyRows() {
    // Generate empty rows to fill the table (total 10 rows)
    const totalRows = 10;
    const emptyRowCount = Math.max(0, totalRows - this.studentList.length);
    this.emptyRows = Array(emptyRowCount).fill(0).map((_, i) => i);
  }

  // Filter event handlers
  onSemesterChanged(event?: any) {
    console.log('Semester changed to:', this.selectedSemester);
    this.loadStudentData();
  }

  onGradeChanged(event?: any) {
    console.log('Grade changed to:', this.selectedGrade);
    this.loadStudentData();
  }

  onClassChanged(event?: any) {
    console.log('Class changed to:', this.selectedClass);
    this.loadStudentData();
  }

  onSubjectChanged(event?: any) {
    console.log('Subject changed to:', this.selectedSubject);
    this.loadStudentData();
  }

  onPeriodChanged(event?: any) {
    console.log('Period changed to:', this.selectedPeriod);
    this.loadStudentData();
  }

  // Data interaction handlers
  onAchievementChanged(student: SemesterStudent) {
    console.log(`Achievement changed for ${student.name}:`, student.achievement);
    // Auto-generate comment code based on achievement
    this.generateCommentCode(student);
  }

  generateCommentCode(student: SemesterStudent) {
    if (student.achievement) {
      // Simple logic to generate comment code
      const codes = {
        'T': ['T1', 'T2', 'T3'],
        'H': ['H1', 'H2', 'H3'],
        'C': ['C1', 'C2', 'C3']
      };
      
      const possibleCodes = codes[student.achievement as keyof typeof codes];
      if (possibleCodes) {
        // Use student ID to determine which code to use
        const codeIndex = (student.id - 1) % possibleCodes.length;
        student.commentCode = possibleCodes[codeIndex];
      }
    } else {
      student.commentCode = '';
    }
  }

  onCommentCodeFocus(student: SemesterStudent) {
    console.log(`Comment code focused for ${student.name}`);
  }

  onContentFocus(student: SemesterStudent) {
    console.log(`Content focused for ${student.name}`);
  }

  // Action handlers
  updateData() {
    console.log('Update data clicked');
    console.log('Current filters:', {
      semester: this.selectedSemester,
      grade: this.selectedGrade,
      class: this.selectedClass,
      subject: this.selectedSubject,
      period: this.selectedPeriod
    });
    
    this.loadStudentData();
    alert('Đã cập nhật dữ liệu!');
  }

  chooseFile() {
    console.log('Choose file clicked');
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file.name);
      this.processFile(file);
    }
  }

  private processFile(file: File) {
    console.log('Processing file:', file.name);
    
    // Mock file processing
    const reader = new FileReader();
    reader.onload = (e: any) => {
      console.log('File content loaded');
      // Here you would parse the file content and update studentList
      alert('Đã tải file thành công!');
      this.loadStudentData();
    };
    
    reader.readAsText(file);
  }

  // Utility methods
  exportToExcel() {
    const exportData = this.studentList.map((student, index) => ({
      'STT': index + 1,
      'Họ và tên': student.name,
      'Mức đạt được': student.achievement,
      'Mã nhận xét': student.commentCode,
      'Nội dung': student.content
    }));
    
    console.log('Exporting data:', exportData);
    alert('Đã xuất file Excel thành công!');
  }

  clearAllData() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu đánh giá?')) {
      this.studentList.forEach(student => {
        student.achievement = '';
        student.commentCode = '';
        student.content = '';
      });
      alert('Đã xóa tất cả dữ liệu!');
    }
  }
}