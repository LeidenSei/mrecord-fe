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
  selector: 'app-transcript-list',
  templateUrl: './transcript-list.component.html',
  styleUrls: ['./transcript-list.component.scss']
})
export class TranscriptListComponent implements OnInit {
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
  selectedItems: any[] = [];
  isShowSignLoadingPrincipal = false;
  isShowCheckSocket = false;
  isShowConfirmPrincipal = false;
  isShowConfirmRelease = false;
  status20Count = 0;
  status40Count = 0;
  status21Count = 0;
  statusGVBMCount = 0;
  isShowPopupRequestCancel = false;
  chooseDatas: any[] = [];
  cancelReason: any;
  isTeacher = false;
  staffInfo: any;
  schoolInfo: any;
  isElementary = true;
  selectedItemWithXMLs: any[] = [];
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;
  certCQBL_Base64: any;
  certPHATHANH_Base64: any;
  isCertPopupVisible: boolean = false;
  certInfo: any;
  subjectTeacherSignProgressList: any[] = [];
  isVisibleSignInfoSubjectTeacher = false;
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
    this.certInfo = {};
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
    this.multipleApproved = user.data.isBGH || user.data.role === 2;

    this.isAdmin = user.data.role === 2;
    this.isTeacher = user.data.role === 3;
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
        this.filterGrade = this.gradeSource[0];
        if (this.filterGrade) {
          this.filterClassSource = this.classSource.filter(en => en.grade === this.filterGrade);
        } else {
          this.filterClassSource = this.classSource.filter(en => 1 === 1);
        }
      } else {
        this.filterClassSource = this.classSource.filter(en => en.homeroomTeacher === user.data.personId || en.homeroomTeacher === user.data.id);
        if (this.filterClassSource.length === 1) {
          this.gradeSource = gradeSource.filter(en => en === this.filterClassSource[0].grade);
          this.filterGrade = this.filterClassSource[0].grade;
        }
      }
      this.filterClassId = this.filterClassSource[0].id;
      this.loadGrid();
      this.generalService.getSchoolConfig(user.data.schoolId).subscribe((res: any) => {
        this.schoolInfo = res;
        this.isElementary = res.type === 1;
      }, error => {

      });
    });
    this.generalService.getStaffById(user.data.personId).subscribe(res => {
      this.staffInfo = res;
    }, error => {

    });
  }

  async loadGrid() {
    this.generalService.getListHocBa(this.schoolId, this.filterClassId, this.filterSchoolYear).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      this.datas.forEach(en => {
        en.stt = index++;
        en.statusGVCN = en.status >= 20 ? 'Đã ký' : 'Chưa ký';
        en.statusGVBM = en.isSignFullSubjectTeacher ? 'Đã ký' : 'Chưa ký';
        en.statusHieuTruong = en.status >= 40 ? 'Đã ký' : 'Chưa ký';
        en.statusRelease = en.status == 50 ? 'Đã ký' : 'Chưa ký';
        en.signedFileUrl = 'https://media.mschool.edu.vn' + en.signedFileUrl + '?v=' + new Date().getMilliseconds();
        en.originalFileUrl = 'https://media.mschool.edu.vn' + en.originalFileUrl + '?v=' + new Date().getMilliseconds();

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
          default:
            break;
        }
        if (en.status === 0 && en.isSignFullSubjectTeacher) {
          replaceTo = '_gvbm.xml';
        }
        en.xmlFile = en.originalFileUrl.replace('.pdf', replaceTo) + '?v=' + new Date().getMilliseconds();
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
    //this.loadGrid();
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
    this.dataItem = Object.assign({}, e.row.data);
    if (!this.isElementary && !this.dataItem.isSignFullSubjectTeacher) {
      this.notificationService.showNotification(Constant.ERROR, 'Không thể ký số GVCN, vui lòng hoàn thiện chữ ký GVBM trước');
      return;
    }
    if (!this.staffInfo.vietelClientId || !this.staffInfo.vietelClientSecret || !this.staffInfo.vietelUserId) {
      this.notificationService.showNotification(Constant.ERROR, 'Vui lòng kiểm tra cấu hình chữ ký số trước khi tiến hành ký');
      return;
    }

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

    this.statusGVBMCount = $event.selectedRowKeys.filter(en => en.isSignFullSubjectTeacher).length;

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

  async doPricipalSign() {
    this.isShowCheckSocket = true;
    this.checkVGCASocketAvailable().then(isAvailable => {
      this.isShowCheckSocket = false;
      if (!isAvailable) {
        alert("⚠️ Không kết nối được phần mềm ký số Ban Cơ yếu (VGCA Sign Service).\nVui lòng mở lại phần mềm hoặc kiểm tra cài đặt.");
        return;
      } else {
        //console.log('this.certBase64', this.certCQBL_Base64);
        if (!this.certCQBL_Base64) {
          this.notificationService.showNotification(Constant.ERROR, 'Vui lòng bấm lấy chứng thư số CQBL (CTS CQBL) trước khi ký');
          return;
        }
        let result = confirm(`Bạn có chắc muốn ký xác nhận học bạ ${this.selectedItemWithXMLs.length} học sinh không?`, 'Xác nhận ký');
        result.then((dialogResult) => {
          if (dialogResult) {
            this.isShowConfirmPrincipal = false;
            this.isShowSignLoadingPrincipal = true;
            const sender = document.getElementById("btn-sign");
            if (!this.certCQBL_Base64) {
              this.notificationService.showNotification(Constant.ERROR, 'Không lấy được chứng thư số CTS');
              return;
            }
            this.generalService.prepareHashBCY({
              hocbaIds: this.selectedItems,
              certBase64: this.certCQBL_Base64,
              signatureTag: 'CBQL'
            }).subscribe(res => {
              if (res && res.code !== 0) {
                this.notificationService.showNotification(Constant.ERROR, res.message);
                return;
              }
              let lstHocBaHash = res.datas;
              if (!lstHocBaHash.length) {
                this.notificationService.showNotification(Constant.ERROR, 'Không tồn tại file ký số xml của GVCN. Vui lòng khởi tạo học bạ và ký lại bước GVCN');
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
                console.log('payloadsignByPrincipalNew', items);
                // Gọi API 1 lần với toàn bộ danh sách đã ký
                this.generalService.signByPrincipalNew({items: items}).subscribe(res => {
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

  async doReleaseSign() {
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
        let result = confirm(`Bạn có chắc muốn ký phát hành học bạ ${this.selectedItemWithXMLs.length} học sinh không?`, 'Xác nhận ký');
        result.then((dialogResult) => {
          if (dialogResult) {
            this.isShowConfirmPrincipal = false;
            this.isShowSignLoadingPrincipal = true;
            const sender = document.getElementById("btn-sign");
            if (!this.certPHATHANH_Base64) {
              this.notificationService.showNotification(Constant.ERROR, 'Không tồn tại file ký số của CBQL. Vui lòng ký lại bước CBQL');
              return;
            }
            this.generalService.prepareHashBCY({
              hocbaIds: this.selectedItems,
              certBase64: this.certPHATHANH_Base64,
              signatureTag: 'KY_PHAT_HANH'
            }).subscribe(res => {
              if (res && res.code !== 0) {
                this.notificationService.showNotification(Constant.ERROR, res.message);
                return;
              }
              let lstHocBaHash = res.datas;
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
                console.log('payloadsignByPrincipalNew', items);
                // Gọi API 1 lần với toàn bộ danh sách đã ký
                this.generalService.signRelease({items: items}).subscribe(res => {
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

  canonicalizeXmlRegion(xmlString, tagName, regionId) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const nodes = xmlDoc.getElementsByTagName(tagName);
    const targetNode = Array.from(nodes).find(
      (node) => node.getAttribute('Id') === regionId
    );

    if (!targetNode) throw new Error(`Không tìm thấy vùng <${tagName} Id="${regionId}">`);

    // Trả về OuterHTML nếu là Element, tránh lỗi không phải Node
    const serialized = targetNode.outerHTML;
    return Promise.resolve(serialized);
  }


  requestCancel() {
    this.isShowPopupRequestCancel = true;
    console.log(this.selectedItems);
    this.chooseDatas = this.datas.filter(data => this.selectedItems.includes(data.id));
    console.log(this.chooseDatas);
  }

  doCancelRequest() {
    if (!this.cancelReason) {
      this.notificationService.showNotification(Constant.ERROR, 'Vui lòng nhập lý do hủy');
      return;
    }
    this.generalService.requestCancelHocBa({hocbaIds: this.selectedItems, reason: this.cancelReason}).subscribe(en => {
      this.isShowPopupRequestCancel = false;
      if (en.code === 0) {
        this.selectedItems = [];
        this.cancelReason = '';
        this.notificationService.showNotification(Constant.SUCCESS, 'Gửi đề xuất hủy học bạ thành công');
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Đề xuất không thành công.');
      }
    }, error => {

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

  requestSigned() {
    let result = confirm(`Bạn có chắc muốn ký xác nhận cho ${this.selectedItems.length} học bạ không?`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.startCountdown();
        this.isShowSignLoading = true;
        let payload = {
          ids: this.selectedItems,
          classId: this.filterClassId
        }
        this.generalService.signMultipleByGVCN(payload, this.isElementary).subscribe(en => {
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

  confirmCert() {
    this.certCQBL_Base64 = this.certInfo.cert;
    this.isCertPopupVisible = false;
  }

  cancelCert() {
    this.isCertPopupVisible = false;
    this.certCQBL_Base64 = '';
  }

  showSubjectTeacherSignProgress(data) {
    this.generalService.getSignInfoBySubjectTeacher(data.id).subscribe(res => {
      this.isVisibleSignInfoSubjectTeacher = true;
      this.subjectTeacherSignProgressList = res;
    }, error => {

    });
  }
}
