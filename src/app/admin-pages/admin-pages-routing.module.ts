import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StaffMngtComponent} from "./staffs/staff-mngt/staff-mngt.component";

@NgModule({
  imports: [RouterModule.forChild([
    {path: 'staff-mngt', component: StaffMngtComponent}
    /*{path: 'sign-list', component: TranscriptListComponent},
    {path: 'sync-list', component: StudentSyncListComponent},
    {path: 'packaged-list', component: TranscriptPackagedComponent},
    {path: 'teacher-homeroom-approval', component: TeacherReviewComponent},
    {path: 'subject-teacher-homeroom-approval', component: SubjectTeacherReviewComponent},*/
  ])],
  exports: [RouterModule]
})

export class AdminPagesRoutingModule {}
