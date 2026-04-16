import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { LOCAL_STORAGE } from '../constant/local-storage.constant';
import { LocalStorageService } from '../../core/services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private ls = inject(LocalStorageService);
  private router = inject(Router);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  canActivate(): boolean | UrlTree {
    const token = this.ls.getItem(LOCAL_STORAGE.TOKEN);
    const user = this.ls.getItem(LOCAL_STORAGE.USER);

    if (token && user) return true;

    return this.router.parseUrl('/authentication/login');
  }
}
