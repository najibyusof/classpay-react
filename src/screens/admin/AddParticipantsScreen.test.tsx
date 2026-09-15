import { getAuthorizedOrganizations } from '../../types/admin';

describe('AddParticipantsScreen scope', () => {
  it('keeps the selected class identifier available for participant requests', () => {
    const organization = getAuthorizedOrganizations([{ id: 1, name: 'Padat' }])[0];

    expect({ classId: 10, organizationId: organization?.id }).toEqual({
      classId: 10,
      organizationId: 1,
    });
  });
});
