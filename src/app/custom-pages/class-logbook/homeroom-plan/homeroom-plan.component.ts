
// homeroom-plan.component.ts
import { Component, OnInit } from '@angular/core';

interface HomeroomPlan {
  id?: number;
  stt: number;
  schoolYear: string;
  semester: string;
  className: string;
  teacherName: string;
  planDate: Date;
  
  // A. Tình hình chung
  advantages: string;
  difficulties: string;
  
  // B. Kế hoạch giáo dục
  // 1. Truyền thống - đạo đức - lối sống
  tradition_objectives: string;
  tradition_content: string;
  tradition_solutions: string;
  tradition_expected_results: string;
  
  // 2. Học tập
  academic_objectives: string;
  academic_content: string;
  academic_solutions: string;
  academic_expected_results: string;
  
  // 3. Các mặt giáo dục ngoại khóa
  extracurricular_objectives: string;
  extracurricular_content: string;
  extracurricular_solutions: string;
  extracurricular_expected_results: string;
  
  // Thông tin bổ sung
  status: string;
  approvedBy?: string;
  notes?: string;
}

@Component({
  selector: 'app-homeroom-plan',
  templateUrl: './homeroom-plan.component.html',
  styleUrls: ['./homeroom-plan.component.scss']
})
export class HomeroomPlanComponent implements OnInit {
  datas: HomeroomPlan[] = [];
  plansCount = 0;
  
  // Filter data
  schoolYearSource = ['Tất cả', '2024-2025', '2023-2024', '2022-2023'];
  semesterSource = [
    { value: '', name: 'Tất cả' },
    { value: '1', name: 'Học kỳ I' },
    { value: '2', name: 'Học kỳ II' }
  ];
  selectedSemester = '';
  
  filterClassSource: any[] = [];
  filterClassId: any = null;
  
  // Lookup data
  classSource: any[] = [];
  statusSource = [
    { value: 'draft', name: 'Bản nháp' },
    { value: 'submitted', name: 'Đã nộp' },
    { value: 'approved', name: 'Đã duyệt' },
    { value: 'rejected', name: 'Cần sửa' }
  ];

  exportTexts = {
    exportAll: 'Xuất toàn bộ',
    exportSelectedRows: 'Xuất dòng được chọn',
    exportTo: 'Xuất ra'
  };

  constructor() { }

  ngOnInit(): void {
    this.loadClassData();
    this.loadPlanData();
  }

  loadClassData(): void {
    this.filterClassSource = [
      { id: null, name: 'Tất cả lớp' },
      { id: 1, name: '6A1' },
      { id: 2, name: '6A2' },
      { id: 3, name: '7A1' },
      { id: 4, name: '7A2' }
    ];
    
    this.classSource = [
      { name: '6A1' },
      { name: '6A2' },
      { name: '7A1' },
      { name: '7A2' }
    ];
    
    this.filterClassId = null;
  }

  loadPlanData(): void {
    this.datas = [
      {
        id: 1,
        stt: 1,
        schoolYear: '2024-2025',
        semester: '1',
        className: '6A1',
        teacherName: 'Cô Nguyễn Thị Lan',
        planDate: new Date('2024-08-15'),
        
        advantages: 'Học sinh có ý thức học tập tốt, tham gia tích cực các hoạt động lớp. Phụ huynh quan tâm, hỗ trợ công tác giáo dục. Cơ sở vật chất lớp học đầy đủ.',
        difficulties: 'Một số học sinh còn chưa có ý thức tự giác trong học tập. Tình hình gia đình một số em còn khó khăn ảnh hưởng đến việc học.',
        
        tradition_objectives: 'Giáo dục học sinh có lòng yêu nước, tôn trọng truyền thống dân tộc, có đạo đức tốt, lối sống lành mạnh.',
        tradition_content: 'Giáo dục truyền thống văn hóa dân tộc, lịch sử anh hùng, đạo đức "Tôn sư trọng đạo", lối sống "Uống nước nhớ nguồn".',
        tradition_solutions: 'Tổ chức các buổi sinh hoạt lớp về truyền thống, mời cựu học sinh về chia sẻ, tham quan bảo tàng lịch sử.',
        tradition_expected_results: 'Học sinh hiểu và tự hào về truyền thống dân tộc, có hành vi ứng xử văn minh, lịch sự.',
        
        academic_objectives: 'Nâng cao chất lượng học tập, đạt tỷ lệ học sinh khá giỏi trên 80%, không có học sinh yếu kém.',
        academic_content: 'Hướng dẫn phương pháp học tập hiệu quả, tổ chức học nhóm, ôn thi cuối kỳ.',
        academic_solutions: 'Thành lập tổ học tập, học sinh giỏi hỗ trợ học sinh yếu, tăng cường liên hệ với giáo viên bộ môn.',
        academic_expected_results: 'Tỷ lệ học sinh khá giỏi đạt 85%, không có học sinh xếp loại yếu kém.',
        
        extracurricular_objectives: 'Phát triển toàn diện nhân cách học sinh qua các hoạt động ngoại khóa phong phú.',
        extracurricular_content: 'Tổ chức các câu lạc bộ thể thao, văn nghệ, tham gia các cuộc thi học sinh giỏi.',
        extracurricular_solutions: 'Phối hợp với đoàn thanh niên, ban phụ huynh tổ chức các hoạt động ngoại khóa hấp dẫn.',
        extracurricular_expected_results: 'Học sinh tích cực tham gia hoạt động, phát triển tài năng cá nhân, có tinh thần đoàn kết.',
        
        status: 'approved',
        approvedBy: 'Hiệu trưởng Nguyễn Văn Hùng',
        notes: 'Kế hoạch phù hợp với thực tế lớp học'
      },
      {
        id: 2,
        stt: 2,
        schoolYear: '2024-2025',
        semester: '2',
        className: '6A1',
        teacherName: 'Cô Nguyễn Thị Lan',
        planDate: new Date('2024-12-20'),
        
        advantages: 'Học sinh đã quen với môi trường học tập, có tiến bộ rõ rệt về ý thức kỷ luật.',
        difficulties: 'Học kỳ 2 có nhiều hoạt động nên học sinh dễ phân tán. Thời tiết nóng ảnh hưởng đến sức khỏe.',
        
        tradition_objectives: 'Củng cố và phát triển các giá trị đạo đức đã hình thành ở học kỳ 1.',
        tradition_content: 'Giáo dục lòng biết ơn, tinh thần trách nhiệm với gia đình và xã hội.',
        tradition_solutions: 'Tổ chức ngày "Tri ân thầy cô", hoạt động từ thiện, thăm các gia đình có hoàn cảnh khó khăn.',
        tradition_expected_results: 'Học sinh có lòng biết ơn, tinh thần trách nhiệm cao hơn.',
        
        academic_objectives: 'Duy trì và nâng cao chất lượng học tập, chuẩn bị tốt cho kỳ thi cuối năm.',
        academic_content: 'Ôn tập hệ thống kiến thức, rèn luyện kỹ năng làm bài thi.',
        academic_solutions: 'Tăng cường ôn tập, tổ chức thi thử, phân loại học sinh để có phương pháp hỗ trợ phù hợp.',
        academic_expected_results: 'Kết quả thi cuối năm đạt 90% học sinh khá giỏi.',
        
        extracurricular_objectives: 'Tạo sân chơi lành mạnh cho học sinh trong thời gian nghỉ hè.',
        extracurricular_content: 'Tổ chức hoạt động hè, tham gia các cuộc thi sáng tạo khoa học kỹ thuật.',
        extracurricular_solutions: 'Phối hợp với gia đình lập kế hoạch hoạt động hè bổ ích.',
        extracurricular_expected_results: 'Học sinh có kỳ nghỉ hè bổ ích, an toàn.',
        
        status: 'submitted',
        approvedBy: '',
        notes: 'Chờ duyệt từ ban giám hiệu'
      }
    ];
    
    this.plansCount = this.datas.length;
  }

  schoolYearChange(event: any): void {
    console.log('School year changed:', event);
  }

  semesterChange(event: any): void {
    this.selectedSemester = event.itemData.value;
    console.log('Semester changed:', event.itemData);
  }

  classChange(event: any): void {
    this.filterClassId = event.itemData.id;
    console.log('Class changed:', event.itemData);
  }

  onExporting(event: any): void {
    console.log('Exporting data');
  }

  onRowUpdating(event: any): void {
    console.log('Updating row:', event);
  }

  onRowInserting(event: any): void {
    console.log('Inserting row:', event);
    event.data.stt = this.datas.length + 1;
    event.data.status = event.data.status || 'draft';
    event.data.planDate = event.data.planDate || new Date();
  }

  onRowRemoving(event: any): void {
    console.log('Removing row:', event);
  }

  getSemesterText(semester: string): string {
    const sem = this.semesterSource.find(s => s.value === semester);
    return sem ? sem.name : semester;
  }

  getSemesterClass(semester: string): string {
    return semester === '1' ? 'semester-1' : 'semester-2';
  }

  getStatusText(status: string): string {
    const stat = this.statusSource.find(s => s.value === status);
    return stat ? stat.name : status;
  }

  getStatusClass(status: string): string {
    const classes = {
      'draft': 'status-draft',
      'submitted': 'status-submitted',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return classes[status as keyof typeof classes] || '';
  }
}
