import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {confirm} from "devextreme/ui/dialog";
import {forkJoin} from 'rxjs';
import {FullNamePipe} from "../../../pipes/full-name.pipe";

@Component({
  selector: 'app-subject-role-approve',
  templateUrl: './subject-role-approve.component.html',
  styleUrls: ['./subject-role-approve.component.scss']
})
export class SubjectRoleApproveComponent implements OnInit {
  isShowConfig = false;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  gradeSource = [];
  ttcmGradeSource = [];
  subjectSource = [];
  classSource = [];
  teacherSource = [];
  arrImg = [];

  filterGrade: 0;
  filterStatus: -1;
  filterClassIds = [];
  filterClassId: any;
  studentCount: 0;
  user: any;
  ttcmKhoiItems: any[] = [];
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              public fullNamePie: FullNamePipe,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {};
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    this.user = await this.authService.getUser();
    forkJoin([
      this.generalService.getListTeacherBySchool(this.user.data.schoolId),
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
    ]).subscribe(([teacherSource, gradeSource]) => {
      this.teacherSource = teacherSource.filter(en => en.staffType === 1);
      this.gradeSource = gradeSource;
      this.teacherSource.forEach(en => {
        en.fullName = this.fullNamePie.transform(en);
      });
    });
    this.loadGrid();
  }

  async loadGrid() {
    this.generalService.getListSubjectWithTTCM(this.user.data.schoolId).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      this.datas.forEach(en => {
        en.stt = index++;
        en.className = this.classSource.find(x => x.id === en.classId)?.name;
      });
    }, error => {
    });
  }


  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    this.isShowConfig = true;
    this.ttcmGradeSource = [];
    let ttcmKhois = this.dataItem.ttcmKhois ? this.dataItem.ttcmKhois : [];
    this.gradeSource.forEach(grade => {
      const item = ttcmKhois.find(en => en.grade === grade);
      let teacherId = item ? item.teacherId : '';
      this.ttcmGradeSource.push({grade, teacherId});
    });
  };

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  saveHomeWork(isShowConfig) {

  }

  closePopupEdit() {
    this.isShowConfig = false;
  }

  classChange($event) {
    this.filterClassId = $event.itemData.id;
    this.loadGrid();
  }

  getPhoneStudent(data) {
    if (data.contacts) {
      let contact = data.contacts.find(en => en.mainContact);
      if (contact) return contact.value;
    }
    return '';
  }

  changeTTCM($event, data) {
    data.changed = true;
    //data.ttcmId = $event;
  }

  saveTTCMKhoi() {
    console.log(this.gradeSource);
    let payload = {
      schoolId: this.user.data.schoolId,
      subjectId: this.dataItem.id,
      teacherGrades: this.ttcmGradeSource.filter(en => en.teacherId)
    };
    this.generalService.updateTTCMKhoi(payload).subscribe(res => {
      if (res) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật nhóm chuyên môn thành công');
        this.isShowConfig = false;
        this.loadGrid();
      }
    }, error => {
    });
  }

  closeConfig() {
    this.isShowConfig = false;
  }

  saveTTCM(data) {
    const teacherId = data.ttcmId;
    let payload = {
      schoolId: this.user.data.schoolId,
      subjectId: data.id,
      leaderId: teacherId
    };
    data.changed = false;
    this.generalService.updateTTCM(payload).subscribe(res => {
      if (res) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật tổ trưởng chuyên môn thành công');
        this.loadGrid();
      }
    }, error => {
    });
  }
}
