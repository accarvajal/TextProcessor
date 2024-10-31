import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TextProcessorComponent } from './features/text-processor/components/text-processor/text-processor.component';

const routes: Routes = [
  { path: '', redirectTo: '/text-processor', pathMatch: 'full' },
  { path: 'text-processor', component: TextProcessorComponent },
  { path: '**', redirectTo: '/text-processor' } // Catch all route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }