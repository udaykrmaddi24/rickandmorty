import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  role: 'admin' | 'viewer' = 'admin';

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}