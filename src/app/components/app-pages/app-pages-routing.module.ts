import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SubjectTeacherDiaryComponent} from "./subject-teacher-diary/subject-teacher-diary.component";


@NgModule({
  imports: [RouterModule.forChild([
    {path: 'subject', component: SubjectTeacherDiaryComponent},
    {path: 'subject/:token', component: SubjectTeacherDiaryComponent},
  ])],
  exports: [RouterModule]
})

export class AppPagesRoutingModule {}
