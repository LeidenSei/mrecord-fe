import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubjectBookComponent } from './personal/subject-book/subject-book.component';

const routes: Routes = [
  {
    path: 'personal',
    children: [
      {
        path: 'subject-book',
        component: SubjectBookComponent,
        data: { 
          breadcrumb: 'Sổ điểm bộ môn',
        }
      },
      {
        path: '',
        redirectTo: 'subject-book',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'class',
    children: [
      {
        path: '',
        redirectTo: '/common/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'personal/subject-book',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GradeBookRoutingModule { }