import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchoolRecordsComponent } from './school-records/school-records.component';
import { SubjectGroupRecordsComponent } from './subject-group-records/subject-group-records.component';

const routes: Routes = [
  {
    path: 'school-records',
    component: SchoolRecordsComponent,
    data: { 
      breadcrumb: 'Hồ sơ nhà trường',
      breadcrumbIcon: 'folder'
    }
  },
  {
    path: 'subject-group-records',
    component: SubjectGroupRecordsComponent,
    data: { 
      breadcrumb: 'Hồ sơ Tổ chuyên môn',
      breadcrumbIcon: 'folder'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EducationRecordsRoutingModule { }