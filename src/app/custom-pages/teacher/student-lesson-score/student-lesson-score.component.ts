import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AppConfigService} from "../../../app-config.service";
import CustomStore from "devextreme/data/custom_store";
import {LoadOptions} from "devextreme/data";
import {confirm} from "devextreme/ui/dialog"
import { Subject } from 'rxjs';
export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}
import { debounceTime } from 'rxjs/operators';
import {lastValueFrom} from 'rxjs';
@Component({
  selector: 'app-student-lesson-score',
  templateUrl: './student-lesson-score.component.html',
  styleUrls: ['./student-lesson-score.component.scss']
})
export class StudentLessonScoreComponent implements OnInit {
  getSizeQualifier = getSizeQualifier;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  subjectSource = [];
  classSource = [];
  arrImg = [];
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  subject: any;

  filterStatus: -1;
  filterClassIds = [];
  user: any;
  filterSubjectItems = [];
  filterSubjectId: any;
  dataSource: any;

  tabSource = [];
  tabClassSource = [];
  tabClassId: any;
  tabClassIndex: number;
  studentResults = [];
  selectedResult: any;
  isShowClassResultView = false;

  baiGiangItem: any;
  viewResultTitle: any;
  readonly allowedPageSizes = this.service.getAllowPageSizes();
  private searchSubject = new Subject<string>();
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;
  filterKeyword: any;
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {
      imageUrls: [],
      files: []
    };
    this.editTitle = 'Thêm mới bài tập';
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    for (let i = 1; i <= 15; i++) {
      this.arrImg.push(`https://mschool.edu.vn/media/lms/${i}.png`);
    }
    this.tabClassIndex = 0;
    this.selectedResult = {
      result: null
    };

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(searchText => {
      this.loadGrid();
    });
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    this.user = await this.authService.getUser();
    const user = this.user;
    forkJoin([
      this.generalService.getListSubjectByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
      this.generalService.getListByTTCM(),
      this.generalService.getListSubjectBySchool(user.data.schoolId)
    ]).subscribe(([subjectSource, classSource, schoolClassSource, ttcmClassSource, schoolSubjectSource]) => {
      console.log('ttcmClassSource', ttcmClassSource);

      this.classSource = user.data.role === 2 ? schoolClassSource : classSource;

      if (user.data.role !== 2) {
        this.subjectSource = subjectSource;
        this.filterSubjectItems = subjectSource.map(en => {
          return {text: en.name, id: en.id}
        });

        this.filterSubjectItems.unshift({text: 'Tất cả', id: ''});
        if (this.user.data.toTruongMon.length || this.user.data.toTruongMonKhoi.length) {
          this.classSource = ttcmClassSource;
        }
      } else {
        /*this.subjectSource = schoolSubjectSource;
        this.filterSubjectItems = schoolSubjectSource.map(en => {
          return {text: en.name, id: en.id}
        });*/
        schoolSubjectSource.forEach(en => {
          this.filterSubjectItems.unshift({text: en.name, id: en.id});
        });
        this.filterSubjectItems.unshift({text: 'Tất cả', id: ''});
      }
      this.filterSubjectId = '';
      this.loadGrid();
    });
  }

  async loadGrid() {
    const authService = this.authService;
    const generalService = this.generalService;
    const filterSubjectId = this.filterSubjectId;
    const filterClassIds = this.filterClassIds;
    const filterKeyword  = this.filterKeyword;
    this.dataSource = new CustomStore({
      async load(loadOptions: LoadOptions) {
        try {
          const user = await authService.getUser();
          let subjectId = filterSubjectId;
          //console.log(subjectId)
          let payload = {
            pageNumber: (loadOptions.skip / loadOptions.take) + 1,
            pageSize: loadOptions.take,

            subjectId: subjectId,
            schoolId: user.data.schoolId,
            classIds: filterClassIds,
            teacherId: user.data.id,
            keyword: filterKeyword ? filterKeyword : ''
          };
          if (!filterSubjectId) {
            delete payload.subjectId;
          }
          let result = await lastValueFrom(generalService.getBaiGiangViewKetQua(payload));
          let index = 1;
          // @ts-ignore
          result.items.forEach(en => {
            en.stt = loadOptions.skip + index++;
          });

          return {
            // @ts-ignore
            data: result.items,
            // @ts-ignore
            totalCount: result.totalCount,
            /*summary: 10000,
            groupCount: 10,*/
          };
        } catch (err) {
          console.log(err);
        }
      }
    })
  }
  tabSubjectChange($event) {
    this.filterSubjectId = $event.itemData.id;
    this.loadGrid();
  }
  doFilterClass($event) {
    this.loadGrid();
  }
  viewKetQua(data: any, classId = '') {
    let cls = classId ? data.classes.find(en => en.id === classId) : data.classes[0];
    this.viewResultTitle = `Kết quả làm bài lớp ${cls.name} học liệu: ${data.name.toUpperCase()} `;
    this.baiGiangItem = data;
    this.baiGiangItem.selectedClassId = cls.id;
    this.isShowClassResultView = true;
    //alert(classId);
    //this.router.navigate(['/teacher/teacher-course', id, name]);
  }

  doFilterKeyword($event) {
    this.filterKeyword = $event;
    this.searchSubject.next($event);
  }
}
