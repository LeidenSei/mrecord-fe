import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxValidationGroupComponent } from 'devextreme-angular';
import { AuthService, ScreenService } from '../../../services';
import { GeneralService } from '../../../services/general.service';
import { StudentService } from '../../../services/student.service';
import { NotificationService } from '../../../services/notification.service';
import { Constant } from '../../../shared/constants/constant.class';
import { forkJoin } from 'rxjs';
import { FullNamePipe } from '../../../pipes/full-name.pipe';
import { CommitteeService, CommitteeMemberDto } from '../../../services/committee.service';
import { confirm } from 'devextreme/ui/dialog';

interface TeamGroup {
  teamNumber: number;
  teamName: string;
  teamLeader: string;
  memberCount: number;
  members: CommitteeMemberDto[];
}

interface StudentWithTeam {
  stt: number;
  id: string;
  code: string;
  fullName: string;
  bGDCode: string;
  birthDate: Date;
  sex: number;
  phoneNo: string;
  teamNumber: number | null;
  teamName: string;
}

@Component({
  selector: 'app-group-management-c2',
  templateUrl: './group-management-c2.component.html',
  styleUrls: ['./group-management-c2.component.scss']
})
export class GroupManagementC2Component implements OnInit {
  @ViewChild('validationGroup', { static: true }) validationGroup: DxValidationGroupComponent;
  @ViewChild('studentGrid', { static: false }) studentGrid: DxDataGridComponent;

  // Tab management
  selectedTabIndex = 0;
  tabItems = [
    { id: 0, text: 'Danh sách tổ' },
    { id: 1, text: 'Xếp học sinh vào tổ' }
  ];

  // Filter
  gradeSource = [];
  classSource = [];
  filterClassSource = [];
  filterGrade: any = 0;
  filterClassId: any;

  // Data
  teams: TeamGroup[] = [];
  studentsWithTeam: StudentWithTeam[] = []; // Học sinh ĐÃ có tổ
  studentsWithoutTeam: any[] = []; // Học sinh CHƯA có tổ
  allStudents: any[] = [];
  committees: CommitteeMemberDto[] = [];

  // Popup - Tab 1: Thêm/Sửa tổ
  isShowAddTeamPopup = false;
  isShowEditTeamPopup = false;
  editingTeam: any = null;
  newTeam: any = {
    teamNumber: 1,
    teamName: '',
    teamLeaderId: null
  };

  // Popup - Tab 2: Xếp học sinh vào tổ
  isShowAssignStudentPopup = false;
  selectedStudentsToAdd: any[] = [];
  selectedTeamNumber: number = 1;
  teamNumbers: number[] = [];

  // Current state
  currentSchoolYear: number;
  currentElectionRound: number = 1;
  isAdmin = false;
  studentRoles: any[] = [];
  studentCount = 0;
  teamCount = 0;

