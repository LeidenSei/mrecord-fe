import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseService} from "./base-service.service";
import {UrlConstant} from "../shared/constants/url.class";

@Injectable({
  providedIn: 'root'
})
export class GeneralService extends BaseService {

  nativeGlobal() { return window }
  getDsBaoHiemOto(): Observable<any[]> {
    return this.get('/BaoHiemOtoF02/GetList');
  }


  getDsBaoHiemOtoById(id: number): Observable<any> {
    return this.get(`/BaoHiemOtoF02/GetDetail/${id}`);
  }

  addBaoHiemOto(payload: any): Observable<any> {
    return this.post('/BaoHiemOtoF02/Insert', payload);
  }

  updateBaoHiemOto(payload: any): Observable<any> {
    return this.put(`/BaoHiemOtoF02/Update/${payload.id}`, payload, 'text');
  }

  deleteBaoHiem(id: number): Observable<number> {
    return this.delete(`/BaoHiemOtoF02/Delete/${id}`, null);
  }

  loadPhiBaoHiemTNDS(payload: any): Observable<any> {
    return this.post('/BaoHiemOtoF02/LoadPhiBaoHiemTNDS', payload);
  }

  submitApproveBaoHiemOto(payload: any): Observable<any> {
    return this.post('/BaoHiemOtoF02/TrinhDuyet', payload);
  }

  doApproveBaoHiemOto(payload: any): Observable<any> {
    return this.post('/BaoHiemOtoF02/XacNhanDuyet', payload);
  }

  //Khách hàng
  getDmKhachHangs(params: any): Observable<any> {
    return this.post('/DmKhachHang/GetDsKhachHang', params);
  }

  addKhachHang(payload: any): Observable<any> {
    return this.post('/DmKhachHang/Insert', payload);
  }

  updateKhachHang(payload: any): Observable<any> {
    return this.put(`/DmKhachHang/Update/${payload.id}`, payload, 'text');
  }

  //End khách hàng

  changePassword(payload: any): Observable<any> {
    return this.post(`/User/ChangePassword`, payload);
  }

  getDmNguonDv(): Observable<any[]> {
    return this.get('/DmNguonDichVu');
  }

  getDmNguonDvct(payload: any): Observable<any[]> {
    return this.post('/DmNguonDichVu/GetNguonDvct', payload);
  }

  getBanks(): Observable<any[]> {
    return this.get('/DmNguonDichVu/GetDsNganHang');
  }

  getDmNhomXe(): Observable<any[]> {
    return this.get('/DanhMuc/GetDmNhomXe');
  }

  getDmLoaiXe(): Observable<any[]> {
    return this.get('/DanhMuc/GetDmLoaiXe');
  }

  getDmHangXe(): Observable<any[]> {
    return this.get('/DanhMuc/GetDmHangXe');
  }

  getDmNhanHieuXe(hangXe: any): Observable<any[]> {
    return this.get(`/DanhMuc/GetDmKyHieuXe/${hangXe}`);
  }

  //old
  getCoQuans(params: any): Observable<any> {
    return this.get('/DmCoQuan', params);
  }

  //phong
  getPhong(): Observable<any[]> {
    return this.get(UrlConstant.LIST_PHONG);
  }

  getChiTietPhong(id: number): Observable<any[]> {
    return this.get(UrlConstant.LIST_PHONG + '/' + id);
  }

  deletePhong(id: number): Observable<number> {
    return this.delete(UrlConstant.LIST_PHONG + '/' + id, null);
  }

  addPhong(item: any): any {
    return this.post(UrlConstant.LIST_PHONG, item);
  }

  updatePhong(item: any): any {
    return this.put(UrlConstant.LIST_PHONG + '/' + item.id, item, 'text');
  }

  //loaimon
  getLoaimon(): Observable<any[]> {
    return this.get(UrlConstant.LIST_LOAIMON);
  }

  deleteLoaimon(id: number): Observable<any> {
    return this.delete(UrlConstant.LIST_LOAIMON + '/' + id, null);
  }

  addLoaimon(item: any): any {
    return this.post(UrlConstant.LIST_LOAIMON, item);
  }

  updateLoaimon(item: any): any {
    return this.put(UrlConstant.LIST_LOAIMON + '/' + item.id, item, 'text');
  }

  //taikhoan
  getTaikhoan(): Observable<any[]> {
    return this.get(UrlConstant.LIST_TAIKHOAN);
  }

  deleteTaikhoan(id: number): Observable<number> {
    return this.delete(UrlConstant.LIST_TAIKHOAN + '/' + id, null);
  }

