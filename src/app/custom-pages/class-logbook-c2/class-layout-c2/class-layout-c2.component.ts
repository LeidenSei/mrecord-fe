import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services';
import { ClassLayoutService, ClassLayout, SeatPosition } from '../../../services/class-layout.service';
import { StudentService } from '../../../services/student.service';
import { GeneralService } from '../../../services/general.service';
import { NotificationService } from '../../../services/notification.service';
import { confirm } from 'devextreme/ui/dialog';
import { Constant } from 'src/app/shared/constants/constant.class';

@Component({
  selector: 'app-class-layout-c2',
  templateUrl: './class-layout-c2.component.html',
  styleUrls: ['./class-layout-c2.component.scss']
})
export class ClassLayoutC2Component implements OnInit {
  schoolId: string = '';
  classId: string = '';
  schoolYear: number = 0;
  term: number = 1;
  
  totalRows: number = 8;
  totalColumns: number = 6;
  
  layout: ClassLayout | null = null;
  seats: SeatPosition[][] = [];
  notes: string = ''; // Ghi chú cho sơ đồ lớp học

  classSource: any[] = [];
  availableStudents: any[] = []; // Danh sách học sinh có thể chọn
  allStudents: any[] = []; // Tất cả học sinh trong lớp
  availableStudentsMap: Map<string, any[]> = new Map(); 

  loading: boolean = false;
  showStudentPopup: boolean = false;
  showEditPopup: boolean = false;
  
  selectedSeat: SeatPosition | null = null; // Ô đang chọn để thêm học sinh
  editingSeat: SeatPosition | null = null; // Ô đang edit
  studentSearchText: string = '';
  
  termSource = [
    { value: 1, text: 'Học kỳ 1' },
    { value: 2, text: 'Học kỳ 2' }
  ];
  
  teamSource = [
    { value: 1, text: 'Tổ 1' },
    { value: 2, text: 'Tổ 2' },
    { value: 3, text: 'Tổ 3' },
    { value: 4, text: 'Tổ 4' },
    { value: 5, text: 'Tổ 5' },
    { value: 6, text: 'Tổ 6' }
  ];
  
  // Drag & Drop
  draggedSeat: SeatPosition | null = null;
  
  constructor(
    private authService: AuthService,
    private classLayoutService: ClassLayoutService,
    private studentService: StudentService,
    private generalService: GeneralService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.schoolId = user.data.schoolId;
    this.schoolYear = user.data.schoolYear || new Date().getFullYear();
    
    this.loadClasses();
  }

