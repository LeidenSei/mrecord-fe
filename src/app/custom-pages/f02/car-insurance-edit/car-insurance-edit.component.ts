import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {getSizeQualifier, ScreenService} from 'src/app/services/screen.service';
import {AuthService, DataService} from "../../../services";
import {forkJoin} from 'rxjs';
import {FormPopupComponent} from "../../../components";
import {DxValidationGroupComponent} from "devextreme-angular";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Constant} from "../../../shared/constants/constant.class";
import {NotificationService} from "../../../services/notification.service";
import {confirm} from "devextreme/ui/dialog";

@Component({
  selector: 'app-car-insurance-edit',
  templateUrl: './car-insurance-edit.component.html',
  styleUrls: ['./car-insurance-edit.component.scss']
})

export class CarInsuranceEditComponent implements OnInit {
  isDataChanged: false;
  isContentScrolled = false;
  pageTitle = 'Thêm mới đơn bảo hiểm';
  getSizeQualifier = getSizeQualifier;
  dataItem: any;
  isPopupKhachHangOpened = false;
  selectedUser: any;

  objPhamVi01: any;
  objPhamVi011 = [];
  objPhamVi01Total: any;
  objPhamVi02: any;
  objPhamVi03s: any[] = [];
  objPhamVi04: any;
  objPhamVi05: any;
  objPhamVi06: [];
  lichThanhToanF02s: any[] = [];

