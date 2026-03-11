export type UserRole = 'provider' | 'customer';

export interface CondominiumAddress {
  name?: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface OnboardingProfile {
  condominiumId: string | null;
  condominiumAddress: CondominiumAddress | null;
  role: UserRole | null;
  onboardingCompleted: boolean;
}