  loadClasses() {
    this.loading = true;
    this.generalService.getListClassBySchool(this.schoolId).subscribe(
      (classes) => {
        this.classSource = classes;
        if (classes.length > 0) {
          this.classId = classes[0].id;
          this.loadStudents();
          this.loadLayout();
        } else {
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
        this.notificationService.showNotification(Constant.ERROR, 'Không thể tải danh sách lớp');
      }
    );
  }

  onClassChange() {
    if (this.classId) {
      this.loadStudents();
      this.loadLayout();
    }
  }

  loadStudents() {
    this.studentService.getListByClass(this.classId).subscribe(
      (students) => {
        this.allStudents = students;
        this.updateAvailableStudents();
      },
      (error) => {
        this.notificationService.showNotification(Constant.ERROR, 'Không thể tải danh sách học sinh');
      }
    );
  }

  updateAvailableStudents() {
    // Lọc ra những học sinh chưa được xếp chỗ
    const assignedStudentIds = this.seats
      .flat()
      .filter(seat => !seat.isEmpty && seat.studentId)
      .map(seat => seat.studentId);

    this.availableStudents = this.allStudents.filter(
      student => !assignedStudentIds.includes(student.id)
    );

    // Cập nhật cache cho từng vị trí
    this.rebuildAvailableStudentsCache();
  }

  // Rebuild cache danh sách học sinh cho từng vị trí (tránh lag)
  rebuildAvailableStudentsCache() {
    this.availableStudentsMap.clear();

    // Lấy danh sách ID học sinh đã được xếp chỗ
    const assignedStudentIds = this.seats
      .flat()
      .filter(s => !s.isEmpty && s.studentId)
      .map(s => s.studentId);

    // Duyệt qua từng vị trí và tạo cache
    this.seats.forEach(rowSeats => {
      rowSeats.forEach(seat => {
        const key = `${seat.row}-${seat.column}`;

        // Lọc học sinh: chưa có chỗ HOẶC đang ngồi ở vị trí này
        const availableForSeat = this.allStudents.filter(student =>
          !assignedStudentIds.includes(student.id) || student.id === seat.studentId
        );

        this.availableStudentsMap.set(key, availableForSeat);
      });
    });
  }

  // Lấy danh sách học sinh có thể chọn cho một vị trí cụ thể (đã được cache)
  getAvailableStudentsForSeat(seat: SeatPosition): any[] {
    const key = `${seat.row}-${seat.column}`;
    return this.availableStudentsMap.get(key) || [];
  }

  loadLayout() {
    if (!this.classId) return;

    this.loading = true;
    this.classLayoutService.getByClass(this.classId, this.schoolYear, this.term).subscribe(
      (layout) => {
        this.layout = layout;
        this.totalRows = layout.totalRows;
        this.totalColumns = layout.totalColumns;
        this.notes = layout.notes || '';
        this.buildSeatsMatrix(layout.seats);
        this.updateAvailableStudents();
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.notificationService.showNotification(Constant.ERROR, 'Không thể tải sơ đồ lớp học');
      }
    );
  }

  buildSeatsMatrix(seats: SeatPosition[]) {
    this.seats = [];
    for (let row = 1; row <= this.totalRows; row++) {
      const rowSeats: SeatPosition[] = [];
      for (let col = 1; col <= this.totalColumns; col++) {
        const seat = seats.find(s => s.row === row && s.column === col);
        if (seat) {
          rowSeats.push(seat);
        } else {
          rowSeats.push({
            row: row,
            column: col,
            isEmpty: true
          });
        }
      }
      this.seats.push(rowSeats);
    }
  }

  // Click vào ô để thêm/chỉnh sửa học sinh
  onSeatClick(seat: SeatPosition) {
    if (seat.isEmpty) {
      // Ô trống - mở popup chọn học sinh
      this.selectedSeat = seat;
      this.showStudentPopup = true;
    }
  }

  // Chọn học sinh từ popup
  selectStudent(event: any) {
    const student = event.itemData;

    if (this.selectedSeat) {
      this.selectedSeat.studentId = student.id;
      this.selectedSeat.studentName = student.fullName;
      this.selectedSeat.studentCode = student.code;
      this.selectedSeat.isEmpty = false;

      this.updateAvailableStudents();
      this.showStudentPopup = false;
      this.selectedSeat = null;

      this.notificationService.showNotification(Constant.SUCCESS,'Đã thêm học sinh vào vị trí');
    }
  }

  // Chọn hoặc thay đổi học sinh trong ô
  onStudentChanged(event: any, seat: SeatPosition) {
    if (!event.value) {
      // Clear seat
      seat.studentId = undefined;
      seat.studentName = undefined;
      seat.studentCode = undefined;
      seat.isEmpty = true;

      // Cập nhật lại cache để các select box khác có thể chọn học sinh này
      this.rebuildAvailableStudentsCache();
      return;
    }

    const student = this.allStudents.find(s => s.id === event.value);
    if (!student) {
      return;
    }

    seat.studentId = student.id;
    seat.studentName = student.fullName;
    seat.studentCode = student.code;
    seat.isEmpty = false;

    // Cập nhật lại cache để các select box khác không thể chọn học sinh này
    this.rebuildAvailableStudentsCache();
  }

  // Edit seat
  editSeat(event: Event, seat: SeatPosition) {
    event.stopPropagation();
    this.editingSeat = { ...seat };
    this.showEditPopup = true;
  }

  // Save edit
  saveEditSeat() {
    if (!this.editingSeat || !this.layout?.id) return;
    
    const request = {
      layoutId: this.layout.id,
      row: this.editingSeat.row,
      col: this.editingSeat.column,
      teamNumber: this.editingSeat.teamNumber || undefined
    };
    
    this.classLayoutService.updateTeamNumber(request).subscribe(
      () => {
        // Cập nhật trong seats matrix
        const seat = this.seats
          .flat()
          .find(s => s.row === this.editingSeat!.row && s.column === this.editingSeat!.column);
        
        if (seat) {
          seat.teamNumber = this.editingSeat!.teamNumber;
        }
        
        this.notificationService.showNotification(Constant.SUCCESS,'Cập nhật thành công');
        this.showEditPopup = false;
        this.editingSeat = null;
      },
      (error) => {
        this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại');
      }
    );
  }

  // Remove student from seat
  removeSeat(event: Event, seat: SeatPosition) {
    event.stopPropagation();

    seat.studentId = undefined;
    seat.studentName = undefined;
    seat.studentCode = undefined;
    seat.teamNumber = undefined;
    seat.isEmpty = true;

    // Cập nhật lại cache
    this.rebuildAvailableStudentsCache();

    this.notificationService.showNotification(Constant.SUCCESS,'Đã xóa học sinh khỏi vị trí');
  }

  autoArrange() {
    if (!this.classId) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng chọn lớp học');
      return;
    }

    const request = {
      classId: this.classId,
      totalRows: this.totalRows,
      totalColumns: this.totalColumns,
      schoolYear: this.schoolYear,
      term: this.term
    };

    this.loading = true;
    this.classLayoutService.autoArrange(request).subscribe(
      (layout) => {
        this.layout = layout;
        this.notes = layout.notes || '';
        this.buildSeatsMatrix(layout.seats);
        this.updateAvailableStudents();
        this.loading = false;
        this.notificationService.showNotification(Constant.SUCCESS,'Sắp xếp tự động thành công');
      },
      (error) => {
        this.loading = false;
        this.notificationService.showNotification(Constant.ERROR, 'Không thể tự động sắp xếp');
      }
    );
  }

