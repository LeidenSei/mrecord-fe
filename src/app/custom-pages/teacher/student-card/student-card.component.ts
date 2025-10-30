import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService } from 'src/app/services';
import { AppConfigService } from 'src/app/app-config.service';
import notify from 'devextreme/ui/notify';
import { forkJoin } from 'rxjs';
import { SchoolService } from 'src/app/services/school.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student-card',
  templateUrl: './student-card.component.html',
  styleUrls: ['./student-card.component.scss']
})
export class StudentCardComponent implements OnInit {
  @ViewChild('studentCardContent', { static: false }) cardContent: ElementRef;
  studentList: any[] = [];
  selectedStudent: any = null;
  studentCount = 0;
  
  currentSchoolId: string = '';
  currentClassId: string = '';
  currentSchoolYear: number = new Date().getFullYear();
  currentPersonId: string = '';
  isAdmin: boolean = false;
  
  filterClassId: string = '';
  filterClassSource: any[] = [];

  gradeSource: any[] = [];
  filterGrade: any = 0;
  classSource: any[] = [];
  schoolInfo: any = {
    name: '',
    address: '',
    phone: '',
    wardName: '',
    districtName: '',
    provinceName: '',
    masterName: '',
    masterPosition: ''
  };
  
  private apiBaseUrl: string = '';
  private mediaBaseUrl: string = 'https://media.mschool.edu.vn'; 

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private authService: AuthService,
    private generalService: GeneralService,
    private schoolService: SchoolService,
    private configService: AppConfigService,
    private http: HttpClient, 
    private sanitizer: DomSanitizer
  ) {
    this.apiBaseUrl = this.configService.getConfig().api.baseUrl;
    
    if (this.apiBaseUrl && !this.apiBaseUrl.startsWith('http://') && !this.apiBaseUrl.startsWith('https://')) {
      this.apiBaseUrl = 'https://' + this.apiBaseUrl;
    }
  }
  private async fetchImageAsBlob(url: string): Promise<string> {
    try {
      if (url.startsWith('data:') || url.startsWith('assets/') || url.startsWith('blob:')) {
        return url;
      }
      const blob = await this.http.get(url, { 
        responseType: 'blob',
        headers: {
          'Accept': 'image/*'
        }
      }).toPromise();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Cannot load image:', url, error);
      return 'assets/images/default-avatar.png';
    }
  }
  async ngOnInit() {
    const user = await this.authService.getUser();
    this.currentSchoolId = user.data.schoolId;
    this.currentPersonId = user.data.personId;
    this.currentSchoolYear = new Date().getFullYear();
    this.isAdmin = user.data.role === 2 || user.data.isBGH;
    await this.loadSchoolInfo();

    if (this.currentSchoolId) {
      await this.loadClassData(user);
    } else {
      notify('Không tìm thấy thông tin trường học', 'warning', 3000);
    }
  }

  async loadClassData(user: any): Promise<void> {
    try {
      forkJoin([
        this.generalService.getListGradeOfSchool(user.data.schoolId),
        this.generalService.getListSubjectByTeacher(user.data.schoolId, user.data.personId),
        this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
        this.generalService.getListClassBySchool(user.data.schoolId),
      ]).subscribe(([gradeSource, subjectSource, classSource, schoolClassSource]) => {
        this.classSource = (user.data.role === 2 || user.data.isBGH) ? schoolClassSource : classSource;
        let filterGradeIds = classSource.map(en => en.grade);
        
        if (user.data.role === 2 || user.data.isBGH) {
          this.gradeSource = gradeSource.filter(en => 1 === 1);
        } else {
          this.gradeSource = gradeSource.filter(en => filterGradeIds.includes(en));
        }
        
        this.filterGrade = this.gradeSource[0];
        
        if (this.filterGrade) {
          this.filterClassSource = this.classSource.filter(en => en.grade === this.filterGrade);
        } else {
          this.filterClassSource = this.classSource.filter(en => 1 === 1);
        }
        
        if (this.filterClassSource.length > 0) {
          this.filterClassId = this.filterClassSource[0].id;
          this.currentClassId = this.filterClassId;
          this.loadStudentData();
        }
      }, error => {
        console.error('Error loading data:', error);
        notify('Lỗi khi tải danh sách lớp', 'error', 3000);
      });
    } catch (err) {
      console.error('Error loading classes:', err);
      notify('Lỗi khi tải danh sách lớp', 'error', 3000);
    }
  }

  trackByStudentId(index: number, student: any): any {
    return student.id;
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
    }
    
    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      this.currentClassId = this.filterClassId;
      this.loadStudentData();
    }
  }

  private extractData(response: any): any[] {
    if (!response) return [];
    if (response.data !== undefined) {
      return Array.isArray(response.data) ? response.data : [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  }
  
  loadStudentData() {
    if (!this.currentClassId) {
      return;
    }
    
    this.studentService.getListByClass(this.currentClassId).subscribe({
      next: (data: any) => {
        const students = this.extractData(data);
        const currentClassName = this.getClassName(this.currentClassId);
        
        this.studentList = students.map((student: any) => ({
          ...student,
          id: student.Id || student.id,
          code: student.Code || student.code || student.maHocSinh,
          fullName: student.FullName || student.fullName || student.hoTen,
          dateOfBirth: student.DateOfBirth || student.dateOfBirth || student.ngaySinh,
          sex: student.Sex || student.sex || student.gioiTinh,
          address: student.Address || student.address || student.diaChi,
          className: currentClassName || student.ClassName || student.className || '',
          avatar: this.buildAvatarUrl(student.Avatar || student.avatar)
        }));
        
        this.studentCount = this.studentList.length;
        
        if (this.studentList.length > 0 && !this.selectedStudent) {
          this.selectStudent(this.studentList[0]);
        }
      },
      error: (err) => {
        console.error('Error loading students:', err);
        notify('Không thể tải danh sách học sinh', 'error', 2000);
      }
    });
  }

  private buildAvatarUrl(avatar: string): string {
    if (!avatar) {
      return 'assets/images/default-avatar.png';
    }
    
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    
    if (avatar.startsWith('/Media') || avatar.startsWith('Media')) {
      const baseUrl = this.mediaBaseUrl.endsWith('/') 
        ? this.mediaBaseUrl.slice(0, -1) 
        : this.mediaBaseUrl;
      
      const avatarPath = avatar.startsWith('/') ? avatar : '/' + avatar;
      return `${baseUrl}${avatarPath}`;
    }
    
    return avatar;
  }

  private async waitForImageLoad(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
      
      if (img.complete) {
        resolve();
      }
    });
  }

  private async preloadImages(): Promise<void> {
      const promises: Promise<void>[] = [];
      
      if (this.selectedStudent?.avatar) {
        promises.push(this.waitForImageLoad(this.selectedStudent.avatar));
      }
      
      // Đợi tất cả ảnh load xong
      await Promise.all(promises);
      
      // Thêm thời gian buffer
      await new Promise(resolve => setTimeout(resolve, 500));
  }

  printCard() {
    this.exportToPDF();
  }

  handlePrintCard = () => {
    this.exportToPDF();
  };

  handlePrintAll = () => {
    this.printAllCards();
  };

  async exportToPDF() {
    if (!this.selectedStudent) {
      notify('Vui lòng chọn học sinh', 'warning', 2000);
      return;
    }

    try {
      notify('Đang tạo PDF...', 'info', 2000);

      const element = document.querySelector('.student-card') as HTMLElement;
      if (!element) {
        notify('Không tìm thấy thẻ học sinh', 'error', 2000);
        return;
      }

      // Lấy tất cả ảnh và convert qua Angular HTTP
      const images = element.querySelectorAll('img');
      const originalSrcs: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        originalSrcs[i] = img.src;
        
        // Fetch qua Angular HTTP để bypass CORS
        const base64 = await this.fetchImageAsBlob(img.src);
        img.src = base64;
      }

      // Đợi browser render ảnh mới
      await new Promise(resolve => setTimeout(resolve, 500));

      // Render PDF
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore ảnh gốc để preview vẫn bình thường
      for (let i = 0; i < images.length; i++) {
        images[i].src = originalSrcs[i];
      }

      // Tạo PDF căn giữa
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth * 0.9;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = (pdfWidth - imgWidth) / 2;
      const y = Math.max(10, (pdfHeight - imgHeight) / 2);
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      pdf.save(`The-hoc-sinh-${this.selectedStudent.code}.pdf`);
      
      notify('Xuất PDF thành công', 'success', 2000);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      notify('Lỗi khi xuất PDF: ' + error.message, 'error', 3000);
    }
  }

  async printAllCards() {
    if (this.studentList.length === 0) {
      notify('Không có học sinh để in', 'warning', 2000);
      return;
    }

    try {
      notify(`Đang tạo PDF cho ${this.studentList.length} học sinh...`, 'info', 3000);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const element = document.querySelector('.student-card') as HTMLElement;

      if (!element) {
        notify('Không tìm thấy thẻ học sinh', 'error', 2000);
        return;
      }

      for (let i = 0; i < this.studentList.length; i++) {
        console.log(`Đang xử lý ${i + 1}/${this.studentList.length}: ${this.studentList[i].fullName}`);
        
        this.selectStudent(this.studentList[i]);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Convert ảnh
        const images = element.querySelectorAll('img');
        const originalSrcs: string[] = [];
        
        for (let j = 0; j < images.length; j++) {
          originalSrcs[j] = images[j].src;
          const base64 = await this.fetchImageAsBlob(images[j].src);
          images[j].src = base64;
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: false,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Restore
        for (let j = 0; j < images.length; j++) {
          images[j].src = originalSrcs[j];
        }

        const imgWidth = pdfWidth * 0.9;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const x = (pdfWidth - imgWidth) / 2;
        const y = Math.max(10, (pdfHeight - imgHeight) / 2);
        
        if (i > 0) pdf.addPage();
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      }

      pdf.save(`The-hoc-sinh-lop-${this.getClassName(this.currentClassId)}.pdf`);
      notify('Xuất PDF thành công!', 'success', 2000);
    } catch (error) {
      console.error('Error:', error);
      notify('Lỗi: ' + error.message, 'error', 3000);
    }
  }

  selectStudent(student: any) {
    this.selectedStudent = student;
  }

  classChange(e: any) {
    this.filterClassId = e.itemData.id;
    this.currentClassId = e.itemData.id;
    this.selectedStudent = null;
    this.loadStudentData();
  }

  onClassChanged(e: any) {
    if (e.value) {
      this.currentClassId = e.value;
      this.selectedStudent = null;
      this.loadStudentData();
    }
  }

  getClassName(classId: string): string {
    if (!classId) return '';
    
    let classItem = this.filterClassSource.find(c => c.id === classId);
    
    if (!classItem) {
      classItem = this.classSource.find(c => c.id === classId);
    }
    
    return classItem ? (classItem.name || classItem.Name || '') : '';
  }

  async loadSchoolInfo() {
    if (!this.currentSchoolId) {
      return;
    }

    this.schoolService.getSchoolById(this.currentSchoolId).subscribe({
      next: (response: any) => {
        const school = response.data || response;
        
        this.schoolInfo = {
          name: school.name || school.Name || '',
          address: school.address || school.Address || '',
          phone: school.phone || school.Phone || '',
          wardName: school.wardName || school.WardName || '',
          districtName: school.districtName || school.DistrictName || '',
          provinceName: school.provinceName || school.ProvinceName || '',
          masterName: school.masterName || school.MasterName || '',
          masterPosition: school.masterPosition || school.MasterPosition || ''
        };
      },
      error: (err) => {
        console.error('Error loading school info:', err);
      }
    });
  }

  getFullAddress(): string {
    const parts = [];
    
    if (this.schoolInfo.address) {
      parts.push(this.schoolInfo.address);
    }
    
    if (this.schoolInfo.wardName) {
      parts.push(this.schoolInfo.wardName);
    }
    
    if (this.schoolInfo.districtName) {
      parts.push(this.schoolInfo.districtName);
    }
    
    if (this.schoolInfo.provinceName) {
      parts.push(this.schoolInfo.provinceName);
    }
    
    return parts.join(', ');
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getGenderText(sex: any): string {
    if (sex === 1 || sex === '1') return 'Nam';
    if (sex === 2 || sex === '2' || sex === 0 || sex === '0') return 'Nữ';
    return '';
  }
  handleExportPDF = () => {
    this.exportToPDF();
  };
}