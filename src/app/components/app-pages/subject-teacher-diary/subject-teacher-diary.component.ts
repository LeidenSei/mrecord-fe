import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import notify from 'devextreme/ui/notify';
import {GeneralService} from 'src/app/services/general.service';
import {AuthService, DataService, ScreenService} from "../../../services";
import {AppConfigService} from "../../../app-config.service";
import {NotificationService} from "../../../services/notification.service";
import {AcademicWeek} from "../../../models/academic-week.model";
import {AcademicWeekService} from "../../../services/academic-week.service";
import {LessonDiaryService} from "../../../services/lesson-diary.service";
import {DxTreeListComponent} from "devextreme-angular";
import {forkJoin} from "rxjs";
import {DataGridColumn} from "../../../types/gridColumn";
import {FullNamePipe} from "../../../pipes/full-name.pipe";
import {Constant} from "../../../shared/constants/constant.class";

@Component({
  selector: 'app-subject-teacher-diary',
  templateUrl: './subject-teacher-diary.component.html',
  styleUrls: ['./subject-teacher-diary.component.scss']
})
export class SubjectTeacherDiaryComponent {
  @ViewChild(DxTreeListComponent, {static: false}) treeList!: DxTreeListComponent;
  errorMessage: any;
  filterDate: any;
  lessons = [
    {id: 1, tiet: 1, lop: '7A1', mon: 'Toán', gv: 'Nguyễn Văn A'},
    {id: 2, tiet: 2, lop: '7B1', mon: 'Toán', gv: 'Nguyễn Văn A'},
    {id: 3, tiet: 3, lop: '8A2', mon: 'Toán', gv: 'Nguyễn Văn A'},
    {id: 4, tiet: 4, lop: '9A1', mon: 'Toán', gv: 'Nguyễn Văn A'}
  ];
  classes = [
    {id: '61d505578491e62fb4e390a3', name: '9B'},
    {id: '61d506948491e62fb4e39381', name: '9C'},
    {id: '61d506948491e62fb4e39382', name: '9D'}
  ];

  // Danh sách môn học
  subjects = [
    {id: '4fa8ef4a7bb3251b38c24fb7', name: 'Toán'},
    {id: '4fb0df0c1277d51b1c1adf97', name: 'Vật lí'},
    {id: '4fb0e22d1277d51b1c1adf9b', name: 'Âm nhạc'}
  ];
  dayTimes = [
    {value: 1, text: 'Buổi sáng'},
    {value: 2, text: 'Buổi chiều'}
  ];

  // Tiết học
  periods = [
    {value: 1, text: 'Tiết 1'},
    {value: 2, text: 'Tiết 2'},
    {value: 3, text: 'Tiết 3'},
    {value: 4, text: 'Tiết 4'},
    {value: 5, text: 'Tiết 5'}
  ];
  weeks: AcademicWeek[] = [];
  testDate = new Date();
  weekByDate: AcademicWeek | null = null;

  filterWeek: number = 1;
  popupVisible = false;
  selectedLesson: any = null;

