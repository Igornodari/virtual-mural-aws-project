import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AmplifyService } from './amplify.service';
import { Unit, User } from '../../shared/types';
import {
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly emptyUser: User = {
    id: '',
    createdAt: new Date(0),
    updatedAt: new Date(0),
    fullName: '',
    email: '',
    isActive: false,
    photoPath: '',
    photoUrl: '',
    firstName: '',
    lastName: '',
    profileId: '',
    role: {
      id: '',
      createdAt: '',
      updatedAt: '',
      name: '',
      label: '',
      permissions: [],
    },
    unit: {
      id: '',
      createdAt: '',
      updatedAt: '',
      name: '',
      hotelCode: 0,
      address: '',
      isActive: false,
      zohoId: '',
      statusStyle: { label: '', name: '' },
      waPhoneNumber: '',
      closure: '',
      opening: '',
      regulationUrl: '',
      addressStreet: '',
    },
  };

  public pendingCred: unknown = null;
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly unitSubject = new BehaviorSubject<Unit | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  readonly $user = this.userSubject.asObservable();
  readonly $unit = this.unitSubject.asObservable();
  readonly $isLogggedIn = this.isAuthenticatedSubject.asObservable();

  constructor(private readonly amplifyService: AmplifyService) {
    this.amplifyService.ensureConfigured();
    void this.syncAuthState();
  }

  get currentUser(): User {
    return this.userSubject.value ?? this.emptyUser;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  setCurrentUser(user: User | null): void {
    this.userSubject.next(user);
    this.unitSubject.next(user?.unit ?? null);
    this.isAuthenticatedSubject.next(!!user);
  }

  setCurrentUnit(unit: Unit | null): void {
    this.unitSubject.next(unit);
  }

  async loginWithGoogle(): Promise<void> {
    await signInWithRedirect({ provider: 'Google' });
  }

  // Alias de compatibilidade para migração do serviço Firebase.
  loginProviderGoogle(): Promise<void> {
    return this.loginWithGoogle();
  }

  async registerWithEmail(
    email: string,
    password: string,
    firstName: string,
    lastName?: string
  ) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: fullName || firstName,
          given_name: firstName,
          family_name: lastName ?? '',
        },
      },
    });
  }

  async confirmEmailCode(email: string, code: string) {
    return confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  }

  async loginWithEmail(email: string, password: string) {
    const username = email.trim().toLowerCase();

    try {
      const result = await signIn({
        username,
        password,
      });
      await this.syncAuthState();
      return result;
    } catch (error: any) {
      const message = String(error?.message ?? '');
      const name = String(error?.name ?? '');
      const authFlowIssue =
        message.includes('Auth flow') ||
        message.includes('USER_SRP_AUTH') ||
        message.includes('USER_PASSWORD_AUTH') ||
        name === 'InvalidParameterException';

      if (authFlowIssue) {
        const result = await signIn({
          username,
          password,
          options: {
            authFlowType: 'USER_PASSWORD_AUTH',
          },
        });
        await this.syncAuthState();
        return result;
      }

      throw new Error(this.mapSignInError(error));
    }
  }

  async logout(): Promise<void> {
    await signOut();
    this.setCurrentUser(null);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      const authenticated = !!session.tokens?.idToken;
      this.isAuthenticatedSubject.next(authenticated);
      if (authenticated && !this.userSubject.value) {
        await this.syncAuthState();
      }
      return authenticated;
    } catch {
      this.setCurrentUser(null);
      return false;
    }
  }

  async getIdToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() ?? null;
    } catch {
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() ?? null;
    } catch {
      return null;
    }
  }

  async forgotPassword(email: string) {
    return resetPassword({ username: email });
  }

  async getUser(): Promise<User | null> {
    await this.syncAuthState();
    return this.userSubject.value;
  }

  private async syncAuthState(): Promise<void> {
    try {
      const [cognitoUser, session] = await Promise.all([getCurrentUser(), fetchAuthSession()]);
      const payload = (session.tokens?.idToken?.payload ?? {}) as Record<string, unknown>;
      const givenName = String(payload['given_name'] ?? '');
      const familyName = String(payload['family_name'] ?? '');
      const fullName =
        String(payload['name'] ?? '').trim() || [givenName, familyName].filter(Boolean).join(' ');
      const email = String(payload['email'] ?? cognitoUser.signInDetails?.loginId ?? '');

      const mappedUser: User = {
        ...this.emptyUser,
        id: cognitoUser.userId ?? '',
        email,
        fullName,
        firstName: givenName,
        lastName: familyName,
      };
      this.setCurrentUser(mappedUser);
    } catch {
      this.setCurrentUser(null);
    }
  }

  private mapSignInError(error: unknown): string {
    const e = error as { name?: string; message?: string };
    const name = String(e?.name ?? '');
    const message = String(e?.message ?? '');

    if (name === 'NotAuthorizedException') {
      return 'Invalid email or password.';
    }
    if (name === 'UserNotConfirmedException') {
      return 'User is not confirmed yet. Please confirm your account.';
    }
    if (name === 'UserNotFoundException') {
      return 'User does not exist.';
    }
    if (message.includes('secret hash')) {
      return 'Cognito App Client is using a client secret. Create a public app client (without secret) for web login.';
    }
    if (message.includes('Auth flow')) {
      return 'Cognito App Client auth flow is not enabled. Enable USER_PASSWORD_AUTH and/or USER_SRP_AUTH.';
    }

    return message || 'Unable to sign in right now.';
  }
}
