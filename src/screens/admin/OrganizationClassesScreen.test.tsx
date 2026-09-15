import { getAuthorizedOrganizations } from '../../types/admin';

describe('organization classes scope', () => {
  it('keeps organization IDs available for organization-scoped class requests', () => {
    const organizations = getAuthorizedOrganizations([{ id: 12, name: 'Al-Huda Education' }]);

    expect(organizations[0]?.id).toBe(12);
  });
});
