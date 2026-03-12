import { Condominium } from './condominium.type';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  givenName: string;
  familyName: string;
  avatarUrl: string;
  locale: string;
  address: string;
  phone:string;
  authProvider: 'google' | 'cognito' | 'email-password' | 'unknown';
  cognitoUsername: string;
  providerUserId: string;
  groups: string[];
  permissions: string[];
  condominium: Condominium | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  metadata: Record<string, unknown>;
}

export type UserRoleInCondo = 'provider' | 'customer';

export interface AppUserProfile {
  id: string;
  cognitoSub: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  condominiumId?: string | null;
  condominium?: Condominium | null;
  roleInCondominium?: UserRoleInCondo | null;
  onboardingCompleted: boolean;
  addressCompleted: boolean;
  roleCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
