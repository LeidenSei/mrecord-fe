import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ClassListComponent} from "./class-list/class-list.component";
import {ClassCustomListComponent} from "./class-custom-list/class-custom-list.component";


@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: ClassListComponent},
    {path: 'custom', component: ClassCustomListComponent},

  ])],
  exports: [RouterModule]
})

export class ClassesRoutingModule {}
