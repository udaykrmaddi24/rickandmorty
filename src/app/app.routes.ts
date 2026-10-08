import { CanActivateFn, Router, Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { CharacterDetails } from './components/character-details/character-details';
import { inject } from '@angular/core';
import { AuthService } from './service/auth-service';
import { AccessDenied } from './components/access-denied/access-denied';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};

export const routes: Routes = [
    {
        path: '',
        component: HomePage
    },
    {
        path: 'char-details/:id',
        component: CharacterDetails,
        canActivate: [adminGuard]
    },
    {
        path: 'access-denied',
        component: AccessDenied
    }
];

