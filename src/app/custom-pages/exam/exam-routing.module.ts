import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {DigiExamComponent} from "./digi-exam/digi-exam.component";


@NgModule({
  imports: [RouterModule.forChild([
    {path: 'list', component: DigiExamComponent},
  ])],
  exports: [RouterModule]
})

export class ExamRoutingModule {}
