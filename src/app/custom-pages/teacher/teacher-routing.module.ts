import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CourseSchoolComponent} from "./course-school/course-school.component";
import {TeacherCourseComponent} from "./teacher-course/teacher-course.component";
import {TeacherLessonComponent} from "./teacher-lesson/teacher-lesson.component";
import {LessonEditorComponent} from "./lesson-editor/lesson-editor.component";
import {LessonPlayerComponent} from "./lesson-player/lesson-player.component";
import {ApprovalCourseComponent} from "./approval-course/approval-course.component";
import {TeacherHomeworkComponent} from "./teacher-homework/teacher-homework.component";
import {MeetingOnlineComponent} from "./meeting-online/meeting-online.component";
import {ApproveLessonComponent} from "./approve-lesson/approve-lesson.component";
import {TeacherExamPaperComponent} from "./teacher-exam-paper/teacher-exam-paper.component";
import {SubjectCourseComponent} from "./subject-course/subject-course.component";
import {StudentClassComponent} from "./student-class/student-class.component";
import {StudentLessonMarkComponent} from "./student-lesson-mark/student-lesson-mark.component";
import {StudentLessonScoreComponent} from "./student-lesson-score/student-lesson-score.component";
import {StudentLessonClassScoreComponent} from "./student-lesson-class-score/student-lesson-class-score.component";
import {UnsavedChangesGuard} from "../../guards/unsaved-changes.guard";
import {SharedCourseComponent} from "./shared-course/shared-course.component";
import {TeacherExamPaperAutoComponent} from "./teacher-exam-paper-auto/teacher-exam-paper-auto.component";
import {StatisticContentComponent} from "./statistic-content/statistic-content.component";
import {TeachingPlanComponent} from "./teaching-plan/teaching-plan.component";
import {ApprovalTeachingPlanComponent} from "./approval-teaching-plan/approval-teaching-plan.component";

@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: TeacherCourseComponent},
    {path: 'school-course', component: CourseSchoolComponent},
    {path: 'teacher-course', component: TeacherCourseComponent},
    {path: 'teaching-plan', component: TeachingPlanComponent},
    {path: 'teacher-course/:courseId/:courseTitle', component: TeacherLessonComponent},
    {path: 'lesson-editor/:courseId/:lessonId', component: LessonEditorComponent, canDeactivate: [UnsavedChangesGuard]},
    {path: 'lesson-player/:courseId/:lessonId', component: LessonPlayerComponent},
    {path: 'lesson-player/:courseId/:lessonId/:type', component: LessonPlayerComponent},
    {path: 'lesson-player/:courseId/:lessonId/:type/:from', component: LessonPlayerComponent},

    {path: 'approval-course', component: ApprovalCourseComponent},
    {path: 'approval-teaching-plan', component: ApprovalTeachingPlanComponent},
    {path: 'homework', component: TeacherHomeworkComponent},
    {path: 'meeting', component: MeetingOnlineComponent},

    {path: 'approval-course/:courseId/:courseTitle', component: ApproveLessonComponent},
    {path: 'exam_paper_manual', component: TeacherExamPaperComponent},
    {path: 'exam_paper_auto', component: TeacherExamPaperAutoComponent},

    {path: 'subject-course', component: SubjectCourseComponent},

    {path: 'student-class', component: StudentClassComponent},
    {path: 'score-student', component: StudentLessonMarkComponent},
    {path: 'lesson-score-view', component: StudentLessonScoreComponent},
    {path: 'lesson-class-score', component: StudentLessonClassScoreComponent},

    {path: 'shared-course/:shareStatus', component: SharedCourseComponent},
    {path: 'statistic', component: StatisticContentComponent},
  ])],
  exports: [RouterModule]
})

export class TeacherRoutingModule {}
