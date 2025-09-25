export const navigationPGD = [
  {
    text: 'Trang chủ',
    icon: 'home',
    path: '/common/home',
    selected: false,
  },
  {
    icon: 'share',
    selected: false,
    text: 'Kho học liệu PGD',
    path: '/edu/shared-course/pgd',
  },
  {
    icon: 'taskcomplete',
    selected: false,
    text: 'Học liệu dự thi',
    path: '/edu/shared-course/gvg',
  },
  {
    text: 'Nhập điểm',
    path: '/score-entry',
    icon: 'edit',
    selected: false,
    items: [
      {
        text: 'Đánh giá thưởng xuyên tổng hợp',
        path: '/score-entry/one-period',
        icon: 'taskcomplete',
        selected: false
      },
      {
        text: 'Đánh giá định kỳ và nhận xét môn học',
        path: '/score-entry/semester',
        icon: 'bookmark',
        selected: false
      }
    ]
  },
]

export const navigationTeacherHomeroom = [
  {
    text: 'Trang chủ',
    icon: 'home',
    path: '/common/home',
    selected: false,
  },
  {
    text: 'Danh sách học sinh',
    icon: 'user',
    path: '/teacher/student-class',
    selected: false,
  },
  /*{
    text: 'Nhận xét GVCN',
    icon: 'textdocument',
    path: '/transcript/teacher-homeroom-comment',
    selected: false,
  },*/
  {
    text: 'Ký duyệt bộ môn',
    type: 'gvbm',
    icon: 'edit',
    grade: 'c2',
    path: '/transcript/teacher-subject-approval',
    selected: false,
  },
  /*{
    text: 'Ký duyệt GVCN',
    icon: 'edit',
    path: '/transcript/teacher-homeroom-approval',
    selected: false,
  },*/
  {
    text: 'Nhập điểm',
    path: '/score-entry',
    icon: 'edit',
    selected: false,
    items: [
      {
        text: 'Đánh giá thưởng xuyên tổng hợp',
        path: '/score-entry/one-period',
        icon: 'taskcomplete',
        selected: false
      },
      {
        text: 'Đánh giá định kỳ và nhận xét môn học',
        path: '/score-entry/semester',
        icon: 'bookmark',
        selected: false
      }
    ]
  },
  {
    text: 'Học bạ số',
    icon: 'exportpdf',
    path: '',
    grade: 'c2',
    selected: false,
    items: [
      {
        text: 'Ký số bộ môn',
        type: 'gvbm_thcs',
        path: '/transcript/sign-list-subject-teacher',
        selected: false,
      },
      {
        text: 'Ký số lớp chủ nhiệm',
        path: '/transcript/sign-list-approve-c1',
        selected: false
      },
    ],
  },
  {
    text: 'Học bạ số',
    icon: 'exportpdf',
    path: '',
    grade: 'c1',
    selected: false,
    items: [
      {
        text: 'Ký số lớp chủ nhiệm',
        path: '/transcript/sign-list-approve-c1',
        selected: false
      },
    ],
  },
];

export const navigationTeacher = [
  {
    text: 'Trang chủ',
    icon: 'home',
    path: '/common/home',
    selected: false,
  },
  {
    text: 'Danh sách học sinh',
    icon: 'user',
    path: '/teacher/student-class',
    selected: false,
  },
  {
    text: 'Ký duyệt bộ môn',
    type: 'gvbm',
    icon: 'edit',
    grade: 'c2',
    path: '/transcript/teacher-subject-approval',
    selected: false,
  },
  {
    text: 'Nhập điểm',
    path: '/score-entry',
    icon: 'edit',
    selected: false,
    items: [
      {
        text: 'Đánh giá thưởng xuyên tổng hợp',
        path: '/score-entry/one-period',
        icon: 'taskcomplete',
        selected: false
      },
      {
        text: 'Đánh giá định kỳ và nhận xét môn học',
        path: '/score-entry/semester',
        icon: 'bookmark',
        selected: false
      }
    ]
  },
  {
    text: 'Ký duyệt học bạ',
    type: 'gvbm_thcs',
    grade: 'c2',
    icon: 'edit',
    path: '/transcript/sign-list-subject-teacher',
    selected: false,
  },
  {
    text: 'Học bạ số',
    icon: 'exportpdf',
    path: '',
    grade: 'c2',
    selected: false,
    items: [
      {
        text: 'Ký số lớp chủ nhiệm',
        path: '/transcript/sign-list-approve-c1',
        selected: false
      },
    ],
  },
  {
    text: 'Học bạ số',
    icon: 'exportpdf',
    path: '',
    grade: 'c1',
    selected: false,
    items: [
      {
        text: 'Ký số lớp chủ nhiệm',
        path: '/transcript/sign-list-approve-c1',
      },
    ],
  },
];