  constructor(
    private generalService: GeneralService,
    private studentService: StudentService,
    private committeeService: CommitteeService,
    public authService: AuthService,
    public screen: ScreenService,
    private notificationService: NotificationService,
    private fullNamePipe: FullNamePipe
  ) {
    const now = new Date();
    const month = now.getMonth() + 1;
    this.currentSchoolYear = month >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.isAdmin = user.data.role === 2;

    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
      this.studentService.getListRole()
    ]).subscribe(([gradeSource, classSource, schoolClassSource, roles]) => {
      this.classSource = (user.data.role === 2 || user.data.isBGH) ? schoolClassSource : classSource;
      this.studentRoles = roles;

      const filterGradeIds = classSource.map((en: any) => en.grade);
      if (user.data.role === 2 || user.data.isBGH) {
        this.gradeSource = gradeSource.filter(() => true);
      } else {
        this.gradeSource = gradeSource.filter((en: any) => filterGradeIds.includes(en));
      }

      this.filterGrade = this.gradeSource[0];
      if (this.filterGrade) {
        this.filterClassSource = this.classSource.filter((en: any) => en.grade === this.filterGrade);
      } else {
        this.filterClassSource = this.classSource.filter(() => true);
      }

      if (this.filterClassSource.length > 0) {
        this.filterClassId = this.filterClassSource[0].id;
        this.loadData();
      }
    });
  }

  loadData() {
    if (!this.filterClassId) return;

    forkJoin([
      this.generalService.getListStudentByClass2(this.filterClassId),
      this.committeeService.getListByClass(this.filterClassId, this.currentSchoolYear, this.currentElectionRound, true)
    ]).subscribe(([students, committees]) => {
      this.allStudents = students;
      this.committees = committees;
      this.studentCount = students.length;

      this.processTeamsData();
      this.processStudentsWithTeam();
    }, () => {
      this.notificationService.showNotification(Constant.ERROR, 'Không thể tải dữ liệu');
    });
  }

  processTeamsData() {
    const teamMap = new Map<number, TeamGroup>();

    this.committees.forEach(committee => {
      if (committee.teamNumber !== null && committee.teamNumber !== undefined) {
        if (!teamMap.has(committee.teamNumber)) {
          teamMap.set(committee.teamNumber, {
            teamNumber: committee.teamNumber,
            teamName: committee.teamName || `Tổ ${committee.teamNumber}`,
            teamLeader: '',
            memberCount: 0,
            members: []
          });
        }

        const team = teamMap.get(committee.teamNumber)!;
        team.members.push(committee);
        team.memberCount++;

        // Update team name if available
        if (committee.teamName) {
          team.teamName = committee.teamName;
        }

        // Find team leader
        const leaderRole = this.studentRoles.find(r =>
          r.name?.toLowerCase().includes('tổ trưởng') || r.name?.toLowerCase().includes('nhóm trưởng')
        );

        if (leaderRole && committee.positionId === leaderRole.id) {
          team.teamLeader = committee.studentName;
        }
      }
    });

    this.teams = Array.from(teamMap.values()).sort((a, b) => a.teamNumber - b.teamNumber);
    this.teamCount = this.teams.length;

    // Update available team numbers
    this.teamNumbers = this.teams.map(t => t.teamNumber);
  }

  processStudentsWithTeam() {
    // Tách học sinh thành 2 nhóm: đã có tổ và chưa có tổ
    const studentsWithTeamTemp: StudentWithTeam[] = [];
    const studentsWithoutTeamTemp: any[] = [];

    this.allStudents.forEach((student, index) => {
      const committee = this.committees.find(c => c.studentId === student.id);

      const studentData = {
        stt: index + 1,
        id: student.id,
        code: student.code,
        fullName: this.fullNamePipe.transform(student),
        bGDCode: student.bGDCode || '',
        birthDate: student.birthDate,
        sex: student.sex,
        phoneNo: this.getPhoneStudent(student),
        teamNumber: committee?.teamNumber || null,
        teamName: committee?.teamName || (committee?.teamNumber ? `Tổ ${committee.teamNumber}` : '')
      };

      // ✅ FIXED: Check if committee exists AND has teamName (not just teamNumber)
      if (committee && committee.teamName) {
        // Học sinh đã có tổ
        studentsWithTeamTemp.push(studentData);
      } else {
        // Học sinh chưa có tổ
        studentsWithoutTeamTemp.push(studentData);
      }
    });

    this.studentsWithTeam = studentsWithTeamTemp;
    this.studentsWithoutTeam = studentsWithoutTeamTemp;
  }

  getPhoneStudent(data: any): string {
    if (data.contacts) {
      const contact = data.contacts.find((en: any) => en.mainContact);
      if (contact) return contact.value;
    }
    return '';
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter((en: any) => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = this.classSource.filter(() => true);
    }

    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      this.loadData();
    }
  }

  classChange($event: any) {
    this.filterClassId = $event.itemData.id;
    this.loadData();
  }

  onTabSelectionChanged($event: any) {
    this.selectedTabIndex = $event.itemIndex;
  }

  // Team management
  editTeam(team: TeamGroup) {
    this.editingTeam = { ...team };
    this.isShowEditTeamPopup = true;
  }

  closeEditTeamPopup() {
    this.isShowEditTeamPopup = false;
    this.editingTeam = null;
  }

  saveEditTeam() {
    if (!this.editingTeam) return;

    // Update team number and team name for all members
    const promises = this.editingTeam.members.map((member: CommitteeMemberDto) => {
      return this.committeeService.update({
        id: member.id,
        positionId: member.positionId,
        teamNumber: this.editingTeam.teamNumber,
        teamName: this.editingTeam.teamName,
        electionRound: this.currentElectionRound,
        responsibilities: member.responsibilities,
        notes: member.notes
      }).toPromise();
    });

    Promise.all(promises).then(() => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Đã cập nhật tổ thành công');
      this.closeEditTeamPopup();
      this.loadData();
    }).catch(() => {
      this.notificationService.showNotification(Constant.ERROR, 'Không thể cập nhật tổ');
    });
  }

  deleteTeam(team: TeamGroup) {
    const result = confirm(
      `Bạn có chắc chắn muốn xóa Tổ ${team.teamNumber}? Tất cả học sinh trong tổ sẽ bị bỏ phân công.`,
      'Xác nhận xóa'
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        const committeeIds = team.members.map(m => m.id);
        const promises = committeeIds.map(id => this.committeeService.deleteCommittee(id).toPromise());

        Promise.all(promises).then(() => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đã xóa tổ thành công');
          this.loadData();
        }).catch(() => {
          this.notificationService.showNotification(Constant.ERROR, 'Không thể xóa tổ');
        });
      }
    });
  }

  // Tab 1: Thêm tổ mới
  showAddTeamPopup() {
    const nextTeamNumber = this.teams.length + 1;
    this.newTeam = {
      teamNumber: nextTeamNumber,
      teamName: `Tổ ${nextTeamNumber}`,
      teamLeaderId: null
    };
    this.isShowAddTeamPopup = true;
  }

  closeAddTeamPopup() {
    this.isShowAddTeamPopup = false;
  }

  saveNewTeam() {
    // Validate
    if (!this.newTeam.teamNumber || this.newTeam.teamNumber < 1) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập số tổ hợp lệ');
      return;
    }

    if (!this.newTeam.teamName || this.newTeam.teamName.trim() === '') {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập tên tổ');
      return;
    }

    // Check if team number already exists
    const existingTeam = this.teams.find(t => t.teamNumber === this.newTeam.teamNumber);
    if (existingTeam) {
      this.notificationService.showNotification(Constant.WARNING, `Tổ số ${this.newTeam.teamNumber} đã tồn tại`);
      return;
    }

    // Chuẩn bị dữ liệu: Nếu có tổ trưởng thì tạo với tổ trưởng, không thì tạo tổ rỗng
    const studentIds: string[] = [];
    const positionIds: string[] = [];

    if (this.newTeam.teamLeaderId) {
      // Tìm chức vụ "Tổ trưởng"
      const leaderRole = this.studentRoles.find(r =>
        r.name?.toLowerCase().includes('tổ trưởng') || r.name?.toLowerCase().includes('nhóm trưởng')
      );

      if (!leaderRole) {
        this.notificationService.showNotification(
          Constant.WARNING,
          'Không tìm thấy chức vụ "Tổ trưởng". Vui lòng tạo chức vụ này trước.'
        );
        return;
      }

      studentIds.push(this.newTeam.teamLeaderId);
      positionIds.push(leaderRole.id);
    } else {
      // Không có tổ trưởng - tạo tổ rỗng (chỉ lưu metadata)
      // Thêm vào danh sách để có thể chọn khi xếp học sinh
      if (!this.teamNumbers.includes(this.newTeam.teamNumber)) {
        this.teamNumbers.push(this.newTeam.teamNumber);
        this.teamNumbers.sort((a, b) => a - b);
      }

      // Lưu tạm vào localStorage hoặc memory để giữ thông tin tên tổ
      const emptyTeam: TeamGroup = {
        teamNumber: this.newTeam.teamNumber,
        teamName: this.newTeam.teamName,
        teamLeader: '',
        memberCount: 0,
        members: []
      };
      this.teams.push(emptyTeam);
      this.teams.sort((a, b) => a.teamNumber - b.teamNumber);
      this.teamCount = this.teams.length;

      this.notificationService.showNotification(
        Constant.SUCCESS,
        `Đã tạo ${this.newTeam.teamName} thành công. Vui lòng xếp học sinh vào tổ.`
      );
      this.closeAddTeamPopup();
      return;
    }

    // Tạo tổ với tổ trưởng
    const request = {
      classId: this.filterClassId,
      studentIds: studentIds,
      positionIds: positionIds,
      schoolYear: this.currentSchoolYear,
      electionRound: this.currentElectionRound,
      teamName: this.newTeam.teamName
    };

    this.committeeService.createBulk(request).subscribe(() => {
      // Sau khi tạo, cập nhật teamNumber cho tổ trưởng
      this.committeeService.getListByClass(
        this.filterClassId,
        this.currentSchoolYear,
        this.currentElectionRound,
        true
      ).subscribe(committees => {
        this.committees = committees;

        // Tìm committee của tổ trưởng vừa tạo
        const leaderCommittee = committees.find(c => c.studentId === this.newTeam.teamLeaderId);
        if (leaderCommittee) {
          this.committeeService.update({
            id: leaderCommittee.id,
            positionId: leaderCommittee.positionId,
            teamNumber: this.newTeam.teamNumber,
            teamName: this.newTeam.teamName,
            electionRound: this.currentElectionRound,
            responsibilities: leaderCommittee.responsibilities,
            notes: leaderCommittee.notes
          }).subscribe(() => {
            this.notificationService.showNotification(
              Constant.SUCCESS,
              `Đã tạo ${this.newTeam.teamName} với tổ trưởng thành công`
            );
            this.closeAddTeamPopup();
            this.loadData();
          }, () => {
            this.notificationService.showNotification(Constant.ERROR, 'Có lỗi khi cập nhật số tổ');
          });
        } else {
          this.notificationService.showNotification(Constant.SUCCESS, `Đã tạo ${this.newTeam.teamName} thành công`);
          this.closeAddTeamPopup();
          this.loadData();
        }
      });
    }, () => {
      this.notificationService.showNotification(Constant.ERROR, 'Không thể tạo tổ');
    });
  }

  // Tab 2: Xếp học sinh vào tổ
  showAssignStudentPopup() {
    if (this.studentsWithoutTeam.length === 0) {
      this.notificationService.showNotification(Constant.INFO, 'Tất cả học sinh đã được xếp tổ');
      return;
    }

    if (this.teams.length === 0) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng tạo tổ trước khi xếp học sinh');
      return;
    }

    this.isShowAssignStudentPopup = true;
  }

  closeAssignStudentPopup() {
    this.isShowAssignStudentPopup = false;
    this.selectedStudentsToAdd = [];
  }

  assignStudentsToTeam() {
    if (this.selectedStudentsToAdd.length === 0) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng chọn ít nhất một học sinh');
      return;
    }

    if (!this.selectedTeamNumber) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng chọn tổ');
      return;
    }

    // Get team name from existing team (if exists)
    const selectedTeam = this.teams.find(t => t.teamNumber === this.selectedTeamNumber);
    const teamName = selectedTeam?.teamName || `Tổ ${this.selectedTeamNumber}`;

    // selectedStudentsToAdd already contains IDs (keyExpr="id" in the grid)
    const request = {
      classId: this.filterClassId,
      studentIds: this.selectedStudentsToAdd,
      schoolYear: this.currentSchoolYear,
      electionRound: this.currentElectionRound,
      teamName: teamName
    };

    this.committeeService.createBulk(request).subscribe(() => {
      // Reload to get new committee IDs
      this.committeeService.getListByClass(
        this.filterClassId,
        this.currentSchoolYear,
        this.currentElectionRound,
        true
      ).subscribe(committees => {
        this.committees = committees;

        // Update team numbers and team name
        // ✅ FIXED: selectedStudentsToAdd is array of IDs (string[]), not objects
        const promises = this.selectedStudentsToAdd.map((studentId: string) => {
          const committee = this.committees.find(c => c.studentId === studentId);
          if (committee) {
            return this.committeeService.update({
              id: committee.id,
              positionId: committee.positionId,
              teamNumber: this.selectedTeamNumber,
              teamName: teamName,
              electionRound: this.currentElectionRound,
              responsibilities: committee.responsibilities,
              notes: committee.notes
            }).toPromise();
          }
          return Promise.resolve();
        });

        Promise.all(promises).then(() => {
          this.notificationService.showNotification(
            Constant.SUCCESS,
            `Đã xếp ${this.selectedStudentsToAdd.length} học sinh vào ${teamName}`
          );
          this.closeAssignStudentPopup();
          this.loadData();
        }).catch(() => {
          this.notificationService.showNotification(Constant.ERROR, 'Có lỗi khi cập nhật số tổ');
        });
      });
    }, () => {
      this.notificationService.showNotification(Constant.ERROR, 'Không thể xếp học sinh vào tổ');
    });
  }

  // Xóa học sinh khỏi tổ (chuyển về chưa có tổ)
  removeStudentsFromTeam() {
    if (!this.studentGrid || !this.studentGrid.instance) {
      this.notificationService.showNotification(Constant.WARNING, 'Chưa khởi tạo danh sách học sinh');
      return;
    }

    const selectedRows = this.studentGrid.instance.getSelectedRowsData();
    if (selectedRows.length === 0) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng chọn ít nhất một học sinh');
      return;
    }

    const result = confirm(
      `Bạn có chắc chắn muốn bỏ ${selectedRows.length} học sinh khỏi tổ?`,
      'Xác nhận'
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        const committeeIds = selectedRows
          .map((s: any) => this.committees.find(c => c.studentId === s.id))
          .filter(c => c !== undefined)
          .map(c => c!.id);

        if (committeeIds.length > 0) {
          this.committeeService.deactivate({ committeeIds }).subscribe(() => {
            this.notificationService.showNotification(Constant.SUCCESS, 'Đã bỏ học sinh khỏi tổ');
            this.loadData();
            this.studentGrid.instance.clearSelection();
          }, () => {
            this.notificationService.showNotification(Constant.ERROR, 'Không thể bỏ học sinh khỏi tổ');
          });
        }
      }
    });
  }

  getGenderText(sex: number): string {
    return sex === 1 ? 'Nam' : 'Nữ';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
}
