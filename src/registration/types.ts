export type PublicRegistrationRole = 'admin' | 'student' | 'sponsor';

export interface RegistrationCapability {
  role: PublicRegistrationRole;
  isAvailable: boolean;
  unavailableMessage: string;
}
