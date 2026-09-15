import { editOrganizationSchema } from './EditOrganizationScreen';

describe('editOrganizationSchema', () => {
  it('accepts the documented optional update fields', () => {
    expect(
      editOrganizationSchema.safeParse({
        code: 'ALHUDA',
        description: 'Updated organization description',
        logoPath: 'organizations/alhuda/logo.png',
        name: 'Al-Huda Learning Centre',
        status: 'active',
      }).success,
    ).toBe(true);
  });

  it('requires a valid organization name and status', () => {
    expect(
      editOrganizationSchema.safeParse({
        code: '',
        description: '',
        logoPath: '',
        name: '',
        status: 'active',
      }).success,
    ).toBe(false);
  });
});