  addTaikhoan(item: any): any {
    return this.post(UrlConstant.LIST_TAIKHOAN, item);
  }

  updateTaikhoan(item: any): any {
    return this.put(UrlConstant.LIST_TAIKHOAN + '/' + item.id, item, 'text');
  }

  // danh muc
  getListGradeOfSchool(schoolId: any): Observable<any> {
    return this.get(`/School/ListGradeOfSchool?id=${schoolId}`);
  }
  getSchool(schoolId: any): Observable<any> {
    return this.get(`/School?Id=${schoolId}`);
  }
  getListSubjectBySchool(schoolId: any): Observable<any> {
    return this.get(`/Subject/ListBySchool?SchoolId=${schoolId}`);
  }
  getListClassBySchool(schoolId: any): Observable<any> {
    return this.get(`/Class/ListBySchool?SchoolId=${schoolId}`);
  }
  getListClassGDBySchool(schoolId: any, schoolYear: any): Observable<any> {
    return this.get(`/ClassGD/ListBySchool?SchoolId=${schoolId}&SchoolYear=${schoolYear}`);
  }
  getListClassGDByGVCN(schoolId: any, schoolYear: any, teacherId: any): Observable<any> {
    return this.get(`/ClassGD/ListByGVCN?SchoolId=${schoolId}&SchoolYear=${schoolYear}&TeacherId=${teacherId}`);
  }

  getListByTTCM(): Observable<any> {
    return this.get(`/Class/ListByTTCM`);
  }

  getListClassByTeacher(schoolId: any, teacherId: any): Observable<any> {
    return this.get(`/Class/ListByTeacher?SchoolId=${schoolId}&TeacherId=${teacherId}`);
  }
  getListSubjectByTeacher(schoolId: any, teacherId: any): Observable<any> {
    return this.get(`/Subject/ListByTeacher?SchoolId=${schoolId}&TeacherId=${teacherId}`);
  }



  getListTeacherBySchool(schoolId: any): Observable<any> {
    return this.get(`/Staff/ListStaffBySchool?SchoolId=${schoolId}`);
  }
  getTeacherGDByMSId(schoolYear: any, teacherId: any): Observable<any> {
    return this.get(`/Staff/GetTeacherGDByMSId?SchoolYear=${schoolYear}&TeacherId=${teacherId}`);
  }
  getTeacherMSByGDId(schoolYear: any, teacherId: any): Observable<any> {
    return this.get(`/Staff/GetTeacherMSByGDId?SchoolYear=${schoolYear}&TeacherId=${teacherId}`);
  }
  getListSubjectWithTTCM(schoolId: any): Observable<any> {
    return this.get(`/Subject/ListWithTTCM?SchoolId=${schoolId}`);
  }
  //GV Sở GD
  getListTeacherGDBySchoolYear(schoolId: any, schoolYear: number): Observable<any> {
    return this.get(`/Staff/ListTeacherGDBySchoolYear?SchoolId=${schoolId}&SchoolYear=${schoolYear}`);
  }
  getListHomeRoomTeacherGDBySchoolYear(schoolId: any, schoolYear: number): Observable<any> {
    return this.get(`/Staff/ListHomeRoomTeacherGDBySchoolYear?SchoolId=${schoolId}&SchoolYear=${schoolYear}`);
  }
  //upload
  upload(FormData: any): Observable<any> {
    return this.post('/file/uploadFile', FormData);
  }

  //Khoahoc
  getKhoaHocChiaSeChung(payload: any): Observable<any> {
    return this.get('/KhoaHoc/KhoaHocChiaSeChung', payload);
  }
  getKhoaHocDuThiGiaoVienGioi(payload: any): Observable<any> {
    return this.get('/KhoaHoc/KhoaHocDuThiGiaoVienGioi', payload);
  }
  getKhoaHocTruong(payload: any): Observable<any> {
    return this.get('/KhoaHoc/KhoaHocTruong', payload);
  }
  getKhoaHocCanDuyet(payload: any): Observable<any> {
    return this.get('/KhoaHoc/KhoaHocCanDuyet', payload);
  }
  getKhoaHocLop(payload: any): Observable<any> {
    return this.get('/KhoaHoc/KhoaHocLop', payload);
  }

  getTeacherCourse(payload: any): Observable<any> {
    return this.get('/KhoaHoc/MyCourse', payload);
  }

  getKhoaHoc(id: any) {
    return this.get(`/KhoaHoc?khoaHocId=${id}`);
  }

  addKhoaHoc(payload: any): Observable<any> {
    return this.post('/KhoaHoc', payload);
  }

  updateKhoaHoc(payload: any): Observable<any> {
    return this.put('/KhoaHoc', payload);
  }