export const navigationAdmin = [
  {
    text: 'Trang chủ',
    icon: 'home',
    path: '/common/home',
    selected: false,
  },
  {
    text: 'Danh sách nhân sự',
    icon: 'user',
    path: '/admin/staff-mngt',
    selected: false,
  },
  {
    text: 'Danh sách học sinh',
    icon: 'user',
    path: '/teacher/student-class',
    selected: false,
  },
  {
    text: 'Ký duyệt thay bộ môn',
    grade: 'c2',
    icon: 'edit',
    path: '/transcript/principal-subject-approval-v2',
    selected: false,
  },
  {
    text: 'Nhập điểm',
    path: '/score-entry',
    icon: 'edit',
    selected: false,
    items: [
      {
        text: 'Đánh giá thưởng xuyên tổng hợp',
        path: '/score-entry/one-period',
        icon: 'taskcomplete',
        selected: false
      },
      {
        text: 'Đánh giá định kỳ và nhận xét môn học',
        path: '/score-entry/semester',
        icon: 'bookmark',
        selected: false
      }
    ]
  },
  {
    text: 'Khởi tạo học bạ',
    icon: 'refresh',
    path: '/transcript/sync-list-c1',
    grade: 'c2',
    selected: false,
  },
  {
    text: 'Khởi tạo học bạ',
    icon: 'refresh',
    path: '/transcript/sync-list-c1',
    grade: 'c1',
    selected: false,
  },
  {
    text: 'Học bạ số',
    icon: 'pasteplaintext',
    path: '',
    grade: 'c2',
    selected: false,
    items: [
      {
        text: 'Ký thay GV bộ môn',
        path: '/transcript/principal-sign-subject',
        selected: false
      },
      {
        text: 'Ký duyệt học bạ',
        path: '/transcript/sign-list-approve-c1',
        selected: false
      },
      {
        text: 'Ký phát hành học bạ',
        path: '/transcript/sign-list-release-c1',
        selected: false
      },
      {
        text: 'Đóng gói và nộp sở',
        path: '/transcript/packaged-list',
        selected: false
      }
    ],
  },
  {
    text: 'Học bạ số',
    icon: 'pasteplaintext',
    path: '',
    grade: 'c1',
    selected: false,
    items: [
      {
        text: 'Ký duyệt học bạ',
        path: '/transcript/sign-list-approve-c1',
        selected: false
      },
      {
        text: 'Ký phát hành học bạ',
        path: '/transcript/sign-list-release-c1',
        selected: false
      },
      {
        text: 'Đóng gói và nộp sở',
        path: '/transcript/packaged-list',
        selected: false
      }
    ],
  },
];

export const navigationStudent = [
  {
    text: 'Trang chủ',
    icon: 'home',
    path: '/common/home',
    selected: false,
  },
  {
    text: 'Bài giảng tương tác',
    icon: 'textdocument',
    selected: false,
    items: [
      {
        text: 'Khóa học của trường',
        path: '/student/school-course',
        selected: false,
      },
      {
        text: 'Khóa học của lớp',
        path: '/student/class-course',
        selected: false,
      },
    ]
  },
  {
    text: 'Bài tập về nhà',
    icon: 'user',
    path: '/student/homework',
    selected: false,
  },
  {
    text: 'Đề thi trực tuyến',
    icon: 'checklist',
    path: '/student/exam-paper',
    selected: false,
  },
  ///student/homework /student/exam-online
];