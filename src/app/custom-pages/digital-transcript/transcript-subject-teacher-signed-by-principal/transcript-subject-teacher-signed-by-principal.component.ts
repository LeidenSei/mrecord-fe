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
import {ExportingEvent} from "devextreme/ui/data_grid";
import {Workbook} from "exceljs";
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";
import {saveAs} from 'file-saver-es';
import {FullNamePipe} from "../../../pipes/full-name.pipe";

declare const vgca_sign_msg: any;


@Component({
  selector: 'app-transcript-subject-teacher-signed-by-principal',
  templateUrl: './transcript-subject-teacher-signed-by-principal.component.html',
  styleUrls: ['./transcript-subject-teacher-signed-by-principal.component.scss']
})
export class TranscriptSubjectTeacherSignedByPrincipalComponent implements OnInit {
  isShowEdit = false;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  gradeSource = [];
  subjectSource = [];
  classSource = [];
  filterClassSource = [];
  arrImg = [];
  approveSource = [];
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  isShowUploadTaiLieu = false;
  subject: any;
  multiple = false;
  filterTeacherId: any;
  filterSubjectId: any;
  filterGrade: 0;
  filterStatus: -1;
  filterClassIds = [];
  schoolId: any;
  filterClassId: any;
  studentCount: 0;
  isAdmin = false;
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  filterSchoolYear = 2024;
  schoolYearSource: any[] = [];
  pdfUrl: any = '';
  isShowPreview = false;
  isShowSignLoading = false;

  countdown: number = 100; // 1 phút 30 giây
  countdownDisplay: string = '01:40';
  selectedItems: any[] = [];
  isShowSignLoadingPrincipal = false;
  isShowClassResultView = false;
  user: any;
  studentSource = [];
  selectedData: any;
  signInfos: any[] = [];
  signInfo: any;
  schoolInfo: any;
  isElementary = false;
  classMarkTitle: any;
  isShowClassResultViewC2 = false;
  staffInfo: any = {};

  isShowCheckSocket = false;
  isShowConfirmPrincipal = false;
  certBase64: any;
  isCertPopupVisible: boolean = false;
  certInfo: any;

  teacherSource: any[] = [];
  teacherAssignSource: any[] = [];
  msTeacherId: any;
  cccd: any;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;
  private intervalId: any;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private fullNamePipe: FullNamePipe,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {
      imageUrls: [],
      files: []
    };
    this.signInfos = [];
    this.signInfo = {};
    this.certInfo = {};
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    this.schoolYearSource = this.service.getYearSource();
    this.classMarkTitle = 'Điểm môn học';
  };

  ngAfterViewInit() {
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.user = user;
    this.schoolId = user.data.schoolId;
    this.generalService.getListTeacherGDBySchoolYear(this.user.data.schoolId, this.filterSchoolYear).subscribe(res => {
      let teachers = res.filter(en => en.phaN_CONG_GIANG_DAY && en.phaN_CONG_GIANG_DAY.length > 0);
      teachers.forEach(stf => {
        stf.name = stf.hO_TEN;
        stf.cccd = stf.mA_SO_DINH_DANH_CA_NHAN;
      })
      this.teacherSource = teachers;
    }, error => {
    });
    //this.chooseTeacher(user);
  }

  async loadGrid() {
    this.generalService.getListHocBaByClassGDId(this.schoolId, this.filterClassId, this.filterSchoolYear).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      console.log(this.datas[0].subjectSigns2);
      this.datas.forEach(en => {
        en.stt = index++;
        en.statusGVCN = en.status >= 20 ? 'Đã ký' : 'Chưa ký';
        en.statusHieuTruong = en.status >= 40 ? 'Đã ký' : 'Chưa ký';
        en.statusRelease = en.status == 50 ? 'Đã ký' : 'Chưa ký';
        en.signedFileUrl = 'https://media.mschool.edu.vn' + en.signedFileUrl + '?v=' + new Date().getMilliseconds();
        en.originalFileUrl = 'https://media.mschool.edu.vn' + en.originalFileUrl + '?v=' + new Date().getMilliseconds();

        console.log(this.filterTeacherId, this.filterSubjectId);
        const objSubjectTeacherSigned = en.subjectSigns2.find(en => (en.teacherId === this.msTeacherId) && (en.subjectId === this.filterSubjectId || en.subjectCodeSGD === this.filterSubjectId));
        if (objSubjectTeacherSigned) {
          en.statusGVBM = true;
          en.xmlFile = en.originalFileUrl.replace('.pdf', `_${objSubjectTeacherSigned.teacherCCCD}_${objSubjectTeacherSigned.subjectCodeSGD}.xml`) + '?v=' + new Date().getMilliseconds();
        } else {
          en.statusGVCN = false;
          en.xmlFile = '';
        }

        let replaceTo = '.xml';
        switch (en.status) {
          case 50:
            replaceTo = '_release.xml';
            break;
          case 40:
            replaceTo = '_cbql.xml';
            break;
          case 20:
            replaceTo = '_gvcn.xml';
            break;
        }
      });
    }, error => {
    });
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  teacherChange($event) {
    this.filterTeacherId = $event.itemData.id;
    this.teacherAssignSource = $event.itemData.phaN_CONG_GIANG_DAY.filter(en => en.hoC_KY === 2);
    this.subjectSource = this.teacherAssignSource.map(item => ({name: item.teN_MON, id: item.mA_MON_HOC}))
      .filter((value, index, self) =>
          index === self.findIndex(t =>
            t.name === value.name && t.id === value.id
          )
      );
    this.filterSubjectId = this.subjectSource[0].id;
    this.generalService.getTeacherMSByGDId(this.filterSchoolYear, this.filterTeacherId).subscribe(resTeacher => {
      console.log(resTeacher);
      this.msTeacherId = resTeacher.id;
      this.cccd = resTeacher.vietelUserId;
    }, error => {

    });
    this.selectSubject();
  }

  subjectChange($event) {
    this.filterSubjectId = $event.itemData.id;
    this.selectSubject();
  }

  selectSubject() {
    console.log(this.filterSubjectId);
    const sortResult = this.teacherAssignSource.filter(en => en.mA_MON_HOC === this.filterSubjectId)
      .map(item => ({name: item.lop, id: item.iD_LOP}));
    const resultClass = sortResult
      .filter((value, index, self) =>
          index === self.findIndex(t =>
            t.name === value.name && t.id === value.id
          )
      );
    const sortedClass = this.service.sortClassesByName(resultClass);
    this.filterClassSource = sortedClass;
    this.filterClassId = resultClass[0].id;
    this.loadGrid();
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

  schoolYearChange($event) {
    this.filterSchoolYear = +$event.itemData.id;
    this.generalService.getListTeacherGDBySchoolYear(this.user.data.schoolId, this.filterSchoolYear).subscribe(res => {
      let teachers = res.filter(en => en.phaN_CONG_GIANG_DAY && en.phaN_CONG_GIANG_DAY.length > 0);
      teachers.forEach(stf => {
        stf.name = stf.hO_TEN;
        stf.cccd = stf.mA_SO_DINH_DANH_CA_NHAN;
      })
      this.teacherSource = teachers;
      this.loadGrid();
    }, error => {
    });
  }

  onExporting(e: ExportingEvent) {
    /*const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');*/
    let cls = this.classSource.find(en => en.id === this.filterClassId);
    let clsName = cls.name.toUpperCase();
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('DsHocSinh');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], {type: 'application/octet-stream'}), `DS_HOCSINH_LOP_${clsName}.xlsx`);
      });
    });
    e.cancel = true;
  }

  changeUsingServiceLMS(data: any, $event) {
    let payload = {
      studentId: data.id,
      status: $event
    }
    this.generalService.updateStudentStatus(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật trạng thái thành công');
      this.loadGrid();
    }, error => {

    });
  }

  changeUsingServiceMS(data: any, $event) {
    let payload = {
      studentId: data.id,
      status: $event
    }
    this.generalService.updateStudentStatusMS(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật trạng thái thành công');
      this.loadGrid();
    }, error => {

    });
  }

  onCreate = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
  };
  onSign = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    let result = confirm(`Bạn có chắc muốn ký xác nhận điểm môn học không?`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.startCountdown();
        this.isShowSignLoading = true;
        this.generalService.signByGVBM(this.dataItem.classId, this.filterSubjectId).subscribe(en => {
          this.isShowSignLoading = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Xác thực ký thành công');
            this.loadGrid();
            clearInterval(this.intervalId);
          } else if (en.code === 100) {
            this.notificationService.showNotification(Constant.ERROR, en.message);
            clearInterval(this.intervalId);
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Ký không thành công. Kiểm tra lại thông tin ký số');
            clearInterval(this.intervalId);
          }
        }, error => {

        });
      }
    });

  };

  doSign() {
    let result = confirm(`Bạn có chắc muốn ký số học bạ của học sinh ${this.dataItem.studentName} không`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.startCountdown();
        this.isShowSignLoading = true;
        this.generalService.signByGVCN(this.dataItem.id, this.isElementary).subscribe(en => {
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Ký số thành công');
            this.isShowPreview = false;
            this.isShowSignLoading = false;
            this.loadGrid();
            clearInterval(this.intervalId);
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Ký số không thành công. Kiểm tra lại thông tin ký số');
            clearInterval(this.intervalId);
            this.isShowSignLoading = false;
          }
        }, error => {

        });
      }
    });
  }

  startCountdown() {
    this.countdown = 100;
    this.updateDisplay();
    this.intervalId = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.updateDisplay();
      } else {
        clearInterval(this.intervalId);
        // TODO: gọi hàm xử lý hết giờ nếu cần
        this.isShowSignLoading = false;
      }
    }, 1000);
  }

  updateDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.countdownDisplay = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  handleCloseLoading() {
    clearInterval(this.intervalId);
    this.isShowSignLoading = false;
  }

  handleSelectionChange($event) {
    this.selectedItems = $event.selectedRowKeys.map(en => en.id);
  }

  showDetail(data: any) {
    console.log(data);
    this.classMarkTitle = `Điểm môn học ${data.subjectName}`;
    this.selectedData = data;
    if (this.isElementary) {
      this.generalService.getDiemGVBMChiTiet(this.schoolId, this.user.data.personId, this.filterSchoolYear, this.filterSubjectId, data.classId).subscribe(res => {
        this.studentSource = res.lst;
        this.signInfo = res.signInfo;
        this.isShowClassResultView = true;
        let index = 1;
        this.studentSource.forEach(en => {
          en.stt = index++;
        });
      }, error => {
      });
    } else {
      this.generalService.getDiemGVBMChiTietC2(this.schoolId, this.user.data.personId, this.filterSchoolYear, this.filterSubjectId, data.classId).subscribe(res => {
        this.studentSource = res.lst;
        this.signInfos = res.signInfos;
        console.log('this.signInfos', this.signInfos);
        this.isShowClassResultViewC2 = true;
        let index = 1;
        this.studentSource.forEach(en => {
          en.stt = index++;
        });
      }, error => {
      });
    }
  }

  async requestSigned() {
    await this.doSignedByBCY();
  }

  async doSignedByBCY() {
    this.isShowCheckSocket = true;
    this.checkVGCASocketAvailable().then(isAvailable => {
      this.isShowCheckSocket = false;
      if (!isAvailable) {
        alert("⚠️ Không kết nối được phần mềm ký số Ban Cơ yếu (VGCA Sign Service).\nVui lòng mở lại phần mềm hoặc kiểm tra cài đặt.");
        return;
      } else {
        //console.log('this.certBase64', this.certCQBL_Base64);
        if (!this.certBase64) {
          this.notificationService.showNotification(Constant.ERROR, 'Vui lòng cấu hình chứng thư số trước khi ký');
          return;
        }
        let result = confirm(`Bạn có chắc muốn ký xác nhận học bạ ${this.selectedItems.length} học sinh không?`, 'Xác nhận ký');
        result.then((dialogResult) => {
          if (dialogResult) {
            this.isShowConfirmPrincipal = false;
            this.isShowSignLoadingPrincipal = true;
            const sender = document.getElementById("btn-sign");
            if (!this.certBase64) {
              this.notificationService.showNotification(Constant.ERROR, 'Không tìm thấy chứng thư số');
              return;
            }
            this.generalService.prepareHashBCY({
              hocbaIds: this.selectedItems,
              certBase64: this.certBase64,
              signatureTag: 'GVBM',
              cccd: this.cccd,
              subjectId: this.filterSubjectId
            }).subscribe(res => {
              if (res && res.code !== 0) {
                this.notificationService.showNotification(Constant.ERROR, res.message);
                this.isShowSignLoadingPrincipal = false;
                return;
              }
              let lstHocBaHash = res.datas;
              if (!lstHocBaHash.length) {
                this.notificationService.showNotification(Constant.ERROR, 'Ký số thất bại. Kiểm tra lại chứng thư số');
                this.isShowSignLoadingPrincipal = false;
                return;
              }
              const promises = lstHocBaHash.map(hocBaHashItem => {
                return new Promise<{
                  hocbaId: string,
                  signature: string,
                  certBase64: string,
                  tempFile: string
                }>((resolve, reject) => {
                  const hash_value = hocBaHashItem.hashValue;
                  const prms = {};
                  const hash_alg = "SHA256";
                  prms["HashAlg"] = hash_alg;
                  prms["HashValue"] = hash_value;
                  prms["Encode"] = "RSA";
                  let json_prms = JSON.stringify(prms);

                  vgca_sign_msg(sender, json_prms, (sender: any, res: any) => {
                    const rv = JSON.parse(res);
                    console.log('vgca_sign_msg', rv);
                    if (rv && rv.Status === 0) {
                      resolve({
                        hocbaId: hocBaHashItem.id,
                        signature: rv.Signature,
                        certBase64: rv.CertBase64,
                        tempFile: hocBaHashItem.tempFile
                      });
                    } else {
                      reject(`Ký thất bại cho học bạ ${hocBaHashItem.id}`);
                    }
                  });
                });
              });
              Promise.all(promises).then(results => {
                // Sau khi tất cả học bạ đều được ký thành công
                const items = results.map(r => ({
                  hocbaId: r.hocbaId,
                  signatureValue: r.signature,
                  certBase64: r.certBase64,
                  tempFile: r.tempFile
                }));
                console.log('signAsSubjectTeacherPayload', items);
                // Gọi API 1 lần với toàn bộ danh sách đã ký
                this.generalService.signAsSubjectTeacher({
                  items: items,
                  subjectId: this.filterSubjectId,
                  teacherId: this.msTeacherId
                }).subscribe(res => {
                  this.isShowSignLoadingPrincipal = false;
                  if (res.code === 0) {
                    this.loadGrid();
                    this.notificationService.showNotification(Constant.SUCCESS, 'Ký thành công tất cả học bạ');
                  } else {
                    this.notificationService.showNotification(Constant.ERROR, 'Ký thất bại: ' + res.message);
                  }
                });
              }).catch(err => {
                this.notificationService.showNotification(Constant.ERROR, err);
              });
            }, error => {

            });
          }
        });
      }
    });
  }

  checkVGCASocketAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const socket = new WebSocket("wss://127.0.0.1:8987/SignXML");

        socket.onerror = function () {
          console.warn("❌ Không kết nối được VGCA Sign Service (WebSocket)");
          resolve(false);
        };

        socket.onopen = function () {
          console.log("✅ Kết nối VGCA Sign Service thành công");
          socket.close();
          resolve(true);
        };

        // Dự phòng timeout nếu không phản hồi
        setTimeout(() => {
          resolve(false);
        }, 3000);
      } catch (e) {
        console.error("❌ Lỗi khi kiểm tra WebSocket VGCA:", e);
        resolve(false);
      }
    });
  }

  async getCTS() {
    const sender = document.getElementById("btn-sign");
    const prms = {};
    const hash_alg = "SHA256";
    prms["HashAlg"] = hash_alg;
    prms["HashValue"] = 'nxUr1a6P0JXEBtmpNRwJPy/Twc+22fIeqh1R9jYVqmA=';
    prms["Encode"] = "RSA";
    let json_prms = JSON.stringify(prms);

    vgca_sign_msg(sender, json_prms, (sender: any, res: any) => {
      let rv = JSON.parse(res);
      if (rv && rv.Status == 0) {
        this.generalService.getCertBCYInfo({
          certBase64: rv.CertBase64,
        }).subscribe(res => {
          //console.log(res);
          this.isCertPopupVisible = true;
          this.certInfo = res;
          this.certInfo.cert = rv.CertBase64;
        });
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Lấy chứng thư số không thành công');
      }
    });
  }

  confirmCert() {
    this.certBase64 = this.certInfo.cert;
    this.isCertPopupVisible = false;
  }

  cancelCert() {
    this.isCertPopupVisible = false;
    this.certBase64 = '';
  }
}
