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
  phone: string;
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

export interface AppUserProfile {
  id: string;
  cognitoSub: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  condominiumId?: string | null;
  condominium?: Condominium | null;
  /**
   * Flag opt-in: indica que o usuário ativou o modo prestador.
   * Todo usuário autenticado com condomínio é morador por padrão.
   */
  isProvider: boolean;
  onboardingCompleted: boolean;
  addressCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
