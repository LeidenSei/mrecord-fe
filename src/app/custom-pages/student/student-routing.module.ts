import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StudentSchoolCourseComponent} from "./student-school-course/student-school-course.component";
import {StudentClassCourseComponent} from "./student-class-course/student-class-course.component";
import {StudentLessonComponent} from "./student-lesson/student-lesson.component";
import {StudentHomeworkComponent} from "./student-homework/student-homework.component";
import {StudentExampaperComponent} from "./student-exampaper/student-exampaper.component";
import {StudentResultScoreComponent} from "./student-result-score/student-result-score.component";
import {TestQuillComponent} from "./test-quill/test-quill.component";

@NgModule({
  imports: [RouterModule.forChild([
    {path: 'school-course', component: StudentSchoolCourseComponent},
    {path: 'class-course', component: StudentClassCourseComponent},
    {path: 'lesson-view/:courseId/:lessonId', component: StudentLessonComponent},
    {path: 'lesson-view/:courseId/:lessonId/:type', component: StudentLessonComponent},

    {path: 'homework', component: StudentHomeworkComponent},
    {path: 'exam-paper', component: StudentExampaperComponent},
    {path: 'result', component: StudentResultScoreComponent},
    {path: 'quill', component: TestQuillComponent},

   /* {path: 'teacher-course', component: TeacherCourseComponent},
    {path: 'teacher-course/:courseId/:courseTitle', component: TeacherLessonComponent},
    {path: 'lesson-editor/:courseId/:lessonId', component: LessonEditorComponent},
    {path: 'lesson-player/:courseId/:lessonId', component: LessonPlayerComponent},
    {path: 'lesson-player/:courseId/:lessonId/:type', component: LessonPlayerComponent},*/
  ])],
  exports: [RouterModule]
})

export class StudentRoutingModule {}
