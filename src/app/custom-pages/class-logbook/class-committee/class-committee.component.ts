import { Component, OnInit } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import notify from 'devextreme/ui/notify';
import { ClassService } from 'src/app/services/class.service';
import { StudentService } from 'src/app/services/student.service';
import { AuthService } from 'src/app/services';
import { CommitteeService, CommitteeMemberDto, CreateCommitteeRequest, UpdateCommitteeRequest, BulkUpdatePositionRequest } from 'src/app/services/committee.service';
import { GeneralService } from 'src/app/services/general.service';

enum PositionClass {
  MONITOR = 'badge-danger',
  VICE_MONITOR = 'badge-info',
  TEAM_LEADER = 'badge-primary',
  TEAM_VICE = 'badge-success',
  MEMBER = 'badge-secondary'
}

@Component({
  selector: 'app-class-committee',
  templateUrl: './class-committee.component.html',
  styleUrls: ['./class-committee.component.scss']
})
export class ClassCommitteeComponent implements OnInit {
  datas: CommitteeMemberDto[] = [];
  allCommitteeData: CommitteeMemberDto[] = [];
  committeeCount = 0;
  
  studentSource: any[] = [];
  studentRoles: any[] = [];
  
  selectedSchoolYear = 2025;
  schoolYearSource = [2025, 2024, 2023]; 
  
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
  selectedRows: CommitteeMemberDto[] = [];
  
  currentSchoolId: string = '';
  currentPersonId: string = '';
  isAdmin: boolean = false;
  allClasses: any[] = [];
  
  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private committeeService: CommitteeService,
    public authService: AuthService,
    private generalService: GeneralService,
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

