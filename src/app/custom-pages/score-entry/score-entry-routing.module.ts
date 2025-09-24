import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnePeriodComponent } from './one-period/one-period.component';
import { SemesterComponent } from './semester/semester.component';

const routes: Routes = [
  {
    path: 'one-period',
    component: OnePeriodComponent,
    data: { 
      breadcrumb: 'Đánh giá thường xuyên tổng hợp',
      breadcrumbIcon: 'taskcomplete' 
    }
  },
  {
    path: 'semester', 
    component: SemesterComponent,
    data: { 
      breadcrumb: 'Đánh giá định kỳ và nhận xét môn học',
      breadcrumbIcon: 'bookmark'
    }
  },
  {
    path: '',
    redirectTo: 'one-period',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScoreEntryRoutingModule { }