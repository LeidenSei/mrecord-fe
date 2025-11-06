import { Component, OnInit, ViewChild } from '@angular/core';
import { DxFormComponent } from 'devextreme-angular';
import { HoSoGiaoDucService } from 'src/app/services/ho-so-giao-duc.service';
import { AuthService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-school-records',
  templateUrl: './school-records.component.html',
  styleUrls: ['./school-records.component.scss']
})
export class SchoolRecordsComponent implements OnInit {
  @ViewChild('hoSoFormComponent', { static: false }) hoSoFormComponent: DxFormComponent;

  schoolId: string = '';
  schoolYear: number = new Date().getFullYear();
  loading: boolean = false;

  hoSoDataSource: any[] = [];
  selectedLoaiHoSo: number = null;
  hoSoPopupVisible: boolean = false;
  hoSoPopupTitle: string = 'Thêm hồ sơ mới';
  isEditHoSoMode: boolean = false;
  hoSoFormData: any = {};

  loaiHoSoList: any[] = [
    { id: 1, name: 'Kế hoạch' },
    { id: 2, name: 'Biên bản' },
    { id: 3, name: 'Báo cáo' },
    { id: 4, name: 'Quyết định' },
    { id: 5, name: 'Thông báo' },
    { id: 11, name: 'Văn bản pháp quy' },
    { id: 12, name: 'Quy chế trường' },
    { id: 13, name: 'Kế hoạch năm học' },
    { id: 14, name: 'Báo cáo phụ huynh' },
    { id: 99, name: 'Khác' }
  ];

  uploadUrl: string = '';
  uploadHeaders: any = {};
  allowedFileExtensions: string[] = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

  constructor(
    private hoSoGiaoDucService: HoSoGiaoDucService,
    private authService: AuthService,
    private configService: AppConfigService  
  ) {
    this.uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
    this.uploadHeaders = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
  }

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      console.log('User data:', user);
      
      if (!user || !user.data || !user.data.schoolId) {
        notify('Không tìm thấy thông tin trường', 'error', 3000);
        return;
      }

      this.schoolId = user.data.schoolId;
      console.log('schoolId:', this.schoolId);
      
      this.loadHoSoData();
    } catch (error) {
      console.error('Error getting user:', error);
      notify('Lỗi khi lấy thông tin người dùng', 'error', 3000);
    }
  }

  loadHoSoData() {
    if (!this.schoolId) {
      console.error('schoolId is empty!');
      notify('Không có thông tin trường', 'error', 3000);
      return;
    }

    console.log('Loading data with schoolId:', this.schoolId);
    
    this.loading = true;
    this.hoSoGiaoDucService.getListNhaTruong(
      this.schoolId, 
      this.schoolYear, 
      null,
      this.selectedLoaiHoSo,
      2
    ).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.hoSoDataSource = response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('API Error:', error);
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
          onClick: () => this.loadHoSoData()
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

  showAddHoSoPopup() {
    this.isEditHoSoMode = false;
    this.hoSoPopupTitle = 'Thêm hồ sơ mới';
    this.hoSoFormData = {
      capDo: 2,
      name: '',
      description: '',
      loaiHoSo: 1,
      fileUrl: '',
      fileName: '',
      loaiTaiLieu: 4
    };
    this.hoSoPopupVisible = true;
  }

  onEditHoSo(cellInfo: any) {
    const data = cellInfo.data;
    this.isEditHoSoMode = true;
    this.hoSoPopupTitle = 'Cập nhật hồ sơ';
    this.hoSoFormData = {
      id: data.id,
      capDo: 2,
      name: data.name,
      description: data.description || '',
      loaiHoSo: data.loaiHoSo,
      fileUrl: data.url,
      fileName: data.name,
      loaiTaiLieu: data.loaiTaiLieu || 4
    };
    this.hoSoPopupVisible = true;
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
              this.loadHoSoData();
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
      
      // Lấy tên file từ file gốc đã upload (từ e.file)
      this.hoSoFormData.fileName = e.file.name;
      
      // Hoặc có thể extract từ URL nếu cần
      // const urlParts = response.url.split('/');
      // this.hoSoFormData.fileName = urlParts[urlParts.length - 1];
      
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
          this.loadHoSoData();
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
}