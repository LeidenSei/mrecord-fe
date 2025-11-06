import { Component, OnInit, ViewChild } from '@angular/core';
import { DxFormComponent } from 'devextreme-angular';
import { ToChuyenMonService } from 'src/app/services/to-chuyen-mon.service';
import { HoSoGiaoDucService } from 'src/app/services/ho-so-giao-duc.service';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { AppConfigService } from 'src/app/app-config.service';
import { AuthService } from 'src/app/services';

@Component({
  selector: 'app-subject-group-records',
  templateUrl: './subject-group-records.component.html',
  styleUrls: ['./subject-group-records.component.scss']
})
export class SubjectGroupRecordsComponent implements OnInit {
  @ViewChild('toFormComponent', { static: false }) toFormComponent: DxFormComponent;
  @ViewChild('hoSoFormComponent', { static: false }) hoSoFormComponent: DxFormComponent;

  tabs = [
    { id: 'to-chuyen-mon', text: 'Quản lý Tổ chuyên môn', icon: 'group' },
    { id: 'ho-so', text: 'Quản lý Hồ sơ', icon: 'folder' }
  ];


  selectedTabId: string = 'to-chuyen-mon';
  schoolId: string = '';
  schoolYear: number = new Date().getFullYear();
  loading: boolean = false;

  toChuyenMonList: any[] = [];
  toPopupVisible: boolean = false;
  toPopupTitle: string = 'Thêm tổ mới';
  isEditToMode: boolean = false;
  toFormData: any = {};

  hoSoDataSource: any[] = [];
  selectedToChuyenMon: string = '';
  selectedLoaiHoSo: number = null;
  hoSoPopupVisible: boolean = false;
  hoSoPopupTitle: string = 'Thêm hồ sơ mới';
  isEditHoSoMode: boolean = false;
  hoSoFormData: any = {};

  capDoList: any[] = [
    { id: 1, name: 'Tổ chuyên môn' },
    { id: 2, name: 'Nhà trường' }
  ];

  loaiHoSoList: any[] = [
    { id: 1, name: 'Kế hoạch' },
    { id: 2, name: 'Biên bản' },
    { id: 3, name: 'Báo cáo' },
    { id: 4, name: 'Quyết định' },
    { id: 5, name: 'Thông báo' },
    { id: 6, name: 'Đề kiểm tra' },
    { id: 7, name: 'Giáo án mẫu' },
    { id: 8, name: 'Tài liệu bồi dưỡng' },
    { id: 9, name: 'Sổ họp tổ' },
    { id: 10, name: 'Báo cáo tổng kết' },
    { id: 11, name: 'Văn bản pháp quy' },
    { id: 12, name: 'Quy chế trường' },
    { id: 13, name: 'Kế hoạch năm học' },
    { id: 14, name: 'Báo cáo phụ huynh' },
    { id: 99, name: 'Khác' }
  ];

  loaiTaiLieuList: any[] = [
    { id: 1, name: 'PDF' },
    { id: 4, name: 'Word' },
    { id: 2, name: 'PowerPoint' },
    { id: 3, name: 'Excel' }
  ];

  uploadUrl: string = '';
  uploadHeaders: any = {};
  allowedFileExtensions: string[] = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

  constructor(
    private toChuyenMonService: ToChuyenMonService,
    private hoSoGiaoDucService: HoSoGiaoDucService,
    private configService: AppConfigService,
    private authService: AuthService 
  ) {
    this.uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
    this.uploadHeaders = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
  }

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      
      if (!user || !user.data || !user.data.schoolId) {
        notify('Không tìm thấy thông tin trường', 'error', 3000);
        return;
      }

