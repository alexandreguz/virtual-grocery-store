import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
// import { LoginFormComponent } from '../../components/login-form/login-form.component';


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NavbarComponent,],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
