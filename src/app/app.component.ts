import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importar FormsModule y ReactiveFormsModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule, // Para formularios de plantilla
    ReactiveFormsModule, // Para formularios reactivos
  ],
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Firebase Login App';
}