  deleteKhoaHoc(id: any): Observable<number> {
    return this.delete(`/KhoaHoc?id=${id}`, id);
  }
  updateCourseClass(payload): Observable<number> {
    return this.post(`/KhoaHoc/CapNhatLop`, payload);
  }
  getLessonByCourse(courseId: any): Observable<any> {
    return this.get(`/KhoaHoc/ListHocLieuByCourse?khoaHocId=${courseId}`);
  }
  getLessonNoResultByCourse(courseId: any, studentId: any): Observable<any> {
    return this.get(`/KhoaHoc/ListHocLieuChuaHoanThanhByCourse?khoaHocId=${courseId}&studentId=${studentId}`);
  }
  getLessonWithResultByCourse(courseId: any, studentId: any): Observable<any> {
    return this.get(`/KhoaHoc/ListHocLieuWithResultByCourse?studentId=${studentId}&khoaHocId=${courseId}`);
  }

  approveKhoaHoc(khoaHocId: any): Observable<any> {
    return this.post('/KhoaHoc/Duyet?khoaHocId=' + khoaHocId, null);
  }

  getKhoaHocDuyet(payload: any): Observable<any> {
    return this.get('/KhoaHoc/DanhSachDuyet', payload);
  }
  getKetQuaLamBaiKhoaHoc(payload): Observable<any> {
    return this.get(`/KhoaHoc/KetQuaLamBaiKhoaHoc`, payload);
  }

  setSortingHocLieu(payload: any): Observable<any> {
    return this.post(`/KhoaHoc/SetSortingHocLieu`, payload);
  }
  //Bai giang Lesson
  addBaiGiang(payload: any): Observable<any> {
    return this.post('/BaiGiang', payload);
  }

  updateBaiGiang(payload: any): Observable<any> {
    return this.put('/BaiGiang', payload);
  }

  deleteBaiGiang(id: any): Observable<any> {
    return this.delete(`/BaiGiang?id=${id}`, id);
  }
  deleteTaiLieu(id: any): Observable<number> {
    return this.delete(`/TaiLieu?id=${id}`, id);
  }
  getBaiGiang(id: any) {
    return this.get(`/BaiGiang?id=${id}`);
  }

  getListBaiGiang(payload): Observable<any> {
    return this.get(`/BaiGiang/ListBaiGiang`, payload);
  }
  xemBaiGiang(lessonId: any, studentId: any): Observable<any> {
    return this.post(`/BaiGiang/View/${lessonId}/${studentId}`, null);
  }
  updateKetQuaBaiGiang(payload: any): Observable<any> {
    return this.post('/BaiGiang/UpdateKetQua', payload);
  }
  getBaiGiangViewKetQua(payload): Observable<any> {
    return this.get(`/BaiGiang/ListBaiGiangViewKetQua`, payload);
  }

  getListHocLieuForApprove(courseId: any): Observable<any> {
    return this.get(`/KhoaHoc/ListHocLieuCourseForApprove?khoaHocId=${courseId}`);
  }
  //Thống kê
  thongKeNoiDungPGD(): Observable<any[]> {
    return this.get('/Edu/ThongKeNoiDungPGD');
  }

  top3GVTC(): Observable<any[]> {
    return this.get('/Dashboard/Top3GVTC');
  }

  thongKeTheoKhoi(): Observable<any> {
    return this.get('/Dashboard/ThongKeTheoKhoi');
  }

  thongKeGVSuDung(): Observable<any> {
    return this.get('/Dashboard/ThongKeGVSuDung');
  }

  //Tai lieu
  addTaiLieu(payload: any): Observable<any> {
    return this.post('/TaiLieu', payload);
  }

  updateTaiLieu(payload: any): Observable<any> {
    return this.put('/TaiLieu', payload);
  }

  getTaiLieu(id: any): Observable<any> {
    return this.get(`/TaiLieu?id=${id}`);
  }

  //Staff
  getStaffById(id: any): Observable<any> {
    return this.get(`/Staff?Id=${id}`);
  }

  //BinhLuan
  getDanhGiaBaiGiang(id: any): Observable<any> {
    return this.get(`/BinhLuan/BinhLuanBaiGiang?id=${id}`);
  }

//Tai lieu
  addBinhLuan(payload: any): Observable<any> {
    return this.post('/BinhLuan', payload);
  }

  //School
  getHCMSchools(): Observable<any[]> {
    return this.get('/Login/HCMSchools');
  }

  //Role
  getRole(): Observable<any[]> {
    return this.get(UrlConstant.LIST_ROLE);
  }

