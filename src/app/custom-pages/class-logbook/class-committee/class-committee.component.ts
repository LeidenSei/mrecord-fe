import { Component, OnInit } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { ClassService } from 'src/app/services/class.service';
import { StudentService } from 'src/app/services/student.service';
import { AuthService } from 'src/app/services'; // ✅ THÊM

interface CommitteeMember {
  id?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  position: string;
  teamNumber?: number;
  schoolYear: string;
  electionRound: number;
  electionDate: Date;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  responsibilities?: string;
  notes?: string;
}

@Component({
  selector: 'app-class-committee',
  templateUrl: './class-committee.component.html',
  styleUrls: ['./class-committee.component.scss']
})
export class ClassCommitteeComponent implements OnInit {
  datas: CommitteeMember[] = [];
  allCommitteeData: CommitteeMember[] = [];
  committeeCount = 0;
  
  studentSource: any[] = [];
  studentRoles: any[] = [];
  
  selectedSchoolYear = '2024-2025';
  schoolYearSource = ['2024-2025', '2023-2024', '2022-2023'];
  
  selectedElectionRound = 0;
  electionRoundSource = [
    { value: 0, name: 'Tất cả lần bầu cử' },
    { value: 1, name: 'Lần 1' },
    { value: 2, name: 'Lần 2' },
    { value: 3, name: 'Lần 3' },
    { value: 4, name: 'Lần 4' }
  ];
  
  gradeSource: string[] = ['Tất cả']; 
  selectedGrade = 'Tất cả';
  
  filterClassId: string | null = null;
  filterClassSource: any[] = [];
  
  positionSource: any[] = [];
  
  teamSource = [
    { value: 1, name: 'Tổ 1' },
    { value: 2, name: 'Tổ 2' },
    { value: 3, name: 'Tổ 3' },
    { value: 4, name: 'Tổ 4' }
  ];

  exportTexts = {
    exportAll: 'Xuất toàn bộ',
    exportSelectedRows: 'Xuất dòng được chọn',
    exportTo: 'Xuất ra'
  };

  showAddModal = false;
  selectedStudents: any[] = [];
  selectedPositions: any[] = [];
  isEditMode = false;
  selectedRows: CommitteeMember[] = [];
  
  currentSchoolId: string = '';
  currentPersonId: string = '';
  isAdmin: boolean = false;
  allClasses: any[] = [];
 constructor(
    private studentService: StudentService,
    private classService: ClassService,
    public authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getUser();
    this.currentSchoolId = user.data.schoolId;
    this.currentPersonId = user.data.personId;
    this.isAdmin = user.data.role === 2 || user.data.isBGH;

    if (!this.currentSchoolId) {
      notify('Không tìm thấy thông tin trường học', 'warning', 3000);
      return;
    }

    this.loadStudentRoles();
    await this.loadClassData(user);
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
        this.filterClassSource = [{ id: null, name: 'Tất cả lớp' }];
        return;
      }
      
      // ✅ LUU danh sách classes gốc
      this.allClasses = classes.map((cls: any) => ({
        id: cls.id,
        name: cls.shortName || cls.name || cls.tenLop,
        grade: cls.grade
      }));
      
      // Lọc grades theo classes được phân công
      const gradeIds = [...new Set(this.allClasses.map(c => c.grade).filter(g => g))].sort();
      this.gradeSource = ['Tất cả', ...gradeIds.map((g: number) => `Khối ${g}`)];
      
      // Hiển thị tất cả lớp ban đầu
      this.filterClassSource = [
        { id: null, name: 'Tất cả lớp' },
        ...this.allClasses
      ];
      