  minDate: any;
  maxDate: any;
  treeScheduleData: any[] = [];
  students: any[] = [];
  selectedSchedule: any;
  filter: any;
  extraSessionArr: any[] = [];
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public lessonDiaryService: LessonDiaryService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private weekService: AcademicWeekService,
              private fullNamePipe: FullNamePipe,
              private ref: ChangeDetectorRef) {
    const url = location.href;

    const urlParams = new URLSearchParams(url.split('?')[1]);
    const token = urlParams.get('token');
    const ischoolToken = this.route.snapshot.paramMap.get('token');
    const studentId = urlParams.get('studentId');
    //alert(localStorage.getItem(Constant.TOKEN));
    if (ischoolToken) {
      let payload = {
        ischoolToken
      }
      this.generalService.mSchoolLogin(payload).subscribe(res => {
        //console.log('ssoLogin', res);
        this.authService.getUserInfo(res.token).subscribe((resInfo: any) => {
          res.fullname = resInfo.name;
          res.schoolName = resInfo.schoolName;
          res.schoolId = resInfo.schoolId;
          res.students = resInfo.students;
          res.toTruongMon = resInfo.toTruongMon;
          res.toTruongMonKhoi = resInfo.toTruongMonKhoi;
          res.classId = resInfo.classId;
          res.isBGH = resInfo.isBGH;
          res.isGVCN = resInfo.isGVCN;
          res.personId = resInfo.id;
          res.currentYear = resInfo.currentYear;
          if (studentId) {
            res.studentId = studentId;
          }
          const result = this.authService.doLogInOnly(res);
          if (!result.isOk) {
            notify(result.message, 'error', 2000);
            this.errorMessage = `${JSON.stringify(payload)}`;
          }
          const start = new Date(resInfo.currentYear, 8, 5);  // 05/09/2025
          const end = new Date(resInfo.currentYear + 1, 4, 31);   // 30/06/2026
          this.minDate = start;
          this.maxDate = end;

          this.weeks = this.weekService.generateWeeks(2025, start, end);
          this.weekByDate = this.weekService.getWeekByDate(this.testDate);

          //console.log(this.weeks, this.weekByDate);
          this.filterWeek = this.weekByDate.weekNo;
          this.filter = {
            schoolId: res.schoolId,
            teacherId: res.personId,
            dateView: new Date()
          };
          this.loadLessons();
          forkJoin([
            this.generalService.getListClassBySchool(resInfo.schoolId),
            this.generalService.getListGradeOfSchool(resInfo.schoolId),
            this.generalService.getListSubjectBySchool(resInfo.schoolId)
          ]).subscribe(([classSource, gradeSource, subjectSource]) => {
            this.classes = classSource;
            this.subjects = subjectSource;
          });
        });
      }, error => {
        this.errorMessage = `${JSON.stringify(error)} ${JSON.stringify(payload)}`;
      });
      this.filterDate = new Date().toISOString()

    }
  }

  ngOnInit(): void {

  }
  loadStudents(classId: string) {
    this.generalService.getListStudentByClass2(classId).subscribe(res => {
      this.students = res;
      let index = 1;
      this.students.forEach(en => {
        en.stt = index++;
        en.name = this.fullNamePipe.transform(en);
      });
    }, error => {
    });
  }
  loadLessons() {
    console.log('Lọc tuần:', this.filterWeek, 'Ngày:', this.filterDate);
    this.filter.dateView = this.filterDate;
    this.lessonDiaryService.getSchedulesByTeacher(this.filter).subscribe(resSchedule => {
      this.lessons = resSchedule;
      this.treeScheduleData = this.toTreeData(resSchedule);
      console.log('schedules', this.treeScheduleData);
      setTimeout(() => {
        const parentIds = this.treeScheduleData
          .map(x => x.id)
          .filter(id => this.treeScheduleData.some(c => c.parentId === id)); // chỉ những node có con

        parentIds.forEach(id => {
          this.treeList.instance.expandRow(id);
        });
      }, 0);
    }, error => {
    });
  }


  openForm(schedule: any) {
    this.selectedSchedule = null;
    this.selectedLesson = {
      scheduleId: schedule ? schedule.id : null,
      classId: null,
      subjectId: null,
      dayTime: null,
      period: null,
      lessonName: '',
      comment: '',
      attendanceScore: 0,
      studyScore: 0,
      disciplineScore: 0,
      cleanlinessScore: 0,
      totalPeriods: 1,
      totalScore: 0,
      isExtraSession: schedule ? false : true,
      absences: [
        { studentId: '124', studentName: 'Nguyễn Văn B', absenceType: 'KP' }
      ]
    };
    if (schedule) {
      this.selectedSchedule = schedule;
      this.loadStudents(schedule.itemData.classId);
      console.log(schedule);
      this.selectedLesson.classId = schedule.itemData.classId;
      this.selectedLesson.subjectId = schedule.itemData.subjectId;
      this.selectedLesson.dayTime = schedule.itemData.dayTime;
      this.selectedLesson.period = schedule.itemData.period;

      if (schedule.lessonData){
        this.selectedLesson.lessonName = schedule.lessonData.lessonName;
        this.selectedLesson.comment = schedule.lessonData.comment;
        this.selectedLesson.attendanceScore = schedule.lessonData.attendanceScore;
        this.selectedLesson.studyScore = schedule.lessonData.studyScore;
        this.selectedLesson.disciplineScore = schedule.lessonData.disciplineScore;
        this.selectedLesson.cleanlinessScore = schedule.lessonData.cleanlinessScore;
        this.selectedLesson.totalPeriods = schedule.lessonData.totalPeriods;
        this.selectedLesson.totalScore = schedule.lessonData.totalScore;
        this.selectedLesson.absences = schedule.lessonData.absences;
      }
    }
    this.popupVisible = true;
  }

  saveLesson() {
    this.notificationService.showNotification(Constant.SUCCESS, 'Lưu thông tin thành công');
    this.popupVisible = false;
    // Map lại text hiển thị từ id/value
    const dayTimeItem = this.dayTimes.find(x => x.value === this.selectedLesson.dayTime);
    const periodItem = this.periods.find(x => x.value === this.selectedLesson.period);
    const subjectItem = this.subjects.find(x => x.id === this.selectedLesson.subjectId);
    const classItem = this.classes.find(x => x.id === this.selectedLesson.classId);

    this.selectedLesson.dayTimeText = dayTimeItem ? dayTimeItem.text : '';
    this.selectedLesson.periodText = periodItem ? periodItem.text : '';
    this.selectedLesson.subjectName = subjectItem ? subjectItem.name : '';
    this.selectedLesson.className = classItem ? classItem.name : '';
    if (this.selectedSchedule) {
      this.selectedSchedule.hasData = true;
      this.selectedSchedule.lessonData = { ...this.selectedLesson };
    } else {
      this.extraSessionArr.push({ ...this.selectedLesson });
    }
  }

  onDateChanged(e: any) {
    this.filterDate = e.value;
    console.log('Ngày đã chọn:', this.filterDate);
    this.weekByDate = this.weekService.getWeekByDate(this.filterDate);
    this.filterWeek = this.weekByDate.weekNo;
    this.loadLessons();
  }

  toTreeData(schedules: any[]): any[] {
    let idCounter = 1;
    const treeData: any[] = [];

    // group theo Buổi
    const byDayTime = this.groupBy(schedules, 'dayTimeText');
    for (const dayTimeText of Object.keys(byDayTime)) {
      const dayTimeId = idCounter++;
      treeData.push({id: dayTimeId, parentId: null, name: dayTimeText});

      // group theo Lớp
      const byClass = this.groupBy(byDayTime[dayTimeText], 'className');
      for (const className of Object.keys(byClass)) {
        const classId = idCounter++;
        treeData.push({id: classId, parentId: dayTimeId, name: `Lớp ${className}`});

        // sắp xếp theo Tiết
        const subjects = byClass[className].sort((a, b) => a.period - b.period);
        for (const sub of subjects) {
          treeData.push({
            id: sub.id,
            parentId: classId,
            name: sub.periodText,
            itemData: sub,
            extra: `${sub.subjectName}`,
            hasData: false
          });
        }
      }
    }
    return treeData;
  }

  onScoreChanged(e: any) {
    // Cập nhật lại tổng điểm mỗi khi thay đổi
    const { attendanceScore, studyScore, disciplineScore, cleanlinessScore } = this.selectedLesson;
    this.selectedLesson.totalScore =
      (attendanceScore || 0) +
      (studyScore * 2 || 0) +
      (disciplineScore || 0) +
      (cleanlinessScore || 0);
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((acc, obj) => {
      const value = obj[key];
      (acc[value] = acc[value] || []).push(obj);
      return acc;
    }, {});
  }
  onClassChanged(e: any) {
    // Cập nhật lại tổng điểm mỗi khi thay đổi
    console.log(e);
  }
  onFormFieldChanged(e: any) {
    if (e.dataField === 'classId') {
      console.log('Class changed:', e.value);

      this.loadStudents(e.value);
      // ví dụ: reset subject khi đổi lớp
      //this.selectedLesson.subjectId = null;
    }
  }
  removeExtraLesson(item: any) {
    this.extraSessionArr = this.extraSessionArr.filter(x => x !== item);
  }
}