    await this.loadSchoolYear();
    this.loadStudentRoles();
    await this.loadClassData(user);
  }

  async loadSchoolYear(): Promise<void> {
    try {
      const school = await this.generalService.getSchool(this.currentSchoolId).toPromise();
      
      if (school && school.currentSchoolYear) {
        this.selectedSchoolYear = school.currentSchoolYear;
        this.schoolYearSource = [
          school.currentSchoolYear,
          school.currentSchoolYear - 1,
          school.currentSchoolYear - 2
        ];
      }
    } catch (err) {
      const currentYear = new Date().getFullYear();
      this.selectedSchoolYear = currentYear;
      this.schoolYearSource = [currentYear, currentYear - 1, currentYear - 2];
    }
  }

  schoolYearChange(event: any): void {
    this.selectedSchoolYear = event.itemData; 
    this.loadCommitteeData();
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
      
      this.allClasses = classes.map((cls: any) => ({
        id: cls.id,
        name: cls.name || cls.tenLop || cls.shortName,
        grade: cls.grade
      }));

      const gradeIds = [...new Set(this.allClasses.map(c => c.grade).filter(g => g))].sort();
      this.gradeSource = ['Tất cả', ...gradeIds.map((g: number) => `Khối ${g}`)];
      
      this.filterClassSource = [
        { id: null, name: 'Tất cả lớp' },
        ...this.allClasses
      ];
      
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

  get selectedElectionRoundText(): string {
    const item = this.electionRoundSource.find(x => x.value === this.selectedElectionRound);
    return item ? item.name : 'Chọn lần BC';
  }

  get selectedClassText(): string {
    const cls = this.filterClassSource.find(x => x.id === this.filterClassId);
    return cls ? cls.name : 'Chọn lớp';
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
          this.resetCommitteeData();
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
      this.resetCommitteeData();
    }
  }
  
  electionRoundChange(event: any): void {
    this.selectedElectionRound = event.itemData.value;
    this.loadCommitteeData();
  }

  loadStudentData(): void {
    if (!this.filterClassId) {
      this.studentSource = [];
      return;
    }
    
    this.generalService.getListStudentByClass2(this.filterClassId).subscribe({
      next: (students) => {
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

  getSchoolYearDisplay(year: number): string {
    return `${year - 1}-${year}`;
  }

  get selectedSchoolYearText(): string {
    return this.getSchoolYearDisplay(this.selectedSchoolYear);
  }

  loadCommitteeData(): void {
    if (!this.filterClassId) {
      this.resetCommitteeData();
      return;
    }

    this.committeeService.getListByClass(
      this.filterClassId,
      this.selectedSchoolYear,  
      this.selectedElectionRound > 0 ? this.selectedElectionRound : undefined,
      undefined
    ).pipe(
      tap(data => {
        const mappedData = this.mapCommitteeData(data);
        this.allCommitteeData = mappedData;
        this.datas = [...mappedData];
        this.committeeCount = mappedData.length;
      }),
      catchError(err => {
        console.error('Error loading committee:', err);
        notify('Không thể tải danh sách ban cán sự', 'error', 2000);
        this.resetCommitteeData();
        return of([]);
      })
    ).subscribe();
  }

  private resetCommitteeData(): void {
    this.allCommitteeData = [];
    this.datas = [];
    this.committeeCount = 0;
  }

  onRowUpdating(event: any): void {
    const updatedData = { ...event.oldData, ...event.newData };
    
    const request: UpdateCommitteeRequest = {
      id: event.key,
      positionId: updatedData.positionId,
      teamNumber: updatedData.teamNumber,
      electionRound: updatedData.electionRound,
      responsibilities: updatedData.responsibilities,
      notes: updatedData.notes
    };

    this.committeeService.update(request).subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify('Cập nhật thành công', 'success', 2000);
          this.loadCommitteeData();
        } else {
          notify(response.message, 'warning', 2000);
        }
      },
      error: (err) => {
        console.error('Error updating committee:', err);
        notify('Không thể cập nhật', 'error', 2000);
        event.cancel = true;
      }
    });
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

  openEditModal(rows: CommitteeMemberDto[]): void {
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

    const electionRound = this.getNextElectionRound();
    
    const request: CreateCommitteeRequest = {
      classId: this.filterClassId!,
      studentIds: this.selectedStudents.map(s => s.id),
      positionIds: this.selectedPositions.map(p => p.id),
      schoolYear: this.selectedSchoolYear,
      electionRound: electionRound
    };

    this.committeeService.createBulk(request).subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify(response.message, 'success', 2000);
          this.loadCommitteeData();
          this.closeAddModal();
        } else {
          notify(response.message, 'warning', 2000);
        }
      },
      error: (err) => {
        console.error('Error creating committee:', err);
        notify('Không thể tạo phân công', 'error', 2000);
      }
    });
  }

  handleEditMode(): void {
    if (this.selectedPositions.length === 0) {
      notify('Vui lòng chọn ít nhất một chức vụ mới', 'error', 2000);
      return;
    }

    const request: BulkUpdatePositionRequest = {
      committeeIds: this.selectedRows.map(r => r.id!),
      newPositionIds: this.selectedPositions.map(p => p.id)
    };

    this.committeeService.bulkUpdatePosition(request).subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify(response.message, 'success', 2000);
          this.loadCommitteeData();
          this.closeAddModal();
        } else {
          notify(response.message, 'warning', 2000);
        }
      },
      error: (err) => {
        console.error('Error updating positions:', err);
        notify('Không thể cập nhật chức vụ', 'error', 2000);
      }
    });
  }

  onRowInserting(event: any): void {
    event.cancel = true;
    this.openAddModal();
  }
  
  onRowRemoving(event: any): void {
    this.committeeService.deleteCommittee(event.key).subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify('Xóa thành công', 'success', 2000);
          this.loadCommitteeData();
        } else {
          notify(response.message, 'warning', 2000);
        }
      },
      error: (err) => {
        console.error('Error deleting committee:', err);
        notify('Không thể xóa', 'error', 2000);
        event.cancel = true;
      }
    });
  }

  onExporting(event: any): void {
    console.log('Exporting data');
  }

  onSelectionChanged(event: any): void {
    this.selectedRows = event.selectedRowsData;
  }

  getNextElectionRound(): number {
    if (this.allCommitteeData.length === 0) return 1;
    const maxRound = Math.max(...this.allCommitteeData.map(d => d.electionRound || 0), 0);
    return maxRound > 0 ? maxRound : 1;
  }

  getClassName(classId: string): string {
    const cls = this.filterClassSource.find(c => c.id === classId);
    return cls ? cls.name : '';
  }

  getPositionText(positionId: string): string {
    const role = this.studentRoles.find(r => r.id === positionId || r.code === positionId);
    return role ? role.name : positionId;
  }

  getPositionClass(positionId: string): string {
    const role = this.studentRoles.find(r => r.id === positionId || r.code === positionId);
    if (!role) return PositionClass.MEMBER;
    
    const classMap: Record<string, string> = {
      'Lớp trưởng': PositionClass.MONITOR,
      'Lớp phó': PositionClass.VICE_MONITOR,
      'Tổ trưởng': PositionClass.TEAM_LEADER,
      'Tổ phó': PositionClass.TEAM_VICE
    };
    
    return classMap[role.name] || PositionClass.MEMBER;
  }

  needsTeam(positionId: string): boolean {
    const role = this.studentRoles.find(r => r.id === positionId);
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

  private mapCommitteeData(data: any[]): CommitteeMemberDto[] {
    return data.map(item => {
      const positionName = item.positionName || this.getPositionText(item.positionId);
      console.log('Position mapping:', {
        positionId: item.positionId,
        positionNameFromAPI: item.positionName,
        positionNameComputed: positionName,
        studentRoles: this.studentRoles
      });
      
      return {
        id: item.id,
        studentId: item.studentId,
        studentName: item.studentName,
        studentCode: item.studentCode,
        classId: item.classId,
        className: item.className,
        positionId: item.positionId,
        positionName: positionName,
        teamNumber: item.teamNumber,
        schoolYear: item.schoolYear,
        electionRound: item.electionRound,
        electionDate: new Date(item.electionDate),
        startDate: new Date(item.startDate),
        endDate: item.endDate ? new Date(item.endDate) : undefined,
        isActive: item.isActive,
        responsibilities: item.responsibilities,
        notes: item.notes
      };
    });
  }
}