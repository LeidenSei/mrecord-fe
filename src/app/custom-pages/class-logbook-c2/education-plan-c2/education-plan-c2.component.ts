import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EducationPlanC2Service } from '../../../services/education-plan-c2.service';
import { NotificationService } from '../../../services/notification.service';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService } from 'src/app/services';

@Component({
  selector: 'app-education-plan-c2',
  templateUrl: './education-plan-c2.component.html',
  styleUrls: ['./education-plan-c2.component.scss']
})
export class EducationPlanC2Component implements OnInit {
  form: FormGroup;
  activeTab: 'tinhhinh' | 'renluyen' | 'hoctap' | 'sohs' | 'dacdiem' = 'tinhhinh';
  toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean']
  ];

  readonly tinhHinhRows = ['Đầu năm','Giữa học kỳ I','Đầu học kỳ II','Giữa học kỳ II','Cuối năm'];
  readonly chatLuongRows = ['Năm trước','Giữa kỳ I','Học kỳ I','Giữa kỳ II','Học kỳ II','Cả năm'];
  readonly sohsRows = ['Nam','Nữ'];

  schoolId: string = '';
  classSource: any[] = [];
  classId: string = '';
  schoolYear: number = new Date().getFullYear();
  schoolYearSource: Array<{value: number, text: string}> = [];
  term: number = 1;
  editingId: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private generalService: GeneralService,
    private eduService: EducationPlanC2Service,
    private notification: NotificationService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getUser();
    this.schoolId = user.data.schoolId;
    this.schoolYear = user.data.schoolYear || new Date().getFullYear();
    this.initSchoolYearSource();
    this.form = this.fb.group({
      tinhhinh: this.fb.array(this.tinhHinhRows.map(label => this.createTinhHinhRow(label))),
      renluyen: this.fb.array(this.chatLuongRows.map(label => this.createChatLuongRow(label))),
      hoctap: this.fb.array(this.chatLuongRows.map(label => this.createChatLuongRow(label))),
      sohs: this.fb.array(this.sohsRows.map(label => this.createSohsRow(label))),
      dacdiem: [''],
      notes: ['']
    });
    this.loadClasses();
  }

  private initSchoolYearSource(): void {
    const currentYear = new Date().getFullYear();
    this.schoolYearSource = [];
    for (let i = -5; i <= 5; i++) {
      const year = currentYear + i;
      this.schoolYearSource.push({
        value: year,
        text: `${year}-${year + 1}`
      });
    }
  }

  private createTinhHinhRow(label: string): FormGroup {
    return this.fb.group({
      label: [label],
      tongSo: [null, [Validators.min(0)]],
      nu: [null, [Validators.min(0)]],
      doiVienDoanVien: [null, [Validators.min(0)]],
      luuBan: [null, [Validators.min(0)]],
      traiTuyen: [null, [Validators.min(0)]],
      thuongBinh: [null, [Validators.min(0)]],
      lietSi: [null, [Validators.min(0)]],
      canBoCongNhan: [null, [Validators.min(0)]],
      dacBiet: [null, [Validators.min(0)]],
      ghiChu: ['']
    });
  }

  private createChatLuongRow(label: string): FormGroup {
    return this.fb.group({
      label: [label],
      tot: [null, [Validators.min(0)]],
      kha: [null, [Validators.min(0)]],
      dat: [null, [Validators.min(0)]],
      chuaDat: [null, [Validators.min(0)]],
      ghiChu: ['']
    });
  }

  private createSohsRow(label: string): FormGroup {
    return this.fb.group({
      label: [label],
      dauNam: [null, [Validators.min(0)]],
      giuaKy1: [null, [Validators.min(0)]],
      hocKy1: [null, [Validators.min(0)]],
      giuaKy2: [null, [Validators.min(0)]],
      caNam: [null, [Validators.min(0)]],
      ghiChu: ['']
    });
  }

  get tinhhinhArray(): FormArray { return this.form.get('tinhhinh') as FormArray; }
  get renluyenArray(): FormArray { return this.form.get('renluyen') as FormArray; }
  get hoctapArray(): FormArray { return this.form.get('hoctap') as FormArray; }
  get sohsArray(): FormArray { return this.form.get('sohs') as FormArray; }

  switch(tab: 'tinhhinh' | 'renluyen' | 'hoctap' | 'sohs' | 'dacdiem') { this.activeTab = tab; }

  loadClasses() {
    this.generalService.getListClassBySchool(this.schoolId).subscribe(res => {
      this.classSource = res || [];
      if (this.classSource.length > 0) {
        this.classId = this.classSource[0].id;
      }
    });
  }

  onClassChange() {
    if (!this.classId) return;
    this.loadExistingForClass();
  }

  loadExistingForClass() {
    this.eduService.listByClass(this.classId, this.schoolYear, 1, 1).subscribe(res => {
      if (res && res.items && res.items.length > 0) {
        const dto = res.items[0];
        this.editingId = dto.id || '';
        this.patchFormFromDto(dto);
      } else {
        this.initDefault();
      }
    }, () => { this.initDefault(); });
  }

  initDefault() {
    this.eduService.initDefault(this.classId, this.schoolYear).subscribe(dto => {
      this.editingId = dto.id || '';
      this.patchFormFromDto(dto);
    });
  }

  patchFormFromDto(dto: any) {
    const tinh = dto.tinhHinh || [];
    const ren = dto.renLuyen || [];
    const hoc = dto.hocTap || [];
    const ss = dto.sohs || [];
    this.tinhhinhArray.controls.forEach((ctrl, i) => {
      const row = tinh[i] || {};
      ctrl.patchValue(row);
    });
    this.renluyenArray.controls.forEach((ctrl, i) => {
      const row = ren[i] || {};
      ctrl.patchValue(row);
    });
    this.hoctapArray.controls.forEach((ctrl, i) => {
      const row = hoc[i] || {};
      ctrl.patchValue(row);
    });
    this.sohsArray.controls.forEach((ctrl, i) => {
      const row = ss[i] || {};
      ctrl.patchValue(row);
    });
    this.form.get('dacdiem')?.setValue(dto.dacDiemHtml || '');
    this.form.get('notes')?.setValue(dto.notes || '');
    this.cd.detectChanges();
  }

  buildDtoFromForm(): any {
    const dto: any = {};
    dto.id = this.editingId || '';
    dto.classId = this.classId;
    dto.classIds = this.classId ? [this.classId] : [];
    dto.schoolId = this.schoolId;
    dto.schoolYear = this.schoolYear;
    dto.term = this.term;
    dto.tinhHinh = this.tinhhinhArray.value;
    dto.renLuyen = this.renluyenArray.value;
    dto.hocTap = this.hoctapArray.value;
    dto.sohs = this.sohsArray.value;
    dto.dacDiemHtml = this.form.get('dacdiem')?.value || '';
    dto.notes = this.form.get('notes')?.value || '';
    return dto;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.buildDtoFromForm();
    if (payload.id) {
      this.eduService.update(payload).subscribe(res => {
        this.notification.showNotification('success', 'Cập nhật thành công');
        this.editingId = res.id || payload.id;
      }, err => {
        this.notification.showNotification('error', 'Cập nhật thất bại');
      });
    } else {
      this.eduService.create(payload).subscribe(res => {
        this.notification.showNotification('success', 'Lưu thành công');
        this.editingId = res.id || '';
      }, err => {
        this.notification.showNotification('error', 'Lưu thất bại');
      });
    }
  }
}