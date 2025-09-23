import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {forkJoin} from 'rxjs';
import {Constant} from "../../../shared/constants/constant.class";

@Component({
  selector: 'app-student-class-course',
  templateUrl: './student-class-course.component.html',
  styleUrls: ['./student-class-course.component.scss']
})
export class StudentClassCourseComponent implements OnInit {
  filterGradeSource = ['Tất cả', 6, 7, 8, 9];
  datas = [];
  approveSource = [];
  filterGrade: 0;
  filterSubjectId: any;
  filterStatus = 0;
  subjectSource = [];
  schoolCourseCount = '';
  currentPage: number = 1;
  totalItem = 0;
  pageSize = 20;
  statusSource = [];
  selectedIndexStatus = 0;
  filterSchoolYear: number;
  schoolYearSource: any[] = [];
  isLoading = true;
  skeletonItems: any[] = [1, 2, 3, 4, 5, 6, 7, 8];
  user: any;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.subjectSource = [{id: 0, name: 'Môn học'}];

  };

  async ngOnInit() {
    this.user = await this.authService.getUser();
    forkJoin([
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
      this.service.getStudyStatus(),
    ]).subscribe(([gradeSource, subjectSource, studyStatus]) => {
      this.filterGradeSource = gradeSource;
      this.subjectSource = subjectSource;
      this.subjectSource.unshift({id: 0, name: 'Môn học'});
      if (studyStatus) {
        this.filterStatus = +studyStatus;
      }
      this.loadGrid(true);
    });
    this.schoolYearSource = this.service.getYearSource();
    this.filterSchoolYear = this.user.data.currentYear;
  }

  customStatusFormat = (value: number) => {
    return `Đã hoàn thành ${Math.round(value * 100)}%`;
  }

  async loadGrid(firstTime = false) {
    this.isLoading = true;
    const user = await this.authService.getUser();
    console.log(user);
    let payload = {
      schoolId: user.data.schoolId,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      subjectId: '',
      classId: user.data.classId,
      studentId: user.data.studentId,
      trangThaiHoc: this.filterStatus,
      schoolYear: this.filterSchoolYear
    }
    if (this.filterSubjectId)
      payload.subjectId = this.filterSubjectId;
    else
      delete payload.subjectId;
    this.generalService.getKhoaHocLop(payload).subscribe(res => {
      //Neu lan dau va chua co bai dang hoc thi ve tab Chua hoc
      if (firstTime && res.trangThaiHocCount.DangHoc === 0) {
        this.filterStatus = 0;
        this.loadGrid();
        return;
      }
      this.isLoading = false;
      this.datas = res.items;
      this.totalItem = res.totalCount;
      this.schoolCourseCount = ` (${res.totalCount} khóa học)`;
      this.datas.forEach(en => {
        let i = this.extractNumbersAsString(en.id) % 14 + 1;
        if (!en.anhDaiDien) {
          en.anhDaiDien = `https://mschool.edu.vn/media/lms/${i}.png`;
        }
      });
      console.log(this.filterStatus);

      this.statusSource = [
        {text: `Chưa học (${res.trangThaiHocCount.ChuaHoc})`, id: 0},
        {text: `Đang học (${res.trangThaiHocCount.DangHoc})`, id: 1},
        {text: `Đã học (${res.trangThaiHocCount.DaHoanThanh})`, id: 2},
      ];
      setTimeout(() => {
        this.selectedIndexStatus = this.filterStatus;
      }, 0);
    }, error => {
    });
  }

  extractNumbersAsString(str) {
    return str.replace(/\D/g, '');
  }

  pageChange($event) {
    this.currentPage = $event;
    console.log($event);
    this.loadGrid();
  }

  viewDetail(data: any) {
    /*if (data.loaiHocLieu === 2) {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 2]);
    } else {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 1]);
    }*/
  }

  viewBaiGiang(item: any) {
    console.log(item);
    this.generalService.getLessonNoResultByCourse(item.id, this.user.data.studentId).subscribe(res => {
      if (res) {
        const baiGiangIds = res.map(en => en.id);
        if (baiGiangIds.length) {
          this.router.navigate(['/student/lesson-view', item.id, baiGiangIds[0], 2]);
        } else if (item.baiGiangIds.length) {
          this.router.navigate(['/student/lesson-view', item.id, item.baiGiangIds[0], 2]);
        } else if (item.taiLieuIds.length) {
          this.router.navigate(['/student/lesson-view', item.id, item.taiLieuIds[0], 1]);
        } else {
          this.notificationService.showNotification(Constant.WARNING, 'Khóa học chưa có bài giảng');
        }
      } else {

      }
    }, error => {
    });
  }

  subjectChange($event: any) {
    console.log($event);
    this.filterSubjectId = $event.itemData.id;
    this.currentPage = 1;
    this.loadGrid();
  }

  gradeChange($event: any) {
    console.log($event);
    this.filterGrade = $event.itemData;
    this.currentPage = 1;
    this.loadGrid();
  }

  tabStatusChange($event) {
    console.log($event);
    this.filterStatus = +$event.itemData.id;
    localStorage.setItem('study_status', `${this.filterStatus}`);
    this.loadGrid();
  }

  schoolYearChange($event) {
    console.log($event);
    this.filterSchoolYear = +$event.itemData.id;
    this.loadGrid();
  }

  getRandomWidth(): string {
    const min = 50;
    const max = 90;
    const randomWidth = Math.floor(Math.random() * (max - min + 1)) + min;
    return `${randomWidth}%`;
  }
}
