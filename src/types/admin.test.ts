import { getAuthorizedOrganizations, getOrganizationCount } from './admin';

describe('getAuthorizedOrganizations', () => {
  it('accepts only backend-returned organization resources with IDs and names', () => {
    expect(
      getAuthorizedOrganizations([
        { id: 1, name: 'Al-Hikmah' },
        { id: 2, name: 99 },
      ]),
    ).toEqual([{ id: 1, name: 'Al-Hikmah' }]);
  });

  it('returns an empty list for a non-array dashboard field', () => {
    expect(getAuthorizedOrganizations({ count: 3 })).toEqual([]);
  });

  it('accepts backend resource collections and singular organization resources', () => {
    expect(getAuthorizedOrganizations({ data: [{ id: 1, name: 'Al-Hikmah' }] })).toEqual([
      { id: 1, name: 'Al-Hikmah' },
    ]);
    expect(getAuthorizedOrganizations({ id: 2, name: 'Demo Learning Centre' })).toEqual([
      { id: 2, name: 'Demo Learning Centre' },
    ]);
  });

  it('uses a backend organization count when the dashboard returns a count instead of a list', () => {
    expect(getOrganizationCount({ organizations: 1 })).toBe(1);
    expect(getOrganizationCount({ organization_count: 1 })).toBe(1);
  });
});
