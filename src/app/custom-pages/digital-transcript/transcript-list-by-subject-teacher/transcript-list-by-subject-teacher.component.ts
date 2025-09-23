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


declare const Base64: any;
declare const vgca_sign_xml: any;
declare const vgca_sign_msg: any;

@Component({
  selector: 'app-transcript-list-by-subject-teacher',
  templateUrl: './transcript-list-by-subject-teacher.component.html',
  styleUrls: ['./transcript-list-by-subject-teacher.component.scss']
})
export class TranscriptListBySubjectTeacherComponent implements OnInit {
  isShowEdit = false;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  gradeSource = [];
  subjectSource = [];
  filterSubjectId: any;
  classSource = [];
  filterClassSource = [];
  arrImg = [];
  approveSource = [];
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  isShowUploadTaiLieu = false;
  subject: any;
  multipleApproved = false;

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
  isShowCheckSocket = false;
  isShowConfirmPrincipal = false;
  isShowConfirmRelease = false;
  status20Count = 0;
  status40Count = 0;
  status21Count = 0;
  isShowPopupRequestCancel = false;
  chooseDatas: any[] = [];
  cancelReason: any;
  isTeacher = false;
  staffInfo: any;
  schoolInfo: any;
  isElementary = true;
  selectedItemWithXMLs: any[] = [];
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;
  certBase64: any;
  certPHATHANH_Base64: any;
  isCertPopupVisible: boolean = false;
  certInfo: any;
  private intervalId: any;
  user: any;
  teacherGD: any;
  teacherAssignSource: any[] = [];
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
    this.certInfo = {

    };
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    this.schoolYearSource = this.service.getYearSource();
  };

  ngAfterViewInit() {
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.user = user;
    this.multipleApproved = user.data.isBGH || user.data.role === 2;

    this.isAdmin = user.data.role === 2;
    this.isTeacher = user.data.role === 3;
    this.schoolId = user.data.schoolId;
    //console.log(user);
    forkJoin([
      this.generalService.getSchoolConfig(user.data.schoolId),
      this.generalService.getTeacherGDByMSId(this.filterSchoolYear, user.data.personId),
    ]).subscribe(([schoolInfo, teacherGD]) => {
      //console.log(teacherGD);
      this.schoolInfo = schoolInfo;
      this.isElementary = schoolInfo.type === 1;
      this.applyFilter(teacherGD);
    });
    this.generalService.getStaffById(user.data.personId).subscribe(res => {
      this.staffInfo = res;
    }, error => {

    });
  }
  applyFilter(teacherGD){
    this.teacherGD = teacherGD;
    this.teacherAssignSource = teacherGD.phaN_CONG_GIANG_DAY.filter(en => en.hoC_KY === 2);
    this.subjectSource = this.teacherAssignSource.map(item => ({ name: item.teN_MON, id: item.mA_MON_HOC }))
      .filter((value, index, self) =>
          index === self.findIndex(t =>
            t.name === value.name && t.id === value.id
          )
      );
    this.filterSubjectId = this.subjectSource[0].id;
    const resultClass = this.teacherAssignSource.filter(en => en.mA_MON_HOC === this.filterSubjectId)
      .map(item => ({ name: item.lop, id: item.iD_LOP }))
      .filter((value, index, self) =>
          index === self.findIndex(t =>
            t.name === value.name && t.id === value.id
          )
      );
    this.filterClassSource = this.service.sortClassesByName(resultClass);
    this.filterClassId = this.filterClassSource[0].id;
    this.loadGrid();
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

        const objSubjectTeacherSigned = en.subjectSigns2.find(en => (en.teacherId === this.user.id || en.teacherId === this.user.data.personId) && (en.subjectId === this.filterSubjectId || en.subjectCodeSGD === this.filterSubjectId));
        if (objSubjectTeacherSigned){
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

  complineUrlSource(url) {
    if (url.indexOf('http') === -1) {
      url = this.configService.getConfig().api.mSchoolUrl + '' + url;
    }
    return url;
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
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
  getStatusGVBM(data) {

  }

  schoolYearChange($event) {
    this.filterSchoolYear = +$event.itemData.id;
    this.generalService.getTeacherGDByMSId(this.filterSchoolYear, this.user.data.personId).subscribe(teacherGD => {
      if (teacherGD) {
        this.applyFilter(teacherGD);
      } else {
        this.notificationService.showNotification(Constant.ERROR, `Không có phân công chuyên môn của giáo viên năm năm học ${this.filterSchoolYear} - ${this.filterSchoolYear + 1}`);
        this.datas = [];
        this.filterClassSource = [];
      }
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

  onSign = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    if (!this.staffInfo.vietelClientId || !this.staffInfo.vietelClientSecret || !this.staffInfo.vietelUserId) {
      this.notificationService.showNotification(Constant.ERROR, 'Vui lòng kiểm tra cấu hình chữ ký số trước khi tiến hành ký');
      return;
    }
    this.dataItem = Object.assign({}, e.row.data);
    this.isShowEdit = true;
    //console.log(this.dataItem);
    this.isShowPreview = true;
    if (this.dataItem.status < 20)
      this.pdfUrl = e.row.data.originalFileUrl;
    else if (this.dataItem.status >= 20)
      this.pdfUrl = e.row.data.signedFileUrl;
  };

  doSign() {
    let result = confirm(`Bạn có chắc muốn ký số học bạ với vai trò của GVCN không?`, 'Xác nhận ký');
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
            this.notificationService.showNotification(Constant.ERROR, 'Ký không thành công. Kiểm tra lại thông tin ký số');
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
    this.selectedItems = $event.selectedRowKeys.map(en => en.id);  // Cập nhật hàng được chọn tại client

    this.status20Count = $event.selectedRowKeys.filter(en => en.status == 20).length;
    this.status40Count = $event.selectedRowKeys.filter(en => en.status == 40).length;
    this.status21Count = $event.selectedRowKeys.filter(en => en.status == -21).length;

    this.selectedItemWithXMLs = $event.selectedRowKeys.map(en => ({
      id: en.id,
      studentName: en.studentName,
      xmlContentGVCN: en.xmlContentGVCN,
      xmlContentCBQL: en.xmlContentCBQL,
      tempSignResult: en.tempSignResult
    }));

    console.log('Selected items:', this.selectedItemWithXMLs);
  }

  principalSign() {
    let result = confirm(`Bạn có chắc muốn ký với vai trò của CBQL không?`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        //this.isShowSignLoadingPrincipal = true;
        this.isShowConfirmPrincipal = true;
      }
    });


  }

  async getCTS(type) {
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
        if (type === 'CBQL') {
          this.generalService.getCertBCYInfo({
            certBase64: rv.CertBase64,
          }).subscribe(res => {
            //console.log(res);
            this.isCertPopupVisible = true;
            this.certInfo = res;
            this.certInfo.cert = rv.CertBase64;
          });
        } else if (type === 'PHAT_HANH') {
          let decodeBase64 = '' + Base64.decode(rv.CertBase64);
          //console.log('decodeBase64PHAT_HANH', decodeBase64);
          if (decodeBase64.includes('MST:')) {
            this.certPHATHANH_Base64 = rv.CertBase64;
          } else {
            let result = confirm(`Bạn có chắc đã lấy đúng chứng thư số của nhà trường không`, 'Xác nhận');
            result.then((dialogResult) => {
              if (dialogResult) {
                this.certPHATHANH_Base64 = rv.CertBase64;
              } else {
                this.certPHATHANH_Base64 = '';
              }
            });
          }
        }
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Lấy chứng thư số không thành công');
      }
    });
  }
  doApproveCancel() {
    this.generalService.approveDeleteHocBa({hocbaIds: this.selectedItems}).subscribe(en => {
      if (en.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Hủy học bạ thành công');
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Hủy học bạ không thành công.');
      }
    }, error => {

    });
  }

  downloadTranscripts() {
    var cls = this.filterClassSource.find(en => en.id == this.filterClassId);
    var clsName = this.filterClassId;
    if (cls) {
      clsName = cls.name;
    }
    this.generalService.downloadHocBa({ids: this.selectedItems}).subscribe(blob => {
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `HocBaLop_${clsName}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    }, error => {

    });

  }

  async requestSigned() {
    console.log('this.staffInfo', this.staffInfo);
    if (this.staffInfo && this.staffInfo.signatureProvider === 0){
      await this.doSignedByVietelMySign();
    } else {
      await this.doSignedByBCY();
    }
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
        if (!this.staffInfo.certInfo) {
          this.notificationService.showNotification(Constant.ERROR, 'Vui lòng cấu hình chứng thư số trước khi ký');
          return;
        }
        this.certBase64 = this.staffInfo.certInfo;
        let result = confirm(`Bạn có chắc muốn ký xác nhận học bạ ${this.selectedItemWithXMLs.length} học sinh không?`, 'Xác nhận ký');
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
              cccd: this.staffInfo.vietelUserId,
              subjectId: this.filterSubjectId
            }).subscribe(res => {
              if (res && res.code !== 0){
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
                console.log('payloadSignGVBM', items);
                // Gọi API 1 lần với toàn bộ danh sách đã ký
                this.generalService.signByGVBM_BCY({items: items, subjectId: this.filterSubjectId}).subscribe(res => {
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
  async doSignedByVietelMySign(){
    let result = confirm(`Bạn có chắc muốn ký xác nhận cho ${this.selectedItems.length} học bạ không?`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.startCountdown();
        this.isShowSignLoading = true;
        let payload = {
          ids: this.selectedItems,
          classId: this.filterClassId,
          subjectId: this.filterSubjectId,
        }
        this.generalService.signByGVBMNew(payload, this.isElementary).subscribe(en => {
          this.isShowSignLoading = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Ký số học bạ thành công');
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
  }

  testSigned() {
    const base64String = Base64.encode('<DU_LIEU_HOC_BA Id="data">THONG_TIN_HOC_BA</DU_LIEU_HOC_BA>');
    //alert(base64String);
    const sender = document.getElementById("btn-sign");
    const prms = {
      Base64Content: base64String,
      ReturnSignatureOnly: "true",
      HashAlg: "Sha256",
      XmlDsigForm: "true"
    };
    const json_prms = JSON.stringify(prms);
    vgca_sign_xml(sender, json_prms, (sender: any, res: any) => {
      console.log('ky_so', res, sender);

      let rv = JSON.parse(res);
      console.log('Thong tin RV', rv);
      if (rv.Status == 0) {
        console.log(rv.Signature);
        /*const signature = rv.received_msg.Signature;
        const signedXml = 'this.xmlContent.replace("<CBQL>", `<CBQL>${signature}`)';
        console.log("✅ XML đã ký:", signedXml);*/
      } else {
        alert("❌ Ký lỗi: " + rv.message);
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

  subjectChange($event) {
    this.filterSubjectId = '' + $event.itemData.id;
    //console.log(this.filterSubjectId, this.teacherAssignSource);

     const resultClass = this.teacherAssignSource.filter(en => en.mA_MON_HOC === this.filterSubjectId)
      .map(item => ({ name: item.lop, id: item.iD_LOP }))
      .filter((value, index, self) =>
          index === self.findIndex(t =>
            t.name === value.name && t.id === value.id
          )
      );
    //console.log('this.filterClassSource', this.filterClassSource);
    this.filterClassSource = this.service.sortClassesByName(resultClass);
    this.filterClassId = this.filterClassSource[0].id;
    this.loadGrid();
  }

}
