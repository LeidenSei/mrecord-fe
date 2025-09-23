import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranscriptListComponent} from "./transcript-list/transcript-list.component";
import {StudentSyncListComponent} from "./student-sync-list/student-sync-list.component";
import {TranscriptPackagedComponent} from "./transcript-packaged/transcript-packaged.component";
import {TeacherHomeroomCommentComponent} from "./teacher-homeroom-comment/teacher-homeroom-comment.component";
import {TeacherHomeroomApprovalComponent} from "./teacher-homeroom-approval/teacher-homeroom-approval.component";
import {TeacherSubjectApprovalComponent} from "./teacher-subject-approval/teacher-subject-approval.component";
import {
  TranscriptListSignReleaseComponent
} from "./transcript-list-sign-release/transcript-list-sign-release.component";
import {
  TranscriptListBySubjectTeacherComponent
} from "./transcript-list-by-subject-teacher/transcript-list-by-subject-teacher.component";
import {PrincipalSubjectApprovalComponent} from "./principal-subject-approval/principal-subject-approval.component";
import {StudentSyncListC1Component} from "./student-sync-list-c1/student-sync-list-c1.component";
import {TranscriptListC1Component} from "./transcript-list-c1/transcript-list-c1.component";
import {
  TranscriptSubjectTeacherSignedByPrincipalComponent
} from "./transcript-subject-teacher-signed-by-principal/transcript-subject-teacher-signed-by-principal.component";
import {
  TranscriptListSignReleaseC1Component
} from "./transcript-list-sign-release-c1/transcript-list-sign-release-c1.component";
import {StudentSyncListC2Component} from "./student-sync-list-c2/student-sync-list-c2.component";
import {
  PrincipalSubjectApprovalV2Component
} from "./principal-subject-approval-v2/principal-subject-approval-v2.component";



@NgModule({
  imports: [RouterModule.forChild([
    {path: 'sign-list-approve', component: TranscriptListComponent},
    {path: 'sign-list-approve-c1', component: TranscriptListC1Component},

    {path: 'sign-list-release', component: TranscriptListSignReleaseComponent},
    {path: 'sign-list-release-c1', component: TranscriptListSignReleaseC1Component},

    {path: 'sign-list-subject-teacher', component: TranscriptListBySubjectTeacherComponent},

    {path: 'sync-list', component: StudentSyncListComponent},
    {path: 'sync-list-c1', component: StudentSyncListC1Component},
    {path: 'sync-list-c2', component: StudentSyncListC2Component},

    {path: 'packaged-list', component: TranscriptPackagedComponent},
    {path: 'teacher-homeroom-approval', component: TeacherHomeroomApprovalComponent},
    {path: 'teacher-homeroom-comment', component: TeacherHomeroomCommentComponent},
    {path: 'teacher-subject-approval', component: TeacherSubjectApprovalComponent},
    {path: 'principal-subject-approval', component: PrincipalSubjectApprovalComponent},
    {path: 'principal-subject-approval-v2', component: PrincipalSubjectApprovalV2Component},

    {path: 'principal-sign-subject', component: TranscriptSubjectTeacherSignedByPrincipalComponent},
    /*{path: 'principal-sign-homeroom-teacher', component: TranscriptHomeroomTeacherSignedByPrincipalComponent},*/

   /* {path: 'teacher-course', component: TeacherCourseComponent},
    {path: 'teacher-course/:courseId/:courseTitle', component: TeacherLessonComponent},
    {path: 'lesson-editor/:courseId/:lessonId', component: LessonEditorComponent},
    {path: 'lesson-player/:courseId/:lessonId', component: LessonPlayerComponent},
    {path: 'lesson-player/:courseId/:lessonId/:type', component: LessonPlayerComponent},*/
  ])],
  exports: [RouterModule]
})

export class DigitalTranscriptRoutingModule {}
