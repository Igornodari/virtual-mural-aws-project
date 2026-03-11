import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AmplifyService } from './amplify.service';
import { Condominium, Unit, User } from '../../shared/types';
import {
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
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
    email: '',
    emailVerified: false,
    displayName: '',
    givenName: '',
    familyName: '',
    avatarUrl: '',
    locale: '',
    address: '',
    authProvider: 'unknown',
    cognitoUsername: '',
    providerUserId: '',
    groups: [],
    permissions: [],
    condominium: null,
    createdAt: '',
    updatedAt: '',
    lastLoginAt: '',
    metadata: {},
  };

  public pendingCred: unknown = null;
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly condominiumSubject = new BehaviorSubject<Condominium | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  readonly $user = this.userSubject.asObservable();
  readonly $condominium = this.condominiumSubject.asObservable();
  // Compatibilidade temporária com código legado.
  readonly $unit = this.$condominium;
  readonly $isLogggedIn = this.isAuthenticatedSubject.asObservable();

  constructor(
    private readonly amplifyService: AmplifyService,
    private readonly ngZone: NgZone,
  ) {
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
    this.ngZone.run(() => {
      this.userSubject.next(user);
      this.condominiumSubject.next(user?.condominium ?? null);
      this.isAuthenticatedSubject.next(!!user);
    });
  }

  setCurrentCondominium(condominium: Condominium | null): void {
    this.condominiumSubject.next(condominium);
  }

  // Compatibilidade temporária com código legado.
  setCurrentUnit(unit: Unit | null): void {
    this.setCurrentCondominium(unit);
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
    try {
      await signOut();
    } catch {
      // Mantemos logout local mesmo se o signOut remoto falhar.
    } finally {
      this.setCurrentUser(null);
    }
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
    await this.withTimeout(this.syncAuthState(), 5000);
    return this.userSubject.value;
  }

  async getAuthDebugData(): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    idToken: string | null;
    accessToken: string | null;
    idTokenClaims: Record<string, unknown>;
    accessTokenClaims: Record<string, unknown>;
    grantedScopes: string[];
    userAttributes: Record<string, string>;
    userAttributesSource: 'cognito-get-user' | 'id-token-only';
    googleProfileDraft: {
      provider: 'google' | 'email-password';
      cognitoSub: string;
      cognitoUsername: string;
      providerUserId: string;
      email: string;
      emailVerified: boolean;
      fullName: string;
      firstName: string;
      lastName: string;
      picture: string;
      locale: string;
      address: string;
      groups: string[];
    } | null;
    cognitoCurrentUser: { username: string; userId: string; signInProvider?: string | null } | null;
  }> {
    const session = await this.withTimeout(fetchAuthSession(), 5000);
    const idToken = session.tokens?.idToken ?? null;
    const accessToken = session.tokens?.accessToken ?? null;
    const isAuthenticated = !!idToken;

    if (!isAuthenticated) {
      this.setCurrentUser(null);
      return {
        isAuthenticated: false,
        user: null,
        idToken: null,
        accessToken: null,
        idTokenClaims: {},
        accessTokenClaims: {},
        grantedScopes: [],
        userAttributes: {},
        userAttributesSource: 'id-token-only',
        googleProfileDraft: null,
        cognitoCurrentUser: null,
      };
    }

    const accessTokenClaims = (accessToken?.payload ?? {}) as Record<string, unknown>;
    const scopeRaw = String(accessTokenClaims['scope'] ?? '');
    const grantedScopes = scopeRaw
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean);
    const hasAdminScope = grantedScopes.includes('aws.cognito.signin.user.admin');

    let userAttributes: Partial<Record<string, string>> = {};
    if (hasAdminScope) {
      try {
        userAttributes = await this.withTimeout(fetchUserAttributes(), 4000);
      } catch {
        // fallback to token claims when attributes cannot be fetched
      }
    }
    const normalizedUserAttributes = Object.fromEntries(
      Object.entries(userAttributes).filter(([, value]) => typeof value === 'string' && value.length > 0),
    ) as Record<string, string>;

    let cognitoCurrentUser: Awaited<ReturnType<typeof getCurrentUser>> | null = null;
    try {
      cognitoCurrentUser = await this.withTimeout(getCurrentUser(), 3000);
    } catch {
      // getCurrentUser can fail in some callback/oauth scenarios
    }

    const idTokenClaims = (idToken?.payload ?? {}) as Record<string, unknown>;
    const mappedUser = this.mapClaimsToUser(
      idTokenClaims,
      accessTokenClaims,
      normalizedUserAttributes,
      cognitoCurrentUser,
    );
    this.setCurrentUser(mappedUser);
    const googleProfileDraft = this.extractGoogleProfileDraft(idTokenClaims, accessTokenClaims, mappedUser);

    return {
      isAuthenticated: true,
      user: mappedUser,
      idToken: idToken?.toString() ?? null,
      accessToken: accessToken?.toString() ?? null,
      idTokenClaims,
      accessTokenClaims,
      grantedScopes,
      userAttributes: normalizedUserAttributes,
      userAttributesSource: hasAdminScope ? 'cognito-get-user' : 'id-token-only',
      googleProfileDraft,
      cognitoCurrentUser: cognitoCurrentUser
        ? {
            username: cognitoCurrentUser.username,
            userId: cognitoCurrentUser.userId,
            signInProvider: cognitoCurrentUser.signInDetails?.authFlowType ?? null,
          }
        : null,
    };
  }

  private async syncAuthState(): Promise<void> {
    try {
      const session = await this.withTimeout(fetchAuthSession(), 5000);
      const idToken = session.tokens?.idToken;
      if (!idToken) {
        this.setCurrentUser(null);
        return;
      }

      let cognitoUser: Awaited<ReturnType<typeof getCurrentUser>> | null = null;
      try {
        cognitoUser = await this.withTimeout(getCurrentUser(), 2000);
      } catch {
        // token claims fallback
      }

      const payload = (idToken.payload ?? {}) as Record<string, unknown>;
      const accessPayload = (session.tokens?.accessToken?.payload ?? {}) as Record<string, unknown>;
      const mappedUser = this.mapClaimsToUser(payload, accessPayload, {}, cognitoUser);
      this.setCurrentUser(mappedUser);
    } catch {
      this.setCurrentUser(null);
    }
  }

  private extractGoogleProfileDraft(
    idTokenClaims: Record<string, unknown>,
    accessTokenClaims: Record<string, unknown>,
    user: User,
  ) {
    const cognitoUsername = this.claimToString(
      idTokenClaims['cognito:username'] ?? accessTokenClaims['username'],
    );
    const identities = Array.isArray(idTokenClaims['identities'])
      ? (idTokenClaims['identities'] as Array<Record<string, unknown>>)
      : [];
    const identity = identities[0] ?? {};
    const isGoogle = cognitoUsername.startsWith('google_') || identities.length > 0;

    return {
      provider: isGoogle ? ('google' as const) : ('email-password' as const),
      cognitoSub: this.claimToString(idTokenClaims['sub'] ?? user.id),
      cognitoUsername,
      providerUserId: this.claimToString(identity['userId']),
      email: user.email || this.claimToString(idTokenClaims['email']),
      emailVerified: Boolean(idTokenClaims['email_verified'] ?? false),
      fullName: user.displayName || this.claimToString(idTokenClaims['name']),
      firstName: user.givenName || this.claimToString(idTokenClaims['given_name']),
      lastName: user.familyName || this.claimToString(idTokenClaims['family_name']),
      picture: user.avatarUrl || this.claimToString(idTokenClaims['picture']),
      locale: user.locale || this.claimToString(idTokenClaims['locale']),
      address: user.address || this.claimToString(idTokenClaims['address']),
      groups: Array.isArray(idTokenClaims['cognito:groups'])
        ? (idTokenClaims['cognito:groups'] as string[])
        : [],
    };
  }

  private mapClaimsToUser(
    idTokenClaims: Record<string, unknown>,
    accessTokenClaims: Record<string, unknown>,
    attributes: Record<string, string>,
    cognitoCurrentUser: Awaited<ReturnType<typeof getCurrentUser>> | null,
  ): User {
    const givenName = this.claimToString(idTokenClaims['given_name'] ?? attributes['given_name']);
    const familyName = this.claimToString(idTokenClaims['family_name'] ?? attributes['family_name']);
    const displayName =
      this.claimToString(idTokenClaims['name'] ?? attributes['name']) ||
      [givenName, familyName].filter(Boolean).join(' ');
    const email =
      this.claimToString(idTokenClaims['email'] ?? attributes['email']) ||
      this.claimToString(cognitoCurrentUser?.signInDetails?.loginId);
    const id = this.claimToString(idTokenClaims['sub'] ?? cognitoCurrentUser?.userId);
    const cognitoUsername = this.claimToString(
      idTokenClaims['cognito:username'] ?? accessTokenClaims['username'] ?? cognitoCurrentUser?.username,
    );
    const identities = Array.isArray(idTokenClaims['identities'])
      ? (idTokenClaims['identities'] as Array<Record<string, unknown>>)
      : [];
    const identity = identities[0] ?? {};
    const isGoogleUser = cognitoUsername.startsWith('google_') || identities.length > 0;

    return {
      ...this.emptyUser,
      id,
      email,
      emailVerified: String(idTokenClaims['email_verified'] ?? attributes['email_verified'] ?? '') === 'true',
      displayName,
      givenName,
      familyName,
      avatarUrl: this.claimToString(idTokenClaims['picture'] ?? attributes['picture']),
      locale: this.claimToString(idTokenClaims['locale'] ?? attributes['locale']),
      address: this.claimToString(idTokenClaims['address'] ?? attributes['address']),
      authProvider: isGoogleUser ? 'google' : 'cognito',
      cognitoUsername,
      providerUserId: this.claimToString(identity['userId']),
      groups: Array.isArray(idTokenClaims['cognito:groups'])
        ? (idTokenClaims['cognito:groups'] as string[])
        : [],
      permissions: [],
      condominium: null,
      createdAt: '',
      updatedAt: '',
      lastLoginAt: new Date().toISOString(),
      metadata: {
        idTokenClaims,
        accessTokenClaims,
        attributes,
      },
    };
  }

  private claimToString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value == null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
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

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Auth operation timeout')), ms);
      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }
}
