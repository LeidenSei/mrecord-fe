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
  // {
  //   text: 'Nhập điểm',
  //   path: '/score-entry',
  //   icon: 'edit',
  //   selected: false,
  //   items: [
  //     {
  //       text: 'Đánh giá thưởng xuyên tổng hợp',
  //       path: '/score-entry/one-period',
  //       icon: 'taskcomplete',
  //       selected: false
  //     },
  //     {
  //       text: 'Đánh giá định kỳ và nhận xét môn học',
  //       path: '/score-entry/semester',
  //       icon: 'bookmark',
  //       selected: false
  //     }
  //   ]
  // },
];

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
  {
    text: 'Thẻ học sinh',
    icon: 'card',
    path: '/teacher/student-card',
    selected: false,
  },
  {
    text: 'Sổ chủ nhiệm',
    icon: 'textdocument',
    path: '/class-logbook',
    selected: false,
    grade: 'c1',
    items: [
      {
        text: 'Ban cán sự lớp',
        path: '/class-logbook/class-committee',
        selected: false,
      },
      {
        text: 'Lưu ý nhận lớp',
        path: '/class-logbook/class-notes',
        selected: false,
      },
      {
        text: 'Hoa việc tốt',
        path: '/class-logbook/good-deeds',
        selected: false,
      },
      {
        text: 'Ban đại diện Cha mẹ học sinh',
        path: '/class-logbook/parent-committee',
        selected: false,
      },
      {
        text: 'Kế hoạch chủ nhiệm',
        path: '/class-logbook/homeroom-plan',
        selected: false,
      },
      {
        text: 'Kế hoạch tháng',
        path: '/class-logbook/monthly-plan',
        selected: false,
      },
      // {
      //   text: 'Kết quả đánh giá giáo dục GK/CK',
      //   path: '/class-logbook/assessment',
      //   selected: false,
      // },
      {
        text: 'Nhận xét tình hình lớp học',
        path: '/class-logbook/semester-comments',
        selected: false,
      },
      {
        text: 'Theo dõi học sinh',
        path: '/class-logbook/student-tracking',
        selected: false,
      },
    ],
  },
  {
    text: 'Sổ chủ nhiệm',
    icon: 'textdocument',
    path: '/class-logbook-c2',
    selected: false,
    grade: 'c2',
    items: [
      // {
      //   text: 'Danh sách học sinh',
      //   path: '/class-logbook-c2/student-list',
      //   selected: false,
      // },
      {
        text: 'Danh sách giáo viên bộ môn',
        path: '/class-logbook-c2/subject-teacher-list',
        selected: false,
      },
      {
        text: 'Quy định phong cách học sinh',
        path: '/class-logbook-c2/student-rules',
        selected: false,
      },
      {
        text: 'Quản lý học sinh theo tổ',
        path: '/class-logbook-c2/group-management',
        selected: false,
      },
      {
        text: 'Sơ đồ lớp học',
        path: '/class-logbook-c2/class-layout',
        selected: false,
      },
      {
        text: 'Ban đại diện cha mẹ học sinh',
        path: '/class-logbook-c2/parent-committee',
        selected: false,
      },
      {
        text: 'Kế hoạch giáo dục',
        path: '/class-logbook-c2/education-plan',
        selected: false,
      },
      {
        text: 'Kế hoạch chủ nhiệm',
        path: '/class-logbook-c2/homeroom-plan',
        selected: false,
      },
      {
        text: 'Kế hoạch tháng',
        path: '/class-logbook-c2/monthly-plan',
        selected: false,
      },
      {
        text: 'Theo dõi biểu hiện học sinh',
        path: '/class-logbook-c2/student-behavior-tracking',
        selected: false,
      },
      {
        text: 'Kết quả rèn luyện theo tháng',
        path: '/class-logbook-c2/monthly-evaluation',
        selected: false,
      },
      {
        text: 'Các hoạt động đã thực hiện',
        path: '/class-logbook-c2/activities',
        selected: false,
      },
      {
        text: 'Nội dung các buổi họp',
        path: '/class-logbook-c2/meetings',
        selected: false,
      },
      {
        text: 'Tổng kết cuối năm',
        path: '/class-logbook-c2/year-end-summary',
        selected: false,
      },
      {
        text: 'Hiệu trưởng nhận xét',
        path: '/class-logbook-c2/principal-comments',
        selected: false,
      },
      {
        text: 'In sổ chủ nhiệm',
        path: '/class-logbook-c2/print-logbook',
        selected: false,
      },
    ],
  },

  {
    text: 'Sổ điểm',
    icon: 'chart',
    path: '/grade-book',
    selected: false,
    grade: 'c2',
    items: [
      {
        text: 'Sổ điểm bộ môn',
        path: '/grade-book/personal/subject-book',
        selected: false,
      },
      {
        text: 'Sổ điểm theo lớp',
        path: '/grade-book/class',
        selected: false,
      },
    ],
  },
  {
    text: 'Hồ sơ giáo dục',
    icon: 'textdocument',
    path: '/education-records',
    selected: false,
    items: [
      {
        text: 'Hồ sơ nhà trường',
        path: '/education-records/school-records',
        selected: true,
      },
      {
        text: 'Hồ sơ Tổ chuyên môn',
        path: '/education-records/subject-group-records',
        selected: false
      }
    ]
  },
  /*{
    text: 'Nhận xét GVCN',
    icon: 'textdocument',
    path: '/transcript/teacher-homeroom-comment',
    selected: false,
  },*/
  /*{
    text: 'Ký duyệt bộ môn',
    type: 'gvbm',
    icon: 'edit',
    grade: 'c2',
    path: '/transcript/teacher-subject-approval',
    selected: false,
  },*/
  /*{
    text: 'Ký duyệt GVCN',
    icon: 'edit',
    path: '/transcript/teacher-homeroom-approval',
    selected: false,
  },*/
  /*{
    text: 'Nhập điểm',
    path: '/score-entry',
    icon: 'edit',
    selected: false,
    items: [
      {
        text: 'Đánh giá thưởng xuyên tổng hợp',
        path: '/score-entry/one-period',
        selected: false
      },
      {
        text: 'Đánh giá định kỳ và nhận xét môn học',
        path: '/score-entry/semester',
        selected: false
      }
    ]
  },*/
  /*{
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
  },*/
  /*{
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
  },*/
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
    text: 'Sổ điểm',
    icon: 'chart',
    path: '/grade-book',
    selected: false,
    grade: 'c2',
    items: [
      {
        text: 'Sổ điểm bộ môn',
        path: '/grade-book/personal/subject-book',
        selected: false,
      },
      {
        text: 'Sổ điểm theo lớp',
        path: '/grade-book/class',
        selected: false,
      }
    ]
  },
  {
    text: 'Ký duyệt bộ môn',
    type: 'gvbm',
    icon: 'edit',
    grade: 'c2',
    path: '/transcript/teacher-subject-approval',
    selected: false,
  },
  // {
  //   text: 'Nhập điểm',
  //   path: '/score-entry',
  //   icon: 'edit',
  //   selected: false,
  //   items: [
  //     {
  //       text: 'Đánh giá thưởng xuyên tổng hợp',
  //       path: '/score-entry/one-period',
  //       selected: false
  //     },
  //     {
  //       text: 'Đánh giá định kỳ và nhận xét môn học',
  //       path: '/score-entry/semester',
  //       selected: false
  //     }
  //   ]
  // },
  {
    text: 'Ký duyệt học bạ',
    type: 'gvbm_thcs',
    grade: 'c2',
    icon: 'edit',
    path: '/transcript/sign-list-subject-teacher',
    selected: false,
  },
  // {
  //   text: 'Học bạ số',
  //   icon: 'exportpdf',
  //   path: '',
  //   grade: 'c2',
  //   selected: false,
  //   items: [
  //     {
  //       text: 'Ký số lớp chủ nhiệm',
  //       path: '/transcript/sign-list-approve-c1',
  //       selected: false
  //     },
  //   ],
  // },
  // {
  //   text: 'Học bạ số',
  //   icon: 'exportpdf',
  //   path: '',
  //   grade: 'c1',
  //   selected: false,
  //   items: [
  //     {
  //       text: 'Ký số lớp chủ nhiệm',
  //       path: '/transcript/sign-list-approve-c1',
  //     },
  //   ],
  // },
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
    text: 'Thẻ học sinh',
    icon: 'card',
    path: '/teacher/student-card',
    selected: false,
  },
  {
    text: 'Sổ chủ nhiệm',
    icon: 'textdocument',
    path: '/class-logbook',
    selected: false,
    grade: 'c1',
    items: [
      {
        text: 'Ban cán sự lớp',
        path: '/class-logbook/class-committee',
        selected: false
      },
      {
        text: 'Lưu ý nhận lớp',
        path: '/class-logbook/class-notes',
        selected: false
      },
      {
        text: 'Hoa việc tốt',
        path: '/class-logbook/good-deeds',
        selected: false
      },
      {
        text: 'Danh sách ban đại diện cha mẹ học sinh',
        path: '/class-logbook/parent-committee',
        selected: false
      },
      {
        text: 'Kế hoạch chủ nhiệm',
        path: '/class-logbook/homeroom-plan',
        selected: false
      },
      {
        text: 'Kế hoạch tháng',
        path: '/class-logbook/monthly-plan',
        selected: false
      },
      // {
      //   text: 'Bảng tổng hợp kết quả đánh giá giáo dục GK/CK',
      //   path: '/class-logbook/assessment',
      //   selected: false
      // },
      {
        text: 'Nhận xét tình hình lớp học',
        path: '/class-logbook/semester-comments',
        selected: false
      },
      {
        text: 'Theo dõi học sinh',
        path: '/class-logbook/student-tracking',
        selected: false
      },
    ]
  },
    {
    text: 'Sổ chủ nhiệm',
    icon: 'textdocument',
    path: '/class-logbook-c2',
    selected: false,
    grade: 'c2',
    items: [
      // {
      //   text: 'Danh sách học sinh',
      //   path: '/class-logbook-c2/student-list',
      //   selected: false,
      // },
      {
        text: 'Danh sách giáo viên bộ môn',
        path: '/class-logbook-c2/subject-teacher-list',
        selected: false,
      },
      {
        text: 'Quy định phong cách học sinh',
        path: '/class-logbook-c2/student-rules',
        selected: false,
      },
      {
        text: 'Quản lý học sinh theo tổ',
        path: '/class-logbook-c2/group-management',
        selected: false,
      },
      {
        text: 'Sơ đồ lớp học',
        path: '/class-logbook-c2/class-layout',
        selected: false,
      },
      {
        text: 'Ban đại diện cha mẹ học sinh',
        path: '/class-logbook-c2/parent-committee',
        selected: false,
      },
      {
        text: 'Kế hoạch giáo dục',
        path: '/class-logbook-c2/education-plan',
        selected: false,
      },
      {
        text: 'Kế hoạch chủ nhiệm',
        path: '/class-logbook-c2/homeroom-plan',
        selected: false,
      },
      {
        text: 'Kế hoạch tháng',
        path: '/class-logbook-c2/monthly-plan',
        selected: false,
      },
      {
        text: 'Theo dõi biểu hiện học sinh',
        path: '/class-logbook-c2/student-behavior-tracking',
        selected: false,
      },
      {
        text: 'Kết quả rèn luyện theo tháng',
        path: '/class-logbook-c2/monthly-evaluation',
        selected: false,
      },
      {
        text: 'Các hoạt động đã thực hiện',
        path: '/class-logbook-c2/activities',
        selected: false,
      },
      {
        text: 'Nội dung các buổi họp',
        path: '/class-logbook-c2/meetings',
        selected: false,
      },
      {
        text: 'Tổng kết cuối năm',
        path: '/class-logbook-c2/year-end-summary',
        selected: false,
      },
      {
        text: 'Hiệu trưởng nhận xét',
        path: '/class-logbook-c2/principal-comments',
        selected: false,
      },
      {
        text: 'In sổ chủ nhiệm',
        path: '/class-logbook-c2/print-logbook',
        selected: false,
      },
    ],
  },
  {
    text: 'Sổ điểm',
    icon: 'chart',
    path: '/grade-book',
    selected: false,
    grade: 'c2',
    items: [
      {
        text: 'Sổ điểm bộ môn',
        path: '/grade-book/personal/subject-book',
        selected: false,
      },
      {
        text: 'Sổ điểm theo lớp',
        path: '/grade-book/class',
        selected: false,
      }
    ]
  },
  {
    text: 'Hồ sơ giáo dục',
    icon: 'textdocument',
    path: '/education-records',
    selected: false,
    items: [
      {
        text: 'Hồ sơ nhà trường',
        path: '/education-records/school-records',
        selected: true
      },
      {
        text: 'Hồ sơ Tổ chuyên môn',
        path: '/education-records/subject-group-records',
        selected: false
      }
    ]
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
];