  ssoLogin(payload: any): Observable<any> {
    return this.post('/Login/SSOLoginV2', payload);
  }
  mSchoolLogin(payload: any): Observable<any> {
    return this.post('/Login/IschoolLogin', payload);
  }
  //sso
  ssoLoginModel(): Observable<any> {
    let payload = {
      isHocSinh: true,
      returnURL: this.configService.getConfig().api.curUrl + '/sso'
    }
    return this.get(`/Login/SSOLoginModelV2`, payload);
  }

  getGiaoVienTokenSSO(schoolId) {
    let payload = {
      schoolId,
      isHocSinh: false,
      returnURL: this.configService.getConfig().api.curUrl + '/sso'
    }
    return this.get(`/Login/SSOLoginModel`, payload);
  }
  //Homework
  getGetListHomework(payload): Observable<any[]> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/GetListHomework2`
    return this.postExternal(url, payload);
  }
  getStudentHomework(payload): Observable<any[]> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/GetListHomeworkByStudent2`
    return this.postExternal(url, payload);
  }
  saveHomework(payload): Observable<any[]> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/CreateHomework`
    return this.postExternal(url, payload);
  }
  saveHomeworkResult(payload): Observable<any> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/SaveHomeworkResult`
    return this.postExternal(url, payload);
  }
  saveHomeworkResultAuto(payload): Observable<any> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/SaveHomeworkResult`
    return this.postExternal(url, payload);
  }
  teacherMarking(payload): Observable<any> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/TeacherMarking`
    return this.postExternal(url, payload);
  }
  getListHomeworkResultByClass(homeworkId, classId) {
    let url =  this.configService.getConfig().api.mSchoolUrl + `/api/Homework/GetListHomeworkResultByClass?homeworkId=${homeworkId}&classId=${classId}`;
    return this.getExternal(url);
  }
  deleteHomework(id: any): Observable<number> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Homework/Delete/${id}`
    return this.deleteExternal(url, null);
  }
  //Meeting online room
  addPhongHop(payload: any): Observable<any> {
    return this.post('/PhongHocTrucTuyen', payload);
  }

  updatePhongHop(payload: any): Observable<any> {
    return this.put('/PhongHocTrucTuyen', payload);
  }

  getPhongHopById(id: any): Observable<any> {
    return this.get(`/PhongHocTrucTuyen?phttId=${id}`);
  }
  getListPhongHop(payload: any): Observable<any> {
    return this.get(`/PhongHocTrucTuyen/ListPHTT`, payload);
  }
  deletePhongHop(id: any): Observable<any> {
    return this.delete(`/PhongHocTrucTuyen/Delete/${id}`, null);
  }

  //Exam paper
  getListExamPaper(payload): Observable<any[]> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Homework/GetListExamPaper`;
    return this.postExternal(url, payload);
  }
  saveExamPaper(payload): Observable<any[]> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/SaveExamPaper`
    return this.postExternal(url, payload);
  }
  saveExamPaperAuto(payload): Observable<any[]> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/HomeWork/SaveExamPaperAuto`
    return this.postExternal(url, payload);
  }
  getExamPaperResult(payload): Observable<any> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Homework/GetExamPaperResult`
    return this.postExternal(url, payload);
  }
  deleteExamPaper(id: any): Observable<number> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Homework/DeleteExamPaper/${id}`
    return this.deleteExternal(url, null);
  }
  getTKBaiTap(schoolId){
    const payload = {
      schoolId
    }
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Homework/GetTKBaiTapByUser`
    return this.postExternal(url, payload);
  }
  getTKHocBa(schoolId){
    const payload = {
      schoolId
    }
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Homework/GetTKHocBa`
    return this.postExternal(url, payload);
  }

  getStudentExamPaper(payload: any): Observable<any> {
    return this.get('/api/ExamPaper/ByStudent', payload);
  }
  startExam(payload: any): Observable<any> {
    return this.post(`/api/ExamPaper/StartExam`, payload);
  }
  saveStudentExamResult(payload: any): Observable<any> {
    return this.post(`/api/ExamPaper/SaveResult`, payload);
  }
  saveStudentExamAutoResult(payload: any): Observable<any> {
    return this.post(`/api/ExamPaper/SaveResultAuto`, payload);
  }
  getStudentExamPaperResult(payload: any): Observable<any> {
    return this.get('/api/ExamPaper/GetStudentResults', payload);
  }

  removeStudentResults(payload): Observable<any> {
    return this.post(`/api/ExamPaper/RemoveStudentResults`, payload);
  }
  //Phe duyet BaiGiang
  tcmDuyetBaiGiang(lessonId: any): Observable<any> {
    return this.post(`/BaiGiang/TCMDuyet?baiGiangId=${lessonId}`, null);
  }
  tcmTuChoiBaiGiang(payload: any): Observable<any> {
    return this.post('/BaiGiang/TCMTuChoi', payload);
  }
  bghDuyetBaiGiang(lessonId: any): Observable<any> {
    return this.post(`/BaiGiang/BGHDuyet?baiGiangId=${lessonId}`, null);
  }
  bghTuChoiBaiGiang(payload: any): Observable<any> {
    return this.post('/BaiGiang/BGHTuChoi', payload);
  }
  //Phe duyet TaiLieu
  tcmDuyetTaiLieu(lessonId: any): Observable<any> {
    return this.post(`/TaiLieu/TCMDuyet?taiLieuId=${lessonId}`, null);
  }
  tcmTuChoiTaiLieu(payload: any): Observable<any> {
    return this.post('/TaiLieu/TCMTuChoi', payload);
  }
  bghDuyetTaiLieu(lessonId: any): Observable<any> {
    return this.post(`/TaiLieu/BGHDuyet?taiLieuId=${lessonId}`, null);
  }
  bghTuChoiTaiLieu(payload: any): Observable<any> {
    return this.post('/TaiLieu/BGHTuChoi', payload);
  }
  //Phe duyet KhoaHoc

  bghDuyetKhoaHoc(courseId: any): Observable<any> {
    return this.post(`/KhoaHoc/BGHDuyet?khoaHocId=${courseId}`, null);
  }
  bghDuyetKhoaHocAll(payload: any): Observable<any> {
    return this.post(`/KhoaHoc/BGHDuyetAll`, payload);
  }
  tcmDuyetKhoaHoc(courseId: any): Observable<any> {
    return this.post(`/KhoaHoc/Duyet?khoaHocId=${courseId}`, null);
  }

  fixKetQuaBaiGiang(payload: any): Observable<any> {
    return this.post(`/BaiGiang/FixKetQuaBaiGiang`, payload);
  }

  //Student
  getListStudentByClass(classId: any): Observable<any> {
    return this.get(`/Student/ListByClass?classId=${classId}`);
  }
  getListStudentByClass2(classId: any): Observable<any> {
    return this.get(`/Student/ListByClass2?classId=${classId}`);
  }

  //To chuyen mon
  updateTTCM(payload): Observable<any> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Config/UpdateTTCM`
    return this.postExternal(url, payload);
  }
  updateTTCMKhoi(payload): Observable<any> {
    let url = this.configService.getConfig().api.mSchoolUrl + `/api/Config/UpdateTTCMKhoi`
    return this.postExternal(url, payload);
  }

  //Thong ke
  getThongKeBaiGiang(payload: any): Observable<any> {
    return this.post(`/KhoaHoc/ThongKeBaiGiang`, payload);
  }
  getThongKeTinNhan(payload: any): Observable<any> {
    return this.post(`/Message/ThongKeTinNhanPCT2`, payload);
  }
  getThongKeBaiGiangGiaoVien(payload: any): Observable<any> {
    return this.post(`/KhoaHoc/ThongKeBaiGiangTheoGiaoVien`, payload);
  }
  getThongKeBaiGiangGiaoVienThang(payload: any): Observable<any> {
    return this.post(`/KhoaHoc/ThongKeBaiGiangThang`, payload);
  }
  getThongKeTyLeHoanThanhKhoaHoc(payload: any): Observable<any> {
    return this.post(`/KhoaHoc/ThongKeTyLeHoanThanhKhoaHoc2`, payload);
  }

  updateStudentStatus(payload): Observable<number> {
    return this.post(`/Student/UpdateStatus`, payload);
  }
  updateStudentStatusMS(payload): Observable<number> {
    return this.post(`/Student/UpdateMSStatus`, payload);
  }
  getListStudentByIds(payload: any): Observable<any> {
    return this.post(`/Student/ListByIds`, payload);
  }
  getThongKeBaiGiangGiaoVienTCM(payload: any): Observable<any> {
    return this.post(`/Dashboard/ThongKeBaiGiangGiaoVienTCM`, payload);
  }

  //Lớp bán trú
  addClassCustom(payload: any): Observable<any> {
    return this.post('/ClassCustom', payload);
  }

  updateClassCustom(payload: any): Observable<any> {
    return this.put('/ClassCustom', payload);
  }
  getListClassCustomBySchool(schoolId: any): Observable<any> {
    return this.get(`/ClassCustom/ListBySchool?SchoolId=${schoolId}`);
  }

  addStudents2CustomClass(payload: any): Observable<any> {
    return this.post('/ClassCustom/AddStudents', payload);
  }
  deleteClassCustom(id: any): Observable<any> {
    return this.delete(`/ClassCustom?id=${id}`, id);
  }
  getClassCustomStudent(classId: any): Observable<any> {
    return this.get(`/ClassCustom/ListStudent?ClassId=${classId}`);
  }

  //Giáo án
  addGiaoAn(payload: any): Observable<any> {
    return this.post('/GiaoAn', payload);
  }
  updateGiaoAn(payload: any): Observable<any> {
    return this.put('/GiaoAn', payload);
  }
  getMyTeachingPlan(schoolId): Observable<any> {
    return this.get(`/GiaoAn/ListCurrentGiaoAn?schoolId=${schoolId}`);
  }
  getGiaoAn(id: any): Observable<any> {
    return this.get(`/GiaoAn?id=${id}`);
  }
  deleteGiaoAn(id: any): Observable<number> {
    return this.delete(`/GiaoAn?id=${id}`, id);
  }
  getGiaoAnCanDuyet(payload: any): Observable<any> {
    return this.get('/GiaoAn/GiaoAnCanDuyet', payload);
  }

  tcmDuyetGiaoAn(lessonId: any): Observable<any> {
    return this.post(`/GiaoAn/TCMDuyet?taiLieuId=${lessonId}`, null);
  }
  tcmTuChoiGiaoAn(payload: any): Observable<any> {
    return this.post('/GiaoAn/TCMTuChoi', payload);
  }
  bghDuyetGiaoAn(lessonId: any): Observable<any> {
    return this.post(`/GiaoAn/BGHDuyet?taiLieuId=${lessonId}`, null);
  }
  bghTuChoiGiaoAn(payload: any): Observable<any> {
    return this.post('/GiaoAn/BGHTuChoi', payload);
  }

  //
  getStudentWithCompleteRate(payload: any): Observable<any> {
    return this.post(`/KhoaHoc/StudentWithCompleteRate`, payload);
  }

  getThongKeTyLeHoanThanhBTVN(payload: any): Observable<any> {
    return this.post(`/Homework/ThongKeTyLeHoanThanhBTVN`, payload);
  }

  //HocBa
  getListHocBa(schoolId: any, classId: any, schoolYear: any): Observable<any> {
    return this.get(`/HocBa/ListHocBa?SchoolId=${schoolId}&ClassId=${classId}&SchoolYear=${schoolYear}`);
  }
  getListHocBaNew(schoolId: any, classId: any, schoolYear: any): Observable<any> {
    return this.get(`/HocBa/ListHocBaNew?SchoolId=${schoolId}&ClassId=${classId}&SchoolYear=${schoolYear}`);
  }
  getListHocBaByClassGDId(schoolId: any, classGdId: any, schoolYear: any): Observable<any> {
    return this.get(`/HocBa/ListHocBaByClassGDId?SchoolId=${schoolId}&ClassId=${classGdId}&SchoolYear=${schoolYear}`);
  }

  signByGVCN(hocbaId: any, isElementary: boolean): Observable<any> {
    let apiName = 'SignByGVCN';
    return this.post(`/HocBa/${apiName}?hocBaId=${hocbaId}`, null);
  }
  signByGVCNVer2(hocbaId: any, isElementary: boolean): Observable<any> {
    let apiName = 'SignByGVCN_V2';
    return this.post(`/HocBaOld/${apiName}?hocBaId=${hocbaId}`, null);
  }
  signByPrincipal(payload: any): Observable<any> {
    return this.post(`/HocBa/SignByPrincipal`, payload);
  }
  signByPrincipalNew(payload: any): Observable<any> {
    return this.post(`/HocBa/SignByPrincipalNew`, payload);
  }
  SignForGVCN(payload: any): Observable<any> {
    return this.post(`/HocBa/SignForGVCN`, payload);
    /*if (isElementary)
      return this.post(`/HocBa/SignForGVCN_TieuHoc`, payload);
    else
      return this.post(`/HocBa/SignForGVCN_THCS`, payload);*/
  }

  signByGVBM_BCY(payload: any): Observable<any> {
    return this.post(`/HocBa/SignByGVBM_BCY`, payload);
  }
  signAsSubjectTeacher(payload: any): Observable<any> {
    return this.post(`/HocBaOld/SignAsSubjectTeacher`, payload);
  }
  getListStudentHocBa(schoolId: any, classId: any, schoolYear: any): Observable<any> {
    return this.get(`/HocBa/ListStudentHocBa?SchoolId=${schoolId}&ClassId=${classId}&SchoolYear=${schoolYear}`);
  }
  getListStudentHocBaNew(schoolId: any, classId: any, schoolYear: any, isElementary: boolean): Observable<any> {
    if (isElementary) {
      return this.get(`/HocBa/ListStudentHocBaTieuHoc?SchoolId=${schoolId}&ClassId=${classId}&SchoolYear=${schoolYear}`);
    } else {
      return this.get(`/HocBa/ListStudentHocBaCap2?SchoolId=${schoolId}&ClassId=${classId}&SchoolYear=${schoolYear}`);
    }
  }
  prepareHashBCY(payload: any): Observable<any> {
    return this.post(`/HocBa/PrepareHashBCY`, payload);
  }
  getCertBCYInfo(payload: any): Observable<any[]> {
    return this.post(`/HocBa/GetCertBCYInfo`, payload);
  }

  generateHocBaTheoLop(payload: any, isElementary: boolean): Observable<any> {
    /*let ctl = 'HocBa';
    if (isElementary) {
      ctl = 'HocBaOld';
    } else {
      ctl = 'HocBa';
    }*/
    return this.post(`/HocBaOld/GenerateHocBaTheoLop`, payload);
  }
  generateHocBaTheoLopOld(payload: any, isElementary: boolean): Observable<any> {
    let ctl = 'HocBaOld';
    if (isElementary) {
      ctl = 'HocBaOld';
    } else {
      ctl = 'HocBa';
    }
    return this.post(`/${ctl}/GenerateHocBaTheoLop`, payload);
  }
  signRelease(payload: any): Observable<any> {
    return this.post(`/HocBa/SignReleaseNew`, payload);
  }

  packagedHocBa(payload: any): Observable<any> {
    return this.post(`/HocBa/Packaged`, payload);
  }
  submitHocBaRelease(payload: any): Observable<any> {
    return this.post(`/HocBa/SubmitRelease`, payload);
  }
  recallHocBa(payload: any): Observable<any> {
    return this.post(`/HocBa/RecallHocBa`, payload);
  }

  getNhanXetGVCN(schoolId: any, classId: any, schoolYear: any): Observable<any> {
    return this.get(`/HocBa/GetNhanXetGVCN?SchoolId=${schoolId}&ClassId=${classId}&SchoolYear=${schoolYear}`);
  }

  saveNhanXetGVCN(payload: any): Observable<any> {
    return this.post(`/HocBa/SaveNhanXetGVCN`, payload);
  }

  getLopGDBySubjectTeacher(schoolId: any, teacherId: any, schoolYear: any, subjectCode: any, classIds: any[]): Observable<any> {
    return this.get(`/HocBaOld/ListLopGDBySubjectTeacher?SchoolId=${schoolId}&TeacherId=${teacherId}&SchoolYear=${schoolYear}&SubjectCode=${subjectCode}&ClassIds=${classIds}`);
  }

  getDiemGVBM(schoolId: any, teacherId: any, schoolYear: any, subjectId: any): Observable<any> {
    return this.get(`/HocBa/DiemGVBM?SchoolId=${schoolId}&TeacherId=${teacherId}&SchoolYear=${schoolYear}&SubjectId=${subjectId}`);
  }
  getDiemGVBMChiTiet(schoolId: any, teacherId: any, schoolYear: any, subjectId: any, classId: any): Observable<any> {
    return this.get(`/HocBa/DiemGVBMChiTiet?SchoolId=${schoolId}&TeacherId=${teacherId}&SchoolYear=${schoolYear}&SubjectId=${subjectId}&ClassId=${classId}`);
  }
  getDiemGVBMChiTietC2New(schoolId: any, teacherId: any, schoolYear: any, subjectId: any, classId: any): Observable<any> {
    return this.get(`/HocBaOld/DiemGVBMChiTietC2?SchoolId=${schoolId}&TeacherId=${teacherId}&SchoolYear=${schoolYear}&SubjectId=${subjectId}&ClassId=${classId}`);
  }
  getDiemGVBMChiTietC2(schoolId: any, teacherId: any, schoolYear: any, subjectId: any, classId: any): Observable<any> {
    return this.get(`/HocBa/DiemGVBMChiTietC2?SchoolId=${schoolId}&TeacherId=${teacherId}&SchoolYear=${schoolYear}&SubjectId=${subjectId}&ClassId=${classId}`);
  }
  // Staff
  saveStaff(payload: any): Observable<any> {
    return this.post(`/Staff/SaveStaff`, payload);
  }

  // School
  getSchoolConfig(schoolId: any){
    return this.get(`/School?Id=${schoolId}`);
  }
  saveSchoolConfig(payload: any): Observable<any> {
    return this.post(`/School/SaveSchoolConfig`, payload);
  }

  requestCancelHocBa(payload: any): Observable<any> {
    return this.post(`/HocBa/RequestCancel`, payload);
  }
  approveDeleteHocBa(payload: any): Observable<any> {
    return this.post(`/HocBa/ApproveDeleteHocBa`, payload);
  }
  signByGVBM(classId: any, subjectId: any): Observable<any> {
    return this.post(`/HocBa/SignByGVBM?classId=${classId}&subjectId=${subjectId}`, null);
  }
  signMultipleByGVCN(payload: any, isElementary: boolean): Observable<any> {
    let apiName = 'SignMultipleByGVCN';
    return this.post(`/HocBa/${apiName}`, payload);
  }

  signMultipleByGVCNVer2(payload: any, isElementary: boolean): Observable<any> {
    let apiName = 'SignMultipleByGVCN_V2';
    return this.post(`/HocBaOld/${apiName}`, payload);
  }

  signByGVBMNew(payload: any, isElementary: boolean): Observable<any> {
    return this.post(`/HocBa/signByGVBMNew`, payload);
  }
  signMultipleByGVBM(payload: any): Observable<any> {
    return this.post(`/HocBa/SignMultipleByGVBM`, payload);
  }

  approveSubjectScoresByPrincipalViaMySign(payload: any): Observable<any> {
    return this.post(`/HocBaOld/ApproveSubjectScoresByPrincipalViaMySign`, payload);
  }
  //Sync học bạ

  syncDuLieuHocBaHocSinh(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuHocBaHocSinh`, payload);
  }
  syncDuLieuLop(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuDanhSachLop`, payload);
  }
  syncDuLieuHocBaGiaoVien(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuDanhSachGiaoVien`, payload);
  }
  fixUpdateLopId(payload: any): Observable<any> {
    return this.post(`/HocBa/FixUpdateLopGDId`, payload);
  }
  syncPhanCongGiaoVienLop(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdatePhanCongGiaoVienLop`, payload);
  }
  //Tieu hoc
  syncDuLieuDiemTongKetTieuHoc(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuHocBaDiemTongKetTieuHoc`, payload);
  }
  syncDuLieuNangLucPhamChat(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuHocBaNangLucPhamChat`, payload);
  }
  syncDuLieuHocBaDiemTieuHoc(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuHocBaDiemTieuHoc`, payload);
  }
  // Cap 2
  syncDuLieuDiemMonHocC2(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuHocBaDiemCap2`, payload);
  }
  syncDuLieuDiemTongKetC2(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuHocBaDiemTongKetCap2`, payload);
  }

  clearSignedGVBM(schoolId: any, schoolYear: number): Observable<any> {
    return this.post(`/HocBa/ClearSignedGVBM?schoolId=${schoolId}&schoolYear=${schoolYear}`, null);
  }

  updateDuLieuHocBaKhenThuong(payload: any): Observable<any> {
    return this.post(`/HocBa/UpdateDuLieuHocBaKhenThuong`, payload);
  }

  downloadHocBa(payload: any): Observable<any> {
    return this.post(`/HocBa/DownloadHocBa`, payload, null, 'blob' );
  }

  removeHocBa(payload: any): Observable<any> {
    return this.post(`/HocBa/RemoveHBS`, payload);
  }
  fixPDF(payload: any): Observable<any> {
    return this.post(`/HocBa/FixPDF`, payload);
  }
  fixPDF_V2(payload: any): Observable<any> {
    return this.post(`/HocBaOld/FixPDF_V2`, payload);
  }
  fixPDF_ConDau(payload: any): Observable<any> {
    return this.post(`/HocBaOld/FixPDF_ConDau`, payload);
  }
  fixXML(payload: any): Observable<any> {
    return this.post(`/HocBa/FixXML`, payload);
  }

  getSignInfoBySubjectTeacher(hocbaId: any): Observable<any[]> {
    return this.get(`/HocBa/getSignInfoBySubjectTeacher?hocbaId=${hocbaId}`);
  }
  //Package
  getListPackage(schoolId: any, classId: any, schoolYear: any): Observable<any> {
    return this.get(`/HocBa/ListPackage?SchoolId=${schoolId}&ClassId=${classId}&SchoolYear=${schoolYear}`);
  }
  prepareHashPackageBCY(payload: any): Observable<any> {
    return this.post(`/HocBa/PrepareHashPackageBCY`, payload);
  }
  signPackage(payload: any): Observable<any> {
    return this.post(`/HocBa/SignPackage`, payload);
  }
}
