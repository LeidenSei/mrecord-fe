import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {forkJoin} from 'rxjs';
import {Constant} from "../../../shared/constants/constant.class";

@Component({
  selector: 'app-student-school-course',
  templateUrl: './student-school-course.component.html',
  styleUrls: ['./student-school-course.component.scss']
})
export class StudentSchoolCourseComponent implements OnInit {
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
  filterSchoolYear: number;
  schoolYearSource: any[] = [];
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
    const user = await this.authService.getUser();
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource]) => {
      this.filterGradeSource = gradeSource;
      this.filterGradeSource.unshift('Tất cả');
      this.subjectSource = subjectSource;
      this.subjectSource.unshift({id: 0, name: 'Tất cả'});
      this.loadGrid();
    });
    this.schoolYearSource = this.service.getYearSource();
    this.filterSchoolYear = user.data.currentYear;
  }

  async loadGrid() {
    this.isLoading = true;
    const user = await this.authService.getUser();
    let payload = {
      schoolId: user.data.schoolId,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      schoolYear: this.filterSchoolYear,
      studentId: user.data.studentId,
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
    this.generalService.getKhoaHocTruong(payload).subscribe(res => {
      this.isLoading = false;
      this.datas = res.items;
      this.totalItem = res.totalCount;
      this.schoolCourseCount = ` (${res.totalCount} khóa học)`;
      this.datas.forEach(en => {
        let i =  this.extractNumbersAsString(en.id) % 14 + 1;
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
  viewDetail(data: any) {
    /*if (data.loaiHocLieu === 2) {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 2]);
    } else {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 1]);
    }*/
  }

  viewBaiGiang(item: any) {
    if (item.baiGiangIds.length){
      this.router.navigate(['/student/lesson-view', item.id, item.baiGiangIds[0], 2]);
    } else if (item.taiLieuIds.length){
      this.router.navigate(['/student/lesson-view', item.id, item.taiLieuIds[0], 1]);
    } else {
      this.notificationService.showNotification(Constant.WARNING, 'Khóa học chưa có bài giảng');
    }
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
  schoolYearChange($event) {
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