  save() {
    // Validate input
    if (this.totalRows < 1 || this.totalRows > 12) {
      this.notificationService.showNotification(Constant.WARNING, 'Số dãy phải từ 1 đến 12');
      return;
    }

    if (this.totalColumns < 1 || this.totalColumns > 10) {
      this.notificationService.showNotification(Constant.WARNING, 'Số hàng phải từ 1 đến 10');
      return;
    }

    // Nếu chưa có layout, tạo mới
    if (!this.layout) {
      const selectedClass = this.classSource.find(c => c.id === this.classId);
      this.layout = {
        schoolId: this.schoolId,
        classId: this.classId,
        className: selectedClass?.name || '',
        schoolYear: this.schoolYear,
        term: this.term,
        totalRows: this.totalRows,
        totalColumns: this.totalColumns,
        seats: []
      };
    }

    // Kiểm tra nếu số hàng/dãy thay đổi, rebuild seats matrix
    if (this.layout.totalRows !== this.totalRows || this.layout.totalColumns !== this.totalColumns) {
      // Lưu lại các student đã assign
      const existingSeats = this.seats.flat();

      // Rebuild seats matrix với size mới
      this.seats = [];
      for (let row = 1; row <= this.totalRows; row++) {
        const rowSeats: SeatPosition[] = [];
        for (let col = 1; col <= this.totalColumns; col++) {
          // Tìm xem vị trí này có student cũ không
          const oldSeat = existingSeats.find(s => s.row === row && s.column === col);
          if (oldSeat) {
            rowSeats.push(oldSeat);
          } else {
            rowSeats.push({
              row: row,
              column: col,
              isEmpty: true
            });
          }
        }
        this.seats.push(rowSeats);
      }
    }

    // Flatten seats matrix back to array
    const allSeats: SeatPosition[] = [];
    this.seats.forEach(row => {
      row.forEach(seat => {
        allSeats.push(seat);
      });
    });

    this.layout.seats = allSeats;
    this.layout.totalRows = this.totalRows;
    this.layout.totalColumns = this.totalColumns;
    this.layout.notes = this.notes;

    console.log('Saving layout:', this.layout);

    this.loading = true;
    this.classLayoutService.save(this.layout).subscribe(
      (response: ClassLayout) => {
        console.log('Save response:', response);
        this.loading = false;

        // Update layout with response
        this.layout = response;

        this.notificationService.showNotification(Constant.SUCCESS,'Lưu sơ đồ lớp học thành công');
      },
      (error) => {
        console.error('Save error:', error);
        this.loading = false;
        this.notificationService.showNotification(Constant.ERROR, 'Lưu sơ đồ lớp học thất bại: ' + (error.error?.message || error.message));
      }
    );
  }

  // Drag & Drop functionality
  onDragStart(seat: SeatPosition, event: DragEvent) {
    if (seat.isEmpty) {
      event.preventDefault();
      return;
    }
    this.draggedSeat = seat;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(targetSeat: SeatPosition, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.draggedSeat || !this.layout) return;
    
    if (this.draggedSeat.row === targetSeat.row && this.draggedSeat.column === targetSeat.column) {
      this.draggedSeat = null;
      return;
    }
    
    const request = {
      layoutId: this.layout.id!,
      row1: this.draggedSeat.row,
      col1: this.draggedSeat.column,
      row2: targetSeat.row,
      col2: targetSeat.column
    };
    
    this.loading = true;
    this.classLayoutService.swapSeats(request).subscribe(
      () => {
        this.loading = false;
        this.notificationService.showNotification(Constant.SUCCESS,'Đổi chỗ thành công');
        this.loadLayout();
      },
      (error) => {
        this.loading = false;
        this.notificationService.showNotification(Constant.ERROR, 'Đổi chỗ thất bại');
      }
    );
    
    this.draggedSeat = null;
  }

