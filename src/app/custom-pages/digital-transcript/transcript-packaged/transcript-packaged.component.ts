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
import { saveAs } from 'file-saver-es';
import {FullNamePipe} from "../../../pipes/full-name.pipe";
declare const Base64: any;
declare const vgca_sign_xml: any;
declare const vgca_sign_msg: any;
@Component({
  selector: 'app-transcript-packaged',
  templateUrl: './transcript-packaged.component.html',
  styleUrls: ['./transcript-packaged.component.scss']
})
export class TranscriptPackagedComponent implements OnInit {
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
  private intervalId: any;
  selectedItems: any[] = [];
  isShowSignLoadingPrincipal = false;

  signedCount = 0;
  syncedCount = 0;
  recallCount = 0;

  certCQBL_Base64: any;
  certPHATHANH_Base64: any;
  isCertPopupVisible: boolean = false;
  certInfo: any;
  isShowCheckSocket = false;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

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
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    this.schoolYearSource = this.service.getYearSource();
    this.certInfo = {

    };
  };

  ngAfterViewInit() {
  }

  async ngOnInit() {

    const user = await this.authService.getUser();
    this.multipleApproved = user.data.isBGH || user.data.role === 2;
    this.isAdmin = user.data.role === 2;
    this.schoolId = user.data.schoolId;
    //console.log(user);
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, classSource, schoolClassSource]) => {
      this.subjectSource = subjectSource;
      this.classSource = (user.data.role === 2 || user.data.isBGH) ? schoolClassSource : classSource;
      let filterGradeIds = classSource.map(en => en.grade);
      //console.log(this.classSource, filterGradeIds);
      if (user.data.role === 2 || user.data.isBGH) {
        this.gradeSource = gradeSource.filter(en => 1 === 1);
      } else {
        this.gradeSource = gradeSource.filter(en => filterGradeIds.includes(en));
      }
      this.filterGrade = this.gradeSource[0];
      if (this.filterGrade) {
        this.filterClassSource = this.classSource.filter(en => en.grade === this.filterGrade);
      } else {
        this.filterClassSource = this.classSource.filter(en => 1 === 1);
      }
      this.filterClassId = this.filterClassSource[0].id;
      this.loadGrid();
    });
  }

  async loadGrid() {
    this.generalService.getListPackage(this.schoolId, this.filterClassId, this.filterSchoolYear).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      this.datas.forEach(en => {
        en.stt = index++;
        en.hocbaCount = `${en.hocBaIds.length}`;
        en.xmlUrl = 'https://media.mschool.edu.vn' + en.xmlPath + '?v=' + new Date().getMilliseconds();
        if (en.signed){
          en.xmlUrl = en.xmlUrl.replace('.xml', '_signed.xml');
        }
       /* en.statusPackaged = en.isPackage ? 'Đã tạo' : 'Đang khởi tạo',
        en.statusSynced = en.isSyncSGD ? 'Đã đồng bộ' : 'Chưa đồng bộ';
        en.signedFileUrl = 'https://media.mschool.edu.vn' + en.signedFileUrl;
        en.originalFileUrl = 'https://media.mschool.edu.vn' + en.originalFileUrl;*/
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

  closePopupEdit() {
    this.isShowEdit = false;
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
    }
    this.filterClassId = this.filterClassSource[0].id;
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
    this.loadGrid();
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
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `DS_HOCSINH_LOP_${clsName}.xlsx`);
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
    this.dataItem = Object.assign({}, e.row.data);
    this.isShowEdit = true;
    console.log(this.dataItem);
    this.isShowPreview = true;
    if (this.dataItem.status < 20)
      this.pdfUrl = 'https://media.mschool.edu.vn' + e.row.data.originalFileUrl;
    else if (this.dataItem.status >= 20)
      this.pdfUrl = e.row.data.signedFileUrl;

  };

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
    console.log($event.selectedRowKeys);
    this.selectedItems = $event.selectedRowKeys.map(en => en.id);  // Cập nhật hàng được chọn tại client


    this.signedCount = $event.selectedRowKeys.filter(en => en.signed).length;
    //this.recallCount = $event.selectedRowKeys.filter(en => en.isSyncSGD).length;

    console.log('Selected items:', this.selectedItems);
  }

  doSubmitRelease() {
    let result = confirm(`Bạn có chắc muốn nộp dữ liệu lên sở không?`, 'Xác nhận');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.callAPISubmitRelease();
      }
    });
  }
  callAPISubmitRelease(){
    this.isShowSignLoadingPrincipal = true;
    this.generalService.submitHocBaRelease({packageIds: this.selectedItems}).subscribe(en => {
      this.isShowSignLoadingPrincipal = false;
      if (en.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Gói tin được nộp thành thành công, vui lòng chờ xử lý');
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Có lỗi trong quá trình nộp gói tin');
      }
    }, error => {

    });
  }

  doRecall() {
    let result = confirm(`Bạn có chắc muốn tạo yêu cầu thu hồi dữ liệu đã nộp không?`, 'Xác nhận');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.callAPIRecall();
      }
    });
  }
  callAPIRecall(){
    this.isShowSignLoadingPrincipal = true;
    this.generalService.recallHocBa({hocbaIds: this.selectedItems}).subscribe(en => {
      this.isShowSignLoadingPrincipal = false;
      if (en.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Thu hồi dữ liệu thành thành công!');
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Thu hồi dữ liệu không thành thành công');
      }
    }, error => {

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
        if (type === 'PHAT_HANH') {
          this.generalService.getCertBCYInfo({
            certBase64: rv.CertBase64,
          }).subscribe(res => {
            //console.log(res);
            this.isCertPopupVisible = true;
            this.certInfo = res;
            this.certInfo.cert = rv.CertBase64;
          });
        }
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Lấy chứng thư số không thành công');
      }
    });
  }
  confirmCert() {
    this.certPHATHANH_Base64 = this.certInfo.cert;
    this.isCertPopupVisible = false;
  }

  cancelCert() {
    this.isCertPopupVisible = false;
    this.certPHATHANH_Base64 = '';
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
  async doSigned() {
    this.isShowCheckSocket = true;
    this.checkVGCASocketAvailable().then(isAvailable => {
      this.isShowCheckSocket = false;
      if (!isAvailable) {
        alert("⚠️ Không kết nối được phần mềm ký số Ban Cơ yếu (VGCA Sign Service).\nVui lòng mở lại phần mềm hoặc kiểm tra cài đặt.");
        return;
      } else {
        console.log('this.certBase64', this.certPHATHANH_Base64);
        if (!this.certPHATHANH_Base64) {
          this.notificationService.showNotification(Constant.ERROR, 'Vui lòng bấm lấy chứng thư số phát hành (CTS Phát hành) trước khi ký');
          return;
        }
        let result = confirm(`Bạn có chắc muốn ký phát ${this.selectedItems.length} gói tin học bạ không?`, 'Xác nhận ký');
        result.then((dialogResult) => {
          if (dialogResult) {
            this.isShowSignLoadingPrincipal = true;
            const sender = document.getElementById("btn-sign");
            if (!this.certPHATHANH_Base64) {
              this.notificationService.showNotification(Constant.ERROR, 'Không tồn tại file xml gói tin');
              return;
            }
            this.generalService.prepareHashPackageBCY({
              packageIds: this.selectedItems,
              certBase64: this.certPHATHANH_Base64,
              //signatureTag: 'KY_PHAT_HANH'
            }).subscribe(res => {
              if (res && res.code !== 0){
                this.notificationService.showNotification(Constant.ERROR, res.message);
                return;
              }
              let lstHocBaHash = res.datas;
              const promises = lstHocBaHash.map(hocBaHashItem => {
                return new Promise<{
                  packageId: string,
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
                        packageId: hocBaHashItem.id,
                        signature: rv.Signature,
                        certBase64: rv.CertBase64,
                        tempFile: hocBaHashItem.tempFile
                      });
                    } else {
                      reject(`Ký thất bại cho gói tin học bạ ${hocBaHashItem.id}`);
                    }
                  });
                });
              });
              Promise.all(promises).then(results => {
                // Sau khi tất cả học bạ đều được ký thành công
                const items = results.map(r => ({
                  packageId: r.packageId,
                  signatureValue: r.signature,
                  certBase64: r.certBase64,
                  tempFile: r.tempFile
                }));
                console.log('payload packaged', items);
                // Gọi API 1 lần với toàn bộ danh sách đã ký
                this.generalService.signPackage({items: items}).subscribe(res => {
                  this.isShowSignLoadingPrincipal = false;
                  if (res.code === 0) {
                    this.loadGrid();
                    this.notificationService.showNotification(Constant.SUCCESS, 'Ký thành công tất cả gói tin học bạ');
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
}
