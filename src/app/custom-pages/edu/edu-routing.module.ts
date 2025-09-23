import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedCourseComponent} from "./shared-course/shared-course.component";


@NgModule({
  imports: [RouterModule.forChild([
    {path: 'shared-course', component: SharedCourseComponent},
    {path: 'shared-course/:shareStatus', component: SharedCourseComponent},
  ])],
  exports: [RouterModule]
})

export class EduRoutingModule {}