  onDragEnd() {
    this.draggedSeat = null;
  }

  applyLayout() {
    if (this.totalRows < 1 || this.totalRows > 12) {
      this.notificationService.showNotification(Constant.WARNING, 'Số dãy phải từ 1 đến 12');
      return;
    }

    if (this.totalColumns < 1 || this.totalColumns > 10) {
      this.notificationService.showNotification(Constant.WARNING, 'Số hàng phải từ 1 đến 10');
      return;
    }

    // Create empty seats matrix
    this.seats = [];
    for (let row = 1; row <= this.totalRows; row++) {
      const rowSeats: SeatPosition[] = [];
      for (let col = 1; col <= this.totalColumns; col++) {
        rowSeats.push({
          row: row,
          column: col,
          isEmpty: true
        });
      }
      this.seats.push(rowSeats);
    }

    if (!this.layout) {
      const selectedClass = this.classSource.find(c => c.id === this.classId);
      this.layout = {
        schoolId: this.schoolId,
        classId: this.classId,
        className: selectedClass?.name || '',
        schoolYear: this.schoolYear,
        term: this.term,
        totalRows: this.totalRows,
        totalColumns: this.totalColumns,
        seats: []
      };
    }

    this.updateAvailableStudents();
  }

  // Xử lý khi số hàng/cột thay đổi
  onLayoutSizeChanged() {
    if (!this.classId) {
      return;
    }

    if (this.totalRows < 1 || this.totalRows > 12) {
      return;
    }

    if (this.totalColumns < 1 || this.totalColumns > 10) {
      return;
    }

    // Lưu lại học sinh đã được xếp
    const existingSeats = this.seats.flat();

    // Rebuild seats matrix
    this.seats = [];
    for (let row = 1; row <= this.totalRows; row++) {
      const rowSeats: SeatPosition[] = [];
      for (let col = 1; col <= this.totalColumns; col++) {
        // Tìm học sinh ở vị trí này (nếu có)
        const oldSeat = existingSeats.find(s => s.row === row && s.column === col);
        if (oldSeat) {
          rowSeats.push(oldSeat);
        } else {
          rowSeats.push({
            row: row,
            column: col,
            isEmpty: true
          });
        }
      }
      this.seats.push(rowSeats);
    }

    // Cập nhật layout object nếu có
    if (this.layout) {
      this.layout.totalRows = this.totalRows;
      this.layout.totalColumns = this.totalColumns;
    }
  }

  deleteLayout() {
    if (!this.layout?.id) return;
    
    const result = confirm('Bạn có chắc chắn muốn xóa sơ đồ lớp học này?', 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.loading = true;
        this.classLayoutService.deleteLayout(this.layout!.id!).subscribe(
          () => {
            this.loading = false;
            this.notificationService.showNotification(Constant.SUCCESS,'Xóa sơ đồ lớp học thành công');
            this.layout = null;
            this.seats = [];
          },
          (error) => {
            this.loading = false;
            this.notificationService.showNotification(Constant.ERROR, 'Xóa sơ đồ lớp học thất bại');
          }
        );
      }
    });
  }
// Xử lý khi thay đổi tổ
  onTeamChanged(event: any, seat: SeatPosition) {
    if (!this.layout || !this.layout.id) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng lưu sơ đồ trước khi cập nhật tổ');
      // Reset lại giá trị cũ
      setTimeout(() => {
        seat.teamNumber = event.previousValue;
      }, 0);
      return;
    }
    
    const newTeamNumber = event.value;
    
    const request = {
      layoutId: this.layout.id,
      row: seat.row,
      col: seat.column,
      teamNumber: newTeamNumber || undefined
    };
    
    this.classLayoutService.updateTeamNumber(request).subscribe(
      () => {
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật số tổ thành công');
      },
      (error) => {
        this.notificationService.showNotification(Constant.ERROR,'Cập nhật số tổ thất bại');
        // Rollback về giá trị cũ
        seat.teamNumber = event.previousValue;
      }
    );
  }
  printLayout() {
    window.print();
  }
}