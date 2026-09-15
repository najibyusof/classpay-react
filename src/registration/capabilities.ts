import type { PublicRegistrationRole, RegistrationCapability } from './types';

const capabilities: Record<PublicRegistrationRole, RegistrationCapability> = {
  admin: { isAvailable: true, role: 'admin', unavailableMessage: '' },
  student: { isAvailable: true, role: 'student', unavailableMessage: '' },
  sponsor: { isAvailable: true, role: 'sponsor', unavailableMessage: '' },
};

export function getRegistrationCapability(role: PublicRegistrationRole): RegistrationCapability {
  return capabilities[role];
}

export function isPublicRegistrationAvailable(role: PublicRegistrationRole): boolean {
  return getRegistrationCapability(role).isAvailable;
}
