import { Component, DestroyRef, NgZone, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { filter, shareReplay, take } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { CondominiumApiService } from '../core/services/condominium-api.service';
import { UserApiService } from '../core/services/user-api.service';
import { User, Condominium } from '../shared/types';
import { ActivatedRoute, Router } from '@angular/router';
interface BaseComponentSettings {
  loadCondominium?: boolean;
  service?: unknown;
}

@Component({
  standalone: true,
  selector: 'app-base',
  template: '',
})
export default abstract class BaseComponent {
  // 'settings' string token é convertido por compatibilidade — Angular DI exige InjectionToken/Type aqui
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly settings = inject<BaseComponentSettings>('settings' as any, {
    optional: true,
  });

  protected readonly destroyRef = inject(DestroyRef);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  readonly route = inject(ActivatedRoute);

  private readonly _ngZone = inject(NgZone);

  public readonly _translate = inject(TranslateService, { optional: true });
  public readonly userApi = inject(UserApiService);
  public readonly condominiumApi = inject(CondominiumApiService);

  protected readonly user$ = this._authService.$user.pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected readonly condominium$ = this._authService.$condominium.pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public readonly queryString = new URLSearchParams();
  public searchParams: Record<string, unknown> = {};
  public loading = false;
  public user: User | null = null;
  public condominium: Condominium | null = null;

  constructor() {
    this.bindUser();
    this.bindCondominium();

    this.destroyRef.onDestroy(() => {
      if (this.settings?.service) {
        this.settings.service = undefined;
      }
    });
  }


  protected get router(): Router {
    return this._router;
  }
  private bindUser(): void {
    this.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.user = user;
      });
  }

  private bindCondominium(): void {
    if (this.settings?.loadCondominium === false) {
      return;
    }

    this.condominium$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((condominium) => {
        this.condominium = condominium;
      });
  }

  protected afterLoadCondominium(fun: (condominium: Condominium) => void): void {
    this.condominium$
      .pipe(
        filter((condominium): condominium is Condominium => !!condominium),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(fun);
  }

  protected onCondominiumChange(fun: (condominium: Condominium | null) => void): void {
    this.condominium$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fun);
  }

  get authService() {
    return this._authService;
  }

  protected async navigateTo(path: string): Promise<void> {
    await this._router.navigateByUrl(path);
  }

  protected setLoadingState(value: boolean): void {
    this._ngZone.run(() => {
      this.loading = value;
    });
  }

  protected updateViewState(update: () => void): void {
    this._ngZone.run(update);
  }

  protected scheduleViewState(update: () => void): void {
    queueMicrotask(() => {
      this._ngZone.run(update);
    });
  }
}