      // Set default class
      if (this.filterClassSource.length > 1) {
        this.filterClassId = this.filterClassSource[1].id;
        this.loadStudentData();
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      notify('Không thể tải danh sách lớp', 'error', 2000);
      this.filterClassSource = [{ id: null, name: 'Tất cả lớp' }];
    }
  }

  
  loadStudentRoles(): void {
    this.studentService.getListRole().subscribe({
      next: (roles) => {
        this.studentRoles = roles;
        this.positionSource = roles.map((role: any) => ({
          id: role.id,
          value: role.id,
          name: role.name,
          code: role.code
        }));
      },
      error: (err) => {
        console.error('Error loading student roles:', err);
        notify('Không thể tải danh sách chức vụ', 'error', 2000);
      }
    });
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

  getGradeNumber(gradeText: string): number | undefined {
    if (gradeText === 'Tất cả') return undefined;
    const match = gradeText.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
  }

  gradeChange(event: any): void {
    this.selectedGrade = event.itemData;
    
    if (this.selectedGrade === 'Tất cả') {
      this.filterClassSource = [
        { id: null, name: 'Tất cả lớp' },
        ...this.allClasses
      ];
    } else {
      const gradeNumber = this.getGradeNumber(this.selectedGrade);
      
      if (gradeNumber !== undefined) {
        const filteredClasses = this.allClasses.filter(c => c.grade === gradeNumber);
        
        this.filterClassSource = [
          { id: null, name: 'Tất cả lớp' },
          ...filteredClasses
        ];

        if (filteredClasses.length > 0) {
          this.filterClassId = filteredClasses[0].id;
          this.loadStudentData();
        } else {
          this.filterClassId = null;
          this.studentSource = [];
          this.datas = [];
          this.committeeCount = 0;
          notify('Không có lớp nào trong khối này', 'info', 2000);
        }
      }
    }
  }

  classChange(event: any): void {
    this.filterClassId = event.itemData.id;
    if (this.filterClassId) {
      this.loadStudentData();
    } else {
      this.studentSource = [];
      this.datas = [];
      this.committeeCount = 0;
    }
  }

  schoolYearChange(event: any): void {
    this.selectedSchoolYear = event.itemData;
    this.loadCommitteeData();
  }
  
  electionRoundChange(event: any): void {
    this.selectedElectionRound = event.itemData.value;
    this.datas = this.filterCommitteeData(this.allCommitteeData);
    this.committeeCount = this.datas.length;
  }
  loadStudentData(): void {
    if (!this.filterClassId) {
      this.studentSource = [];
      return;
    }
    
    this.studentService.getListByClass(this.filterClassId).subscribe({
      next: (response) => {
        const students = this.extractData(response); 
        this.studentSource = students.map((student: any) => ({
          id: student.id,
          code: student.code || '',
          fullName: this.getFullName(student),
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          classId: student.classId,
          schoolId: student.schoolId,
          avatar: student.avatar,
          sex: student.sex,
          dateOfBirth: student.dateOfBirth
        }));
        
        this.loadCommitteeData();
      },
      error: (err) => {
        console.error('Error loading students:', err);
        notify('Không thể tải danh sách học sinh', 'error', 2000);
        this.studentSource = [];
      }
    });
  }

  getFullName(student: any): string {
    const parts = [
      student.lastName,
      student.middleName,
      student.firstName
    ].filter(part => part && part.trim());
    return parts.join(' ');
  }

  loadCommitteeData(): void {
    const committeeKey = `committee_${this.filterClassId}_${this.selectedSchoolYear}`;
    const savedData = localStorage.getItem(committeeKey);
    
    if (savedData) {
      try {
        this.allCommitteeData = JSON.parse(savedData).map((item: any) => ({
          ...item,
          electionDate: new Date(item.electionDate),
          startDate: new Date(item.startDate),
          endDate: item.endDate ? new Date(item.endDate) : undefined
        }));
      } catch (e) {
        this.allCommitteeData = [];
      }
    } else {
      this.allCommitteeData = [];
    }
    
    this.datas = this.filterCommitteeData(this.allCommitteeData);
    this.committeeCount = this.datas.length;
  }

  filterCommitteeData(data: CommitteeMember[]): CommitteeMember[] {
    let filtered = [...data];
    
    if (this.selectedElectionRound > 0) {
      filtered = filtered.filter(d => d.electionRound === this.selectedElectionRound);
    }
    
    return filtered;
  }

  saveToLocalStorage(data: CommitteeMember[]): void {
    const committeeKey = `committee_${this.filterClassId}_${this.selectedSchoolYear}`;
    localStorage.setItem(committeeKey, JSON.stringify(data));
  }

  openAddModal(): void {
    if (!this.filterClassId) {
      notify('Vui lòng chọn lớp học trước', 'warning', 2000);
      return;
    }
    
    this.isEditMode = false;
    this.selectedStudents = [];
    this.selectedPositions = [];
    this.selectedRows = [];
    this.showAddModal = true;
  }

  openEditModal(rows: CommitteeMember[]): void {
    if (rows.length === 0) {
      notify('Vui lòng chọn ít nhất một bản ghi để chỉnh sửa', 'warning', 2000);
      return;
    }
    
    this.isEditMode = true;
    this.selectedRows = rows;
    
    this.selectedStudents = rows.map(row => 
      this.studentSource.find(s => s.id === row.studentId)
    ).filter(s => s);
    
    this.selectedPositions = [];
    
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveMultipleAssignments(): void {
    if (this.isEditMode) {
      this.handleEditMode();
    } else {
      this.handleAddMode();
    }
  }

  handleAddMode(): void {
    if (this.selectedStudents.length === 0) {
      notify('Vui lòng chọn ít nhất một học sinh', 'error', 2000);
      return;
    }
    
    if (this.selectedPositions.length === 0) {
      notify('Vui lòng chọn ít nhất một chức vụ', 'error', 2000);
      return;
    }
    
    const newMembers: CommitteeMember[] = [];
    const currentDate = new Date();
    const electionRound = this.getNextElectionRound();
    const className = this.getClassName(this.filterClassId!); // ✅ SỬA: Non-null assertion
    
    this.selectedStudents.forEach(student => {
      this.selectedPositions.forEach(position => {
        if (!this.validatePosition(position.id, undefined, student.id)) {
          return;
        }

        const member: CommitteeMember = {
          id: this.generateId(),
          studentId: student.id,
          studentName: student.fullName,
          studentCode: student.code,
          classId: this.filterClassId!,
          className: className,
          position: position.id,
          teamNumber: undefined,
          schoolYear: this.selectedSchoolYear,
          electionRound: electionRound,
          electionDate: currentDate,
          startDate: currentDate,
          isActive: true,
          responsibilities: position.name
        };
        
        newMembers.push(member);
      });
    });
    
    if (newMembers.length === 0) {
      notify('Không có phân công nào hợp lệ để thêm', 'error', 2000);
      return;
    }
    
    this.allCommitteeData.push(...newMembers);
    this.saveToLocalStorage(this.allCommitteeData);
    
    this.datas = this.filterCommitteeData(this.allCommitteeData);
    this.committeeCount = this.datas.length;
    
    const roleIds = this.selectedPositions.map(p => p.id);
    const roleNames = this.selectedPositions.map(p => p.name);
    
    this.selectedStudents.forEach(student => {
      this.classService.saveStudentRole(
        this.filterClassId!,
        student.id,
        student.fullName,
        roleIds,
        roleNames
      ).subscribe({
        next: () => {},
        error: (err) => console.error('Error saving student role:', err)
      });
    });
    
    notify(`Đã thêm ${newMembers.length} phân công thành công`, 'success', 2000);
    
    this.closeAddModal();
  }

  handleEditMode(): void {
    if (this.selectedPositions.length === 0) {
      notify('Vui lòng chọn ít nhất một chức vụ mới', 'error', 2000);
      return;
    }

    this.selectedRows.forEach(row => {
      const index = this.allCommitteeData.findIndex(d => d.id === row.id);
      if (index !== -1) {
        this.allCommitteeData.splice(index, 1);
      }
    });

    const updatedMembers: CommitteeMember[] = [];
    const className = this.getClassName(this.filterClassId!);
    
    this.selectedRows.forEach(row => {
      const student = this.studentSource.find(s => s.id === row.studentId);
      if (!student) return;

      this.selectedPositions.forEach(position => {
        const updated: CommitteeMember = {
          id: this.generateId(),
          studentId: student.id,
          studentName: student.fullName,
          studentCode: student.code,
          classId: this.filterClassId!,
          className: className,
          position: position.id,
          teamNumber: row.teamNumber,
          schoolYear: this.selectedSchoolYear,
          electionRound: row.electionRound,
          electionDate: row.electionDate,
          startDate: row.startDate,
          isActive: true,
          responsibilities: position.name
        };
        
        updatedMembers.push(updated);
      });
    });

    if (updatedMembers.length === 0) {
      notify('Không có cập nhật nào hợp lệ', 'error', 2000);
      return;
    }

    this.allCommitteeData.push(...updatedMembers);
    this.saveToLocalStorage(this.allCommitteeData);
    
    this.datas = this.filterCommitteeData(this.allCommitteeData);
    this.committeeCount = this.datas.length;
    
    const roleIds = this.selectedPositions.map(p => p.id);
    const roleNames = this.selectedPositions.map(p => p.name);
    
    const uniqueStudents = [...new Set(this.selectedRows.map(r => r.studentId))];
    uniqueStudents.forEach(studentId => {
      const student = this.studentSource.find(s => s.id === studentId);
      if (student) {
        this.classService.saveStudentRole(
          this.filterClassId!,
          student.id,
          student.fullName,
          roleIds,
          roleNames
        ).subscribe({
          next: () => {},
          error: (err) => console.error('Error saving student role:', err)
        });
      }
    });
    
    notify(`Đã cập nhật ${updatedMembers.length} phân công`, 'success', 2000);
    
    this.closeAddModal();
  }

  onRowInserting(event: any): void {
    event.cancel = true;
    this.openAddModal();
  }
  
  onRowUpdating(event: any): void {
    const index = this.allCommitteeData.findIndex(d => d.id === event.key);
    
    if (index !== -1) {
      Object.assign(this.allCommitteeData[index], event.newData);
      this.saveToLocalStorage(this.allCommitteeData);
    }
    
    notify('Cập nhật ban cán sự thành công', 'success', 2000);
  }

  onRowRemoving(event: any): void {
    const index = this.allCommitteeData.findIndex(d => d.id === event.key);
    
    if (index !== -1) {
      this.allCommitteeData.splice(index, 1);
      this.saveToLocalStorage(this.allCommitteeData);
    }
    
    notify('Xóa ban cán sự thành công', 'success', 2000);
  }

  onExporting(event: any): void {
    console.log('Exporting data');
  }

  onSelectionChanged(event: any): void {
    this.selectedRows = event.selectedRowsData;
  }

  validatePosition(positionId: string, teamNumber: number | undefined, studentId: string, excludeId?: string): boolean {
    if (this.needsTeam(positionId) && !teamNumber) {
      notify('Chức vụ này yêu cầu phải có tổ', 'warning', 2000);
      return false;
    }
    
    const duplicate = this.allCommitteeData.some(d => 
      d.studentId === studentId && 
      d.position === positionId && 
      d.id !== excludeId &&
      d.isActive &&
      d.electionRound === this.getNextElectionRound()
    );
    
    if (duplicate) {
      notify('Học sinh đã có chức vụ này trong lần bầu cử hiện tại', 'warning', 2000);
      return false;
    }
    
    return true;
  }

  getNextElectionRound(): number {
    if (this.allCommitteeData.length === 0) return 1;
    const maxRound = Math.max(...this.allCommitteeData.map(d => d.electionRound || 0), 0);
    return maxRound > 0 ? maxRound : 1;
  }

  generateId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const counter = this.allCommitteeData.length;
    return `CM_${timestamp}_${counter}_${random}`;
  }

  getClassName(classId: string): string {
    const cls = this.filterClassSource.find(c => c.id === classId);
    return cls ? cls.name : '';
  }

  getPositionText(position: string): string {
    const role = this.studentRoles.find(r => r.id === position || r.code === position);
    return role ? role.name : position;
  }

  getPositionClass(position: string): string {
    return 'badge-primary';
  }

  needsTeam(position: string): boolean {
    const role = this.studentRoles.find(r => r.id === position);
    if (!role) return false;
    
    const teamPositions = ['Tổ trưởng', 'Tổ phó'];
    return teamPositions.includes(role.name);
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Đang hoạt động' : 'Đã kết thúc';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-secondary';
  }
}