import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {UserListComponent} from "./user-list/user-list.component";
import {HomePageComponent} from "./home-page/home-page.component";
import {SubjectRoleApproveComponent} from "./subject-role-approve/subject-role-approve.component";
import {LessonStatsticTeacherComponent} from "./lesson-statstic-teacher/lesson-statstic-teacher.component";
import {MessageStatisticTeacherComponent} from "./message-statistic-teacher/message-statistic-teacher.component";
import {LessonListTeacherComponent} from "./lesson-list-teacher/lesson-list-teacher.component";
import {StudentCompletionRateComponent} from "./student-completion-rate/student-completion-rate.component";
import {HomeworkCompletionStatisticsComponent} from "./homework-completion-statistics/homework-completion-statistics.component";
import {SgdDataSyncComponent} from "./sgd-data-sync/sgd-data-sync.component";

@NgModule({
  imports: [RouterModule.forChild([
    {path: 'data-sync', component: SgdDataSyncComponent},
    {path: 'user', component: UserListComponent},
    {path: 'home', component: HomePageComponent},
    {path: 'thong-ke', component: HomePageComponent},
    {path: 'phan-quyen-duyet', component: SubjectRoleApproveComponent},
    {path: 'thong-ke-bai-giang', component: LessonStatsticTeacherComponent},
    {path: 'thong-ke-bai-giang-chi-tiet', component: LessonListTeacherComponent},
    {path: 'thong-ke-tin-nhan', component: MessageStatisticTeacherComponent},
    {path: 'thong-ke-hoan-thanh', component: StudentCompletionRateComponent},
    {path: 'thong-ke-hoan-thanh-btvn', component: HomeworkCompletionStatisticsComponent},
    {path: '', component: HomePageComponent},
  ])],
  exports: [RouterModule]
})

export class AziCommonRoutingModule {}
