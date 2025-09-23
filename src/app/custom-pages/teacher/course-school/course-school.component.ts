import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {forkJoin} from 'rxjs';
import {Constant} from "../../../shared/constants/constant.class";

@Component({
  selector: 'app-course-school',
  templateUrl: './course-school.component.html',
  styleUrls: ['./course-school.component.scss']
})
export class CourseSchoolComponent implements OnInit {
  filterGradeSource = ['Tất cả', 6, 7, 8, 9];
  datas = [];
  approveSource = [];
  filterGrade: 0;
  filterSubjectId: any;
  subjectSource = [];
  schoolCourseCount = '';
  currentPage: number = 1;
  totalItem = 0;
  pageSize = 20;
  schoolYearSource: any[] = [];
  filterSchoolYear: number;
  currentYear: number;
  user: any;
  isLoading = true;
  skeletonItems: any[] = [1, 2, 3, 4, 5, 6, 7, 8];
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.subjectSource = [{id: 0, name: 'Tất cả'}];
  };

  async ngOnInit() {
    this.user = await this.authService.getUser();
    this.filterSchoolYear = this.user.data.currentYear;
    this.currentYear = this.user.data.currentYear;
    forkJoin([
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource]) => {
      this.filterGradeSource = gradeSource;
      this.filterGradeSource.unshift('Tất cả');
      this.subjectSource = subjectSource;
      this.subjectSource.unshift({id: 0, name: 'Tất cả'});
      this.loadGrid();
    });
    this.approveSource = [
      {status: -1, name: 'Tất cả'},
      {status: 0, name: 'Chưa duyệt'},
      {status: 10, name: 'Đã duyệt'}
    ]
    this.schoolYearSource = this.service.getYearSource();
  }

  schoolYearChange($event) {
    this.filterSchoolYear = +$event.itemData.id;
    this.loadGrid();
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

  async loadGrid() {
    const user = await this.authService.getUser();
    console.log(user);
    let payload = {
      schoolId: user.data.schoolId,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      schoolYear: this.filterSchoolYear,
      grade: 0,
      subjectId: ''
    };
    if (this.filterGrade > 0)
      payload.grade = this.filterGrade;
    else
      delete payload.grade;

    if (this.filterSubjectId)
      payload.subjectId = this.filterSubjectId;
    else
      delete payload.subjectId;
    this.isLoading = true;
    this.generalService.getKhoaHocTruong(payload).subscribe(res => {
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

  viewBaiGiang(item: any) {
    if (item.baiGiangIds.length) {
      this.router.navigate(['/teacher/lesson-player', item.id, item.baiGiangIds[0], 2]);
    } else if (item.taiLieuIds.length) {
      this.router.navigate(['/teacher/lesson-player', item.id, item.taiLieuIds[0], 1]);
    } else {
      this.notificationService.showNotification(Constant.WARNING, 'Khóa học chưa có bài giảng');
    }
  }
}