  kenhKhaiThacSource = [
    {id: 0, name: '--Chọn--'},
    /* {id: 1, name: 'Đại lý'},*/
    /*{id: 2, name: 'Môi giới'},*/
    {id: 3, name: 'Trực tiếp'},
  ];
  hinhThucKhaiThacSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Bảo hiểm trực tiếp'},
    /*{id: 2, name: 'Nhận tái bảo hiểm'},
    {id: 3, name: 'Đồng bảo hiểm'},*/
  ];
  loaiHinhBaoHiemSource = [
    {id: 1, name: 'TNDS Bắt buộc'},
    {id: 2, name: 'Vật chất xe'},
  ];
  khoiKhangHangSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Cá nhân (RB)'},
    {id: 2, name: 'Doanh nghiệp vừa và nhỏ (SME)'},
    {id: 3, name: 'Doanh nghiệp lớn (CB)'},
  ];
  hinhThucPhoiHopSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'HT(Đơn vị khai thác)'},
    {id: 2, name: 'PB(Doanh thu nhận phân bổ)'},
    {id: 3, name: 'KHDN'},
    {id: 4, name: 'HOKD'},
  ];
  chuongTrinhBHXCGSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Bán trực tiếp'},
    {id: 2, name: 'Chương trình tặng Ford'},
    {id: 3, name: 'Savico A+'},
  ];
  currencySource = [
    {value: "EUR", name: "EUR"},
    {value: "VND", name: "VND"},
    {value: "CHF", name: "CHF"},
    {value: "USD", name: "USD"},
    {value: "CNY(RMB)", name: "CNY"},
    {value: "GBP", name: "GBP"},
    {value: "JPY", name: "JPY"},
    {value: "RM(MYR)", name: "RM(MYR)"},
    /*{ value: "NGOAITE", name: "Tất cả ngoại tệ" },*/
    {value: "AUD", name: "AUD"},
    {value: "SGD", name: "SGD"},
    {value: "CAD", name: "CAD"},
    {value: "KRW", name: "KRW"},
    {value: "LAK", name: "LAK"},
    {value: "OMR", name: "OMR"}
  ];
  phanLoaiXeSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Xe điện'},
    {id: 2, name: 'Xe động cơ đốt trong'},
  ];
  mucDichKinhDoanhSource = [
    {id: 1, name: 'Kinh doanh vận tải'},
    {id: 2, name: 'Không kinh doanh vận tải'},
  ];
  dongXeSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Xe chở người'},
    {id: 2, name: 'Xe chở hàng'},
    {id: 3, name: 'Các loại xe khác'},
  ];
  nguonGocXeSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Xe đã qua sử dụng - SX tại Việt Nam'},
    {id: 2, name: 'Xe đã qua sử dụng - SX tại nước ngoài'},
    {id: 3, name: 'Xe mới 100% - SX tại Việt Nam'},
    {id: 4, name: 'Xe mới 100% - SX tại Nước ngoài'},
  ];
  loaiBienSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Biển trắng'},
    {id: 2, name: 'Biển xanh'},
    {id: 3, name: 'Biển đỏ'},
    {id: 4, name: 'Biển vàng'},
    {id: 5, name: 'Biển nước ngoài'},
  ];

  mauSonSource = [
    {id: 0, name: '--Chọn--'},
    {id: 1, name: 'Đen'},
    {id: 2, name: 'Trắng'},
    {id: 13, name: 'Đỏ'},
    {id: 3, name: 'Xanh'},
    {id: 4, name: 'Vàng'},
    {id: 5, name: 'Đen trắng'},
    {id: 6, name: 'Đen đỏ'},
    {id: 7, name: 'Trắng đỏ'},
    {id: 8, name: 'Nâu'},
    {id: 9, name: 'Hồng'},
    {id: 10, name: 'Da Cam'},
    {id: 11, name: 'Bạc'},
    {id: 12, name: 'Khác'},
  ];
  vatSource = [
    {id: 0, name: '0%'},
    {id: 10, name: '10%'},
    {id: 5, name: '5%'},
    {id: 7, name: '7%'},
    {id: 8, name: '8%'},
    {id: '', name: 'KT'},
  ];
  mucMienThuongSource = [
    {id: 1, name: 'Có khấu trừ'},
    {id: 2, name: 'Không có khấu trừ'},
  ];
  soChoNgoiSource = [];
  thangSanXuatSource = [];
  namSanXuatSource = [];

  nhomXeSource = [];
  nhomXeSourceFilter = [];
  loaiXeSource = [];
  hangXeSource = [];
  kyHieuXeSource = [];

  nguonDichVuSource = [];
  nguonDichVuChiTietSource = [];
  bankSource = [];
  customerOption: any;
  nguoiThanhToanOption: any;
  customerSource: any;
  taiKhoanSource: any[];
  visible = false;
  showNguonDvBank = false;

  isLoad = false;
  hasRoleTrinhDuyet = false;
  hasRoleCapNhat = true;
  hasRoleDuyet = false;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private router: Router,

              private ref: ChangeDetectorRef) {
    this.objPhamVi02 = {
      phamVi: 2,
      index: 1,
      soTien: 0,
      phiPercent: 0,
      phiBhCoVat: 0,
      vatPercent: 10,
      phiVat: 0,
      comPercent: 0,
      phiCom: 0
    };
    this.objPhamVi01 = {
      phamVi: 1,
      index: 101,
      soTien: 0,
      phiPercent: 0,
      phiBhCoVat: 0,
      vatPercent: 10,
      phiVat: 0,
      comPercent: 0,
      phiCom: 0
    };
    this.objPhamVi04 = {
      phamVi: 4,
      index: 401,
      soTien: 0,
      phiPercent: 0.1,
      phiBhCoVat: 0,
      vatPercent: '',
      phiVat: 0.0,
      comPercent: 0,
      phiCom: 0
    };
    this.objPhamVi05 = {
      phamVi: 5,
      index: 501,
      soTien: 0,
      phiPercent: 0.6,
      phiBhCoVat: 0,
      vatPercent: 10,
      phiVat: 0.0,
      comPercent: 0,
      phiCom: 0
    };
    this.objPhamVi01Total = {
      phamVi: 1,
      index: 301,
      soTien: 0,
      phiPercent: 0,
      phiBhCoVat: 0,
      vatPercent: 10,
      phiVat: 0,
      comPercent: 0,
      phiCom: 0
    };
    this.objPhamVi011 = [
      {
        phamVi: 1,
        checked: false,
        name: 'BS01 - Bảo hiểm thay thế mới (bảo hiểm mới thay cũ)',
        index: 201,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS02 - Bảo hiểm lựa chọn cơ sở sửa chữa chính hãng',
        index: 202,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS03 - Bảo hiểm thuê xe trong thời gian sửa chữa (bảo hiểm gián đoạn sử dụng xe)',
        index: 203,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS04 - Bảo hiểm đối với xe miễn thuế, tạm nhập, tái xuất',
        index: 204,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS05 - Bảo hiểm vật chất xe cơ giới ngoài lãnh thổ Việt Nam (Trung Quốc, Lào, Cămpuchia và Thái Lan):',
        index: 205,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS06 - Bảo hiểm tổn thất do Thủy kích',
        index: 206,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS07 - Bảo hiểm vật chất xe cơ giới lưu hành tạm thời',
        index: 207,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS08 - Bảo hiểm mất bộ phận',
        index: 208,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS09 - Bảo hiểm xe tập lái',
        index: 209,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS10 - Bảo hiểm tổn thất xảy ra trong quá trình hoạt động của thiết bị chuyên dùng',
        index: 2010,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS11 - Các điều khoản thỏa thuận bổ sung khác',
        index: 2011,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      },
      {
        phamVi: 1,
        checked: false,
        name: 'BS12 - Bảo hiểm cho xe tải (chở hàng) có thực hiện cải tạo/hoán cải',
        index: 2012,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0
      }
    ];
    this.objPhamVi03s = [
      {
        phamVi: 3,
        name: 'Mức trách nhiệm bảo hiểm về người',
        index: 301,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 0,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0,
        unitText: '(/người/vụ)'
      },
      {
        phamVi: 3,
        name: 'Mức trách nhiệm bảo hiểm về tài sản',
        index: 302,
        soTien: 0,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 0,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0,
        unitText: '(/vụ)'
      },
      {
        phamVi: 3,
        name: 'Tổng hạn mức trách nhiệm',
        index: 303,
        soTien: 5000000000,
        phiPercent: 0,
        phiBhCoVat: 0,
        vatPercent: 10,
        phiVat: 0,
        comPercent: 0,
        phiCom: 0,
        unitText: '(/vụ)'
      }
    ];
    this.dataItem = {
      kenhKhaiThac: 3,
      hinhThucKhaiThac: 1,
      loaiHinhBaoHiem: 1,
      isAnChiDienTu: false,
      ngayCapDon: new Date(),
      ngayNhapDon: new Date(),
      currencyCode: 'VND',
      tyGia: 1,
      isVayNganHang: false,
      mucDichKinhDoanh: 2,
      isXeMoi100: true,
      ngayThamGia: 365,
      thoiHanTuNgay: new Date(),
      thoiHanDenNgay: this.service.addDays(new Date(), 365),
      isPhamVi02: true,
      isPhamVi03: false,
      isPhamVi04: false,
      isPhamVi05: false,
      isPhamVi06: false,
      phamVi04SoTien: 0,
      phamVi04SoNguoi: 0,

      phamVi05TrongTai: 0,
      phamVi05SoTien: 0,
      tongTien: 0,
      tong01: 0,
      tong02: 0,
      tong03: 0,
      tong04: 0,
      tong05: 0,
      tong06: 0,
      tongPhiCoVat: 0,
      tongPhiVat: 0,
      tongPhiChuaVat: 0,
      status: -1,
    };
    forkJoin([
      this.generalService.getTaikhoan(),
      this.authService.getUser(),
      this.generalService.getDmNguonDv(),
      this.generalService.getBanks(),

      this.generalService.getDmLoaiXe(),
      this.generalService.getDmHangXe(),
      this.generalService.getDmNhomXe(),
    ]).subscribe(([taiKhoanList, user, nguonDichVu, banks, loaixes, hangxes, nhomxes]) => {
      console.log(taiKhoanList, user);
      this.taiKhoanSource = taiKhoanList.filter(en => en.userType !== 1);
      this.selectedUser = user.data;
      this.dataItem.canBoKhaiThacId = user.data.id;
      this.dataItem.canBoCapDonId = user.data.id;
      this.nguonDichVuSource = nguonDichVu;
      this.bankSource = banks;

      this.loaiXeSource = loaixes;
      this.hangXeSource = hangxes;
      this.nhomXeSource = nhomxes;
      this.nhomXeSourceFilter = nhomxes;
      for (let i = 1; i <= 12; i++) {
        this.thangSanXuatSource.push({id: i});
      }
      for (let i = new Date().getFullYear(); i >= 1999; i--) {
        this.namSanXuatSource.push({id: i});
      }

      for (let i = 1; i <= 100; i++) {
        this.soChoNgoiSource.push({id: i, name: `${i} chỗ ngồi`});
      }
    });

    this.customerOption = {
      text: 'Chọn từ danh mục',
      icon: 'user',
      elementAttr: {class: 'form-editor-icon'},
      stylingMode: 'text',
      onClick: () => {
        this.isPopupKhachHangOpened = true;
        this.customerSource = 'KH';
      },
    };
    this.nguoiThanhToanOption = {
      text: 'Chọn từ danh mục',
      icon: 'user',
      elementAttr: {class: 'form-editor-icon'},
      stylingMode: 'text',
      onClick: () => {
        this.isPopupKhachHangOpened = true;
        this.customerSource = 'NTT';
      },
    };
  }

  async ngOnInit() {
    let id = +this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataItem = await this.generalService.getDsBaoHiemOtoById(id).toPromise();
      this.dataItem.statusText = this.service.toStatus(this.dataItem);

      this.hasRoleTrinhDuyet = this.dataItem.status === 0 && this.dataItem.creatorId === this.selectedUser.id;
      this.hasRoleCapNhat = this.dataItem.status !== 1 && this.dataItem.creatorId === this.selectedUser.id;
      this.hasRoleDuyet = this.dataItem.status === 1 && this.selectedUser.userType === 1;

      //console.log(this.dataItem);
      let pvItems = this.dataItem.phamViBaoHiemOtoF02s;
      this.dataItem.phamViBaoHiemOtoF02s.forEach(en => {
        if (en.vatPercent === null) en.vatPercent = '';
      });
      if (this.dataItem.isPhamVi02 && this.dataItem.loaiHinhBaoHiem === 1) {
        let obj = pvItems.find(en => en.phamVi === 2);
        if (obj) this.objPhamVi02 = obj;
      }
      if (this.dataItem.isPhamVi01 && this.dataItem.loaiHinhBaoHiem === 2) {
        //row 1
        let obj01 = pvItems.find(en => en.phamVi === 1 && en.index == 101);
        if (obj01) this.objPhamVi01 = obj01;

        //row total
        let objTotal = pvItems.find(en => en.phamVi === 1 && en.index == 301);
        if (objTotal) this.objPhamVi01Total = objTotal;

        //row items
        let obj011Items = pvItems.filter(en => en.phamVi === 1 && en.index !== 301 && en.index !== 101);
        this.objPhamVi011.forEach(en => {
          let checkedItem = obj011Items.find(x => x.index === en.index);
          if (checkedItem) {
            en.checked = true;
            en.phiPercent = checkedItem.phiPercent;
            en.phiBhCoVat = checkedItem.phiBhCoVat;
          }
          en.soTien = this.objPhamVi01.soTien;
        });
      }
      if (this.dataItem.isPhamVi03) {
        let obj03Items = pvItems.filter(en => en.phamVi === 3);
        for (let i = 0; i < this.objPhamVi03s.length; i++) {
          let item = this.objPhamVi03s[i];
          item.soTien = obj03Items[i].soTien;
          item.phiPercent = obj03Items[i].phiPercent;
          item.phiBhCoVat = obj03Items[i].phiBhCoVat;
          item.vatPercent = obj03Items[i].vatPercent;
          item.phiVat = obj03Items[i].phiVat;
          item.comPercent = obj03Items[i].comPercent;
          item.phiCom = obj03Items[i].phiCom;
        }
      }
      if (this.dataItem.isPhamVi04) {
        let obj = pvItems.find(en => en.phamVi === 4);
        if (obj) this.objPhamVi04 = obj;
      }
      if (this.dataItem.isPhamVi05) {
        let obj = pvItems.find(en => en.phamVi === 5);
        if (obj) this.objPhamVi05 = obj;
      }
      console.log(this.dataItem.lichThanhToanF02s);
      if (!this.dataItem.lichThanhToanF02s || !this.dataItem.lichThanhToanF02s.length) {
        this.lichThanhToanF02s = [
          {id: 0, lan: 1, ngayThanhToan: new Date(), tongPhi: 0, vat: 0, phiChuaVat: 0}
        ];
        this.tinhPhiLanTT(0);
      } else {
        this.lichThanhToanF02s = this.dataItem.lichThanhToanF02s;
      }
      this.isLoad = true;
    } else {
      this.lichThanhToanF02s = [
        {id: 0, lan: 1, ngayThanhToan: new Date(), tongPhi: 0, vat: 0, phiChuaVat: 0}
      ];
    }
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  backToList() {
    this.router.navigate([`/mvp`]);
  }

  async save() {
    console.log(this.dataItem);
    if (this.isValid()) {
      if (this.dataItem.id) {
        this.saveUpdate();
      } else {
        this.saveAdd();
      }
    } else {
      this.notificationService.showNotification(Constant.ERROR, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  scroll({reachedTop = false}) {
    this.isContentScrolled = !reachedTop;
  }

  changeSource($event: any) {
    console.log($event);
  }

  changeLoaiHinh($event: any) {

  }

  doneClick() {
    alert('Click to search');
  }

  doSelectCustomer($event: any) {
    this.isPopupKhachHangOpened = false;
    if (this.customerSource === "KH") {
      this.dataItem.khachHangMa = $event.idKhachHang;
      this.dataItem.khachHangTen = $event.tenKhachHang;
      this.dataItem.chuXeTen = $event.tenKhachHang;
      this.dataItem.chuXePhone = $event.dienThoaiKhachHang;
      this.dataItem.nguoiThanhToanMa = $event.idKhachHang;
      this.dataItem.nguoiThanhToanTen = $event.tenKhachHang;

      this.dataItem.chuXeCmnd = $event.cmndkhangHang;
      this.dataItem.chuXeDiaChi = $event.diaChiKhachHang;

    } else {
      this.dataItem.nguoiThanhToanMa = $event.idKhachHang;
      this.dataItem.nguoiThanhToanTen = $event.tenKhachHang;
    }
  }

  changeCurrency($event) {
    this.visible = !this.visible;
  }

  async changeNguonDichVu($event: number) {
    //console.log(this.nguonDichVuSource, $event);
    let item = this.nguonDichVuSource.find(en => en.id == $event);
    if (item) {
      let payload = {
        nguonDichVu: item.code,
      }
      if (item.isBank) {
        this.showNguonDvBank = true;
      } else {
        this.showNguonDvBank = false;
        this.nguonDichVuChiTietSource = await this.generalService.getDmNguonDvct(payload).toPromise();
      }
    }
  }

  changeNguonDichVuChiTiet($event) {
    this.nhomXeSource
  }

  async hangXeChange($event) {
    let hangXe = this.hangXeSource.find(en => en.id === $event);
    if (hangXe) {
      this.kyHieuXeSource = await this.generalService.getDmNhanHieuXe(hangXe.code).toPromise();
    }
  }

  async saveAdd() {
    //Start convert date
    /*this.dataItem.ngayCapDon = this.service.convertToLocalDate(this.dataItem.ngaySinh);
    this.dataItem.ngayNhapDon = this.service.convertToLocalDate(this.dataItem.ngayNhapDon);

    this.dataItem.thoiHanTuNgay = this.service.convertToLocalDate(this.dataItem.thoiHanTuNgay);
    this.dataItem.thoiHanDenNgay = this.service.convertToLocalDate(this.dataItem.thoiHanDenNgay);*/


    //End convert date
    this.dataItem.creatorId = this.selectedUser.id;
    this.dataItem.phamViBaoHiemOtoF02s = this.processPhiBeforeSave();
    this.dataItem.lichThanhToanF02s = this.lichThanhToanF02s.filter(en => 1 === 1);
    this.dataItem.lichThanhToanF02s.forEach(en => {
      delete en.id;
      /*en.NgayThanhToan = this.service.convertToLocalDate(en.NgayThanhToan);*/
    });
    console.log(this.dataItem);
    let res = await this.generalService.addBaoHiemOto(this.dataItem).toPromise();
    console.log(res);
    this.notificationService.showNotification(Constant.SUCCESS, Constant.MESSAGE_ADD_SUCCESS);
    this.router.navigate([`/mvp`]);

  }

  async saveUpdate() {
    this.dataItem.phamViBaoHiemOtoF02s = this.processPhiBeforeSave();
    this.dataItem.lichThanhToanF02s = this.lichThanhToanF02s.filter(en => 1 === 1);
    this.dataItem.lichThanhToanF02s.forEach(en => {
      delete en.id;
      /*en.NgayThanhToan = this.service.convertToLocalDate(en.NgayThanhToan);*/
    });
    let res = await this.generalService.updateBaoHiemOto(this.dataItem).toPromise();
    console.log(res);
    this.notificationService.showNotification(Constant.SUCCESS, Constant.MESSAGE_UPDATE_SUCCESS);
  }

  processPhiBeforeSave(): any {
    let pvItems = [];
    if (this.dataItem.isPhamVi02 && this.dataItem.loaiHinhBaoHiem === 1) {
      pvItems.push(this.objPhamVi02);
    }
    if (this.dataItem.isPhamVi01 && this.dataItem.loaiHinhBaoHiem === 2) {
      pvItems.push(this.objPhamVi01);
      this.objPhamVi011.forEach(en => {
        if (en.checked) {
          pvItems.push(en);
        }
      });
      pvItems.push(this.objPhamVi01Total);
    }
    if (this.dataItem.isPhamVi03) {
      this.objPhamVi03s.forEach(en => {
        pvItems.push(en);
      });
    }
    if (this.dataItem.isPhamVi04) {
      pvItems.push(this.objPhamVi04);
    }
    if (this.dataItem.isPhamVi05) {
      pvItems.push(this.objPhamVi05);
    }
    return pvItems;
  }

  loadNhomXe() {
    setTimeout(() => {
      let mucDichKinhDoanh = '' + this.dataItem.mucDichKinhDoanh;
      let dongXe = this.dataItem.dongXe;
      if (dongXe === 0) {
        this.nhomXeSourceFilter = this.nhomXeSource.filter(en => en.mucDich.includes(mucDichKinhDoanh));
      } else {
        this.nhomXeSourceFilter = this.nhomXeSource.filter(en => en.mucDich.includes(mucDichKinhDoanh) && en.dongXe === dongXe);
      }
    }, 0);
  }

  changeThoiHan() {
    setTimeout(() => {
      let days = this.service.getDaysBetween(this.dataItem.thoiHanTuNgay, this.dataItem.thoiHanDenNgay);
      this.dataItem.ngayThamGia = days;
    }, 0);
  }

  changeNgayThamGia($event: number) {
    this.dataItem.thoiHanDenNgay = this.service.addDays(this.dataItem.thoiHanTuNgay, +$event);
  }

  changePhi01(item: any, field: string) {
    if (field === 'soTien') {
      this.changePhi(item, 'soTien');
      this.objPhamVi011.forEach(en => {
        en.soTien = item.soTien;
        if (en.checked) {
        }
      });
    } else {
      this.changePhi(item, field);
    }
    this.sumPhi01();
  }

  changePhi11(item: any, field: string) {
    this.changePhi(item, field);
    this.sumPhi01();
  }

  sumPhi01() {
    this.objPhamVi01Total.soTien = this.objPhamVi01.soTien;
    this.objPhamVi01Total.phiPercent = this.objPhamVi01.phiPercent;
    this.objPhamVi01Total.phiBhCoVat = this.objPhamVi01.phiBhCoVat;

    this.objPhamVi011.forEach(en => {
      if (en.checked) {
        this.objPhamVi01Total.phiPercent += en.phiPercent;
        this.objPhamVi01Total.phiBhCoVat += en.phiBhCoVat;
      }
    });
  }


  changePhi(item: any, field: string) {
    setTimeout(() => {
      switch (field) {
        case 'phiPercent':
        case 'soTien':
          item.phiBhCoVat = item.soTien * item.phiPercent / 100;
          item.phiVat = this.service.calculateVAT(item.phiBhCoVat, item.vatPercent);
          break;
        case 'phiBhCoVat':
          item.phiVat = this.service.calculateVAT(item.phiBhCoVat, item.vatPercent);
          item.phiPercent = this.service.calculateCOMPercent(item.soTien, item.phiBhCoVat);
          item.phiCom = this.service.calculateCOM(item.phiBhCoVat - item.phiVat, item.comPercent);
          break;
        case 'vatPercent':
          item.phiVat = this.service.calculateVAT(item.phiBhCoVat, item.vatPercent);
          item.phiCom = this.service.calculateCOM(item.phiBhCoVat - item.phiVat, item.comPercent);
          break;
        case 'comPercent':
          item.phiCom = this.service.calculateCOM(item.phiBhCoVat - item.phiVat, item.comPercent);
          break;
        case 'phiCom':
          item.comPercent = this.service.calculateCOMPercent(item.phiBhCoVat - item.phiVat, item.phiCom);
          break;
        default:
          break;
      }
      //console.log(item, field);
      this.sumTotalPhi();
    }, 0);
  }

  sumTotalPhi() {
    this.dataItem.tongTien = 0;
    this.dataItem.tong01 = 0;
    this.dataItem.tong02 = 0;
    this.dataItem.tong03 = 0;
    this.dataItem.tong04 = 0;
    this.dataItem.tong05 = 0;
    this.dataItem.tongPhiCoVat = 0;
    this.dataItem.tongPhiVat = 0;
    this.dataItem.tongPhiChuaVat = 0;

    if (this.dataItem.isPhamVi01) {
      this.dataItem.tongTien += this.objPhamVi01Total.soTien;
      this.dataItem.tong01 = this.objPhamVi01Total.phiBhCoVat;
      this.dataItem.tongPhiVat += this.objPhamVi01Total.phiVat;
    }
    if (this.dataItem.isPhamVi02) {
      this.dataItem.tongTien += this.objPhamVi02.soTien;
      this.dataItem.tong02 = this.objPhamVi02.phiBhCoVat;
      this.dataItem.tongPhiVat += this.objPhamVi02.phiVat;
    }
    if (this.dataItem.isPhamVi03) {
      let item03 = this.objPhamVi03s.find(en => en.index == 303);
      console.log('this.dataItem.isPhamVi03', item03);
      this.dataItem.tongTien += item03.soTien;
      this.dataItem.tong03 = item03.phiBhCoVat;
      this.dataItem.tongPhiVat += item03.phiVat;
    }
    if (this.dataItem.isPhamVi04) {
      this.dataItem.tongTien += this.objPhamVi04.soTien;
      this.dataItem.tong04 = this.objPhamVi04.phiBhCoVat;
      this.dataItem.tongPhiVat += this.objPhamVi04.phiVat;
    }
    if (this.dataItem.isPhamVi05) {
      this.dataItem.tongTien += this.objPhamVi05.soTien;
      this.dataItem.tong05 = this.objPhamVi05.phiBhCoVat;
      this.dataItem.tongPhiVat += this.objPhamVi05.phiVat;
    }
    this.dataItem.tongPhiCoVat = this.dataItem.tong01 + this.dataItem.tong02 + this.dataItem.tong03 + this.dataItem.tong04 + this.dataItem.tong05;
    this.dataItem.tongPhiChuaVat = this.dataItem.tongPhiCoVat - this.dataItem.tongPhiVat;

    //Tính phí lịch thanh toán
    this.tinhPhiLanTT(0);
  }

  phamViChange($event: boolean) {
    setTimeout(() => {
      $event = !$event;
    }, 0);

  }

  changeTongTienPV04(obj: any) {
    setTimeout(() => {
      this.objPhamVi04.soTien = obj.phamVi04SoNguoi * obj.phamVi04SoTien;
    }, 0);
  }

  changeTongTienPV05(obj: any) {
    setTimeout(() => {
      this.objPhamVi05.soTien = obj.phamVi05TrongTai * obj.phamVi05SoTien / 1000;
    }, 0);
  }

  deleteRowLichTT(item: any) {
    if (this.lichThanhToanF02s.length > 1) {
      this.lichThanhToanF02s = this.lichThanhToanF02s.filter(en => en.id !== item.id);
      let index = 1;
      this.lichThanhToanF02s.forEach(en => {
        en.lan = index;
        index++;
      });
      this.tinhPhiLanTT(0);
    }
  }

  addRowLichTT() {
    //this.service.addDays(new Date(), 365)
    let lastItem = this.lichThanhToanF02s[this.lichThanhToanF02s.length - 1];
    this.lichThanhToanF02s.push(
      {
        id: -new Date().getMilliseconds(),
        lan: lastItem.lan + 1,
        ngayThanhToan: this.service.addMonths(lastItem.ngayThanhToan, 1),
        tongPhi: 0,
        vat: 0,
        phiChuaVat: 0
      }
    );
  }

  tinhPhiLanTT(index: number) {
    setTimeout(() => {
      /*let baseItem = this.lichThanhToanF02s[index];
      baseItem.tongPhi = 0;*/
      let tongPhi = 0;
      for (let i = 0; i <= index; i++) {
        tongPhi += this.lichThanhToanF02s[i].tongPhi;
      }
      //console.log('tinhPhiLanTT', tongPhi, this.dataItem.tongPhiCoVat, index);
      let rowCount = this.lichThanhToanF02s.length;
      if (this.lichThanhToanF02s.length === 1) {
        let item = this.lichThanhToanF02s[0];
        item.tongPhi = this.dataItem.tongPhiCoVat;
        item.vat = this.dataItem.tongPhiVat;
        item.phiChuaVat = this.dataItem.tongPhiChuaVat;
      } else {
        let rowCount = this.lichThanhToanF02s.length;
        if (index < rowCount - 1) {
          for (let j = index + 1; j < rowCount; j++) {
            let nextItem = this.lichThanhToanF02s[j];
            nextItem.tongPhi = 0;
          }
          this.tinhPhiLanTT(index + 1);
        } else {
          let baseItem = this.lichThanhToanF02s[index];
          baseItem.tongPhi = this.dataItem.tongPhiCoVat - tongPhi;
        }
      }
    }, 0);
  }

  changePhiLichTT(item: any, field: string, index) {
    let vatPercent = this.dataItem.tongPhiVat / this.dataItem.tongPhiChuaVat * 100;
    setTimeout(() => {
      console.log('changePhiLichTT', vatPercent, index);
      switch (field) {
        case 'tongPhi':
          item.phiChuaVat = item.tongPhi - this.service.calculateVAT(item.tongPhi, vatPercent);
          item.vat = item.tongPhi - item.phiChuaVat;
          if (index < this.lichThanhToanF02s.length - 1 || this.lichThanhToanF02s.length == 1)
            this.tinhPhiLanTT(index);
          break;
        default:
          break;
      }
    }, 0);
  }

  loadPhiTNDS() {
    console.log('loadPhiTNDS');
    if (this.isLoad) return;
    setTimeout(() => {
      let nhomXeItem = this.nhomXeSource.find(en => en.id === this.dataItem.nhomXe);
      let payload = {
        nhomXe: nhomXeItem ? nhomXeItem.code : '',
        mucDich: this.dataItem.mucDichKinhDoanh,
        soChoNgoi: this.dataItem.soChoNgoi ? +this.dataItem.soChoNgoi : 0,
        trongTai: this.dataItem.trongTai ? this.dataItem.trongTai : 0
      };
      //console.log(payload);
      this.generalService.loadPhiBaoHiemTNDS(payload).subscribe(res => {
        console.log(res);
        if (res.id !== -1) {
          this.objPhamVi02.soTien = res.giaTriBaoHiem;
          setTimeout(() => {
            this.objPhamVi02.phiBhCoVat = res.phiBaoHiemCoVat;
          }, 1);
        }
      }, error => {
      });
    }, 0);
  }

  onOptionChanged($event) {
    console.log('event:', $event);
  }

  activeCalculatePhi() {
    console.log('activeCalculatePhi');
    this.isLoad = false;
  }

  sendApprove() {
    const result = confirm(`Bạn có muốn trình duyệt hồ sơ khách hàng: ${this.dataItem.khachHangTen.toUpperCase()} này?`, 'Xác nhận');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.submitApproveBaoHiemOto({id: this.dataItem.id}).subscribe(res => {
          if (res.id > 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Trình duyệt hồ sơ thành công');
            this.dataItem.status = 1;
            this.hasRoleTrinhDuyet = false;
            this.router.navigate([`/mvp`]);
          }
        }, error => {

        });
      }
    });
  }

  doApprove() {
    const result = confirm(`Bạn có muốn duyệt hồ sơ khách hàng: ${this.dataItem.khachHangTen.toUpperCase()} này không ?`, 'Xác nhận');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.doApproveBaoHiemOto({id: this.dataItem.id}).subscribe(res => {
          if (res.id > 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt hồ sơ thành công');
            this.dataItem.status = 1;
            this.hasRoleTrinhDuyet = false;
            this.router.navigate([`/mvp`]);
          }
        }, error => {

        });
      }
    });
  }
}