      this.schoolId = user.data.schoolId;
      this.loadToChuyenMonList();
    } catch (error) {
      console.error('Error getting user:', error);
      notify('Lỗi khi lấy thông tin người dùng', 'error', 3000);
    }
  }

  loadToChuyenMonList() {
    this.loading = true;
    this.toChuyenMonService.getListBySchool(this.schoolId, this.schoolYear).subscribe({
      next: (response) => {
        this.toChuyenMonList = response || [];
        if (this.toChuyenMonList.length > 0 && !this.selectedToChuyenMon) {
          this.selectedToChuyenMon = this.toChuyenMonList[0].id;
          if (this.selectedTabId === 'ho-so-to') {
            this.loadHoSoToData();
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        notify('Không thể tải danh sách tổ chuyên môn', 'error', 3000);
        this.loading = false;
      }
    });
  }

  onToToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift(
      {
        location: 'before',
        widget: 'dxButton',
        options: {
          icon: 'refresh',
          hint: 'Làm mới',
          onClick: () => this.loadToChuyenMonList()
        }
      },
      {
        location: 'after',
        widget: 'dxButton',
        options: {
          icon: 'add',
          text: 'Thêm tổ mới',
          type: 'default',
          onClick: () => this.showAddToPopup()
        }
      }
    );
  }

  showAddToPopup() {
    this.isEditToMode = false;
    this.toPopupTitle = 'Thêm tổ mới';
    this.toFormData = {
      code: '',  
      name: '',
      schoolId: this.schoolId,
      schoolYear: this.schoolYear,
      toTruongId: '',  
      toPhoId: '',     
      description: '',
      orderBy: 0
    };
    this.toPopupVisible = true;
  }

  onEditTo(cellInfo: any) {
    const data = cellInfo.data;
    this.isEditToMode = true;
    this.toPopupTitle = 'Cập nhật tổ chuyên môn';
    this.toFormData = {
      id: data.id,
      code: data.code,
      name: data.name,
      schoolId: this.schoolId,
      schoolYear: this.schoolYear,
      toTruongId: '',
      toPhoId: '',
      description: data.description || '',
      orderBy: data.orderBy || 0
    };
    this.toPopupVisible = true;
  }

  onDeleteTo(cellInfo: any) {
    const data = cellInfo.data;
    const result = confirm('Bạn có chắc chắn muốn xóa tổ chuyên môn này?', 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.toChuyenMonService.deleteToChuyenMon(data.id).subscribe({
          next: (response) => {
            if (response.code === 0) {
              notify('Xóa thành công', 'success', 3000);
              this.loadToChuyenMonList();
            } else {
              notify(response.message, 'error', 3000);
            }
          },
          error: (error) => {
            console.error('Error:', error);
            notify('Có lỗi xảy ra', 'error', 3000);
          }
        });
      }
    });
  }

  onSaveTo() {
    const validation = this.toFormComponent.instance.validate();
    if (!validation.isValid) return;

    const service = this.isEditToMode 
      ? this.toChuyenMonService.update(this.toFormData)
      : this.toChuyenMonService.create(this.toFormData);

    service.subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify(this.isEditToMode ? 'Cập nhật thành công' : 'Tạo mới thành công', 'success', 3000);
          this.toPopupVisible = false;
          this.loadToChuyenMonList();
        } else {
          notify(response.message, 'error', 3000);
        }
      },
      error: (error) => {
        console.error('Error:', error);
        notify('Có lỗi xảy ra', 'error', 3000);
      }
    });
  }

  onToChanged() {
    this.loadHoSoToData();
  }

  loadHoSoToData() {
    if (!this.selectedToChuyenMon) {
      this.hoSoDataSource = [];
      return;
    }

    this.loading = true;
    this.hoSoGiaoDucService.getListByToChuyenMon(
      this.selectedToChuyenMon, 
      this.schoolYear, 
      this.selectedLoaiHoSo,
      null,
      1
    ).subscribe({
      next: (response) => {
        this.hoSoDataSource = response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        notify('Không thể tải dữ liệu hồ sơ', 'error', 3000);
        this.loading = false;
      }
    });
  }


  onHoSoToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift(
      {
        location: 'before',
        widget: 'dxButton',
        options: {
          icon: 'refresh',
          hint: 'Làm mới',
          onClick: () => this.loadHoSoToData() 
        }
      },
      {
        location: 'after',
        widget: 'dxButton',
        options: {
          icon: 'add',
          text: 'Thêm hồ sơ',
          type: 'default',
          onClick: () => this.showAddHoSoPopup()
        }
      }
    );
  }

  onDeleteHoSo(cellInfo: any) {
    const data = cellInfo.data;
    const result = confirm('Bạn có chắc chắn muốn xóa hồ sơ này?', 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.hoSoGiaoDucService.deleteHoSo(data.id).subscribe({
          next: (response) => {
            if (response.code === 0) {
              notify('Xóa thành công', 'success', 3000);
              this.loadHoSoToData();  
            } else {
              notify(response.message, 'error', 3000);
            }
          },
          error: (error) => {
            console.error('Error:', error);
            notify('Có lỗi xảy ra', 'error', 3000);
          }
        });
      }
    });
  }

  showAddHoSoPopup() {
    if (!this.selectedToChuyenMon) {
      notify('Vui lòng chọn tổ chuyên môn trước', 'warning', 3000);
      return;
    }

    this.isEditHoSoMode = false;
    this.hoSoPopupTitle = 'Thêm hồ sơ mới';
    this.hoSoFormData = {
      capDo: 1, 
      toChuyenMonId: this.selectedToChuyenMon,
      name: '',
      description: '',
      loaiHoSo: 1,
      fileUrl: '',
      fileName: '',
      loaiTaiLieu: 4,
      riengTu: false,
      hasTag: ''
    };
    this.hoSoPopupVisible = true;
  }

  onEditHoSo(cellInfo: any) {
    const data = cellInfo.data;
    this.isEditHoSoMode = true;
    this.hoSoPopupTitle = 'Cập nhật hồ sơ';
    this.hoSoFormData = {
      id: data.id,
      capDo: data.capDo,
      toChuyenMonId: data.toChuyenMonId,
      name: data.name,
      description: data.description || '',
      loaiHoSo: data.loaiHoSo,
      fileUrl: data.url,
      fileName: data.name,
      loaiTaiLieu: data.loaiTaiLieu || 4,
      riengTu: data.riengTu || false,
      hasTag: data.hasTag || ''
    };
    this.hoSoPopupVisible = true;
  }

  onDownload(cellInfo: any) {
    const data = cellInfo.data;
    if (data.url) {
      window.open(data.url, '_blank');
    } else {
      notify('Không có file để tải xuống', 'warning', 3000);
    }
  }

  onUploadFileStarted(e: any) {
    console.log('Upload started:', e);
  }

  onFileUploaded(e: any) {
    console.log('Upload response:', e);
    if (e.request.status === 200) {
      const response = JSON.parse(e.request.responseText);
      console.log('Parsed response:', response);
      
      // Lấy URL từ response
      this.hoSoFormData.fileUrl = response.url;
      
      // Lấy tên file từ file gốc đã upload
      this.hoSoFormData.fileName = e.file.name;
      
      notify('Tải file thành công', 'success', 3000);
    } else {
      notify('Tải file thất bại', 'error', 3000);
    }
  }

  onFileUploadError(e: any) {
    console.error('Upload error:', e);
    console.error('Error response:', e.request?.responseText);
    notify('Lỗi tải file: ' + (e.request?.responseText || 'Unknown error'), 'error', 5000);
  }

  onSaveHoSo() {
    const validation = this.hoSoFormComponent.instance.validate();
    if (!validation.isValid) return;

    if (!this.hoSoFormData.fileUrl && !this.isEditHoSoMode) {
      notify('Vui lòng tải file lên', 'warning', 3000);
      return;
    }

    const service = this.isEditHoSoMode
      ? this.hoSoGiaoDucService.update(this.hoSoFormData)
      : this.hoSoGiaoDucService.create(this.hoSoFormData);

    service.subscribe({
      next: (response) => {
        if (response.code === 0) {
          notify(this.isEditHoSoMode ? 'Cập nhật thành công' : 'Tạo mới thành công', 'success', 3000);
          this.hoSoPopupVisible = false;
          this.loadHoSoToData();
        } else {
          notify(response.message, 'error', 3000);
        }
      },
      error: (error) => {
        console.error('Error:', error);
        notify('Có lỗi xảy ra', 'error', 3000);
      }
    });
  }

  getLoaiHoSoText(loaiHoSo: number): string {
    const item = this.loaiHoSoList.find(x => x.id === loaiHoSo);
    return item ? item.name : '';
  }

  getCapDoText(capDo: number): string {
    const item = this.capDoList.find(x => x.id === capDo);
    return item ? item.name : '';
  }
}