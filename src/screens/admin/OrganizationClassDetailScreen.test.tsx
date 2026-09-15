import { getAuthorizedOrganizations } from '../../types/admin';

describe('organization class detail scope', () => {
  it('keeps the selected organization identity available for the detail route', () => {
    const organization = getAuthorizedOrganizations([{ id: 1, name: 'Al-Huda Education' }])[0];

    expect(organization).toEqual({ id: 1, name: 'Al-Huda Education' });
  });
});
