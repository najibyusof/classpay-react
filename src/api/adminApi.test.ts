jest.mock('./client', () => ({
  apiClient: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

import { adminApi } from './adminApi';
import { apiClient } from './client';

const get = apiClient.get as jest.Mock;
const del = apiClient.delete as jest.Mock;
const patch = apiClient.patch as jest.Mock;
const post = apiClient.post as jest.Mock;

describe('adminApi', () => {
  beforeEach(() => {
    get.mockReset();
    del.mockReset();
    patch.mockReset();
    post.mockReset();
  });

  it('gets the backend-scoped admin dashboard without an organization identifier', async () => {
    get.mockResolvedValue({ data: { data: { organizations: [{ id: 5, name: 'Al-Hikmah' }] } } });

    await expect(adminApi.getDashboard()).resolves.toEqual({
      organizations: [{ id: 5, name: 'Al-Hikmah' }],
    });
    expect(get).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('gets the documented paginated organization list', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          organizations: [{ id: 1, name: 'Padat School' }],
          pagination: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
        },
      },
    });

    await expect(adminApi.getOrganizations()).resolves.toEqual({
      data: [{ id: 1, name: 'Padat School' }],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
    });
    expect(get).toHaveBeenCalledWith('/admin/organizations', { params: { page: 1, per_page: 20 } });
  });

  it('gets the selected organization from the documented show endpoint', async () => {
    get.mockResolvedValue({ data: { data: { id: 1, name: 'Padat', code: '1234' } } });

    await expect(adminApi.getOrganization(1)).resolves.toEqual({
      id: 1,
      name: 'Padat',
      code: '1234',
    });
    expect(get).toHaveBeenCalledWith('/admin/organizations/1');
  });

  it('creates an organization through the documented endpoint', async () => {
    post.mockResolvedValue({
      data: { data: { id: 1, name: 'Al-Huda Learning Centre', status: 'active' } },
    });

    await expect(
      adminApi.createOrganization({
        code: 'ALHUDA',
        description: 'Islamic learning centre',
        logo_path: 'organizations/alhuda/logo.png',
        name: 'Al-Huda Learning Centre',
        status: 'active',
      }),
    ).resolves.toEqual({ id: 1, name: 'Al-Huda Learning Centre', status: 'active' });

    expect(post).toHaveBeenCalledWith('/admin/organizations', {
      code: 'ALHUDA',
      description: 'Islamic learning centre',
      logo_path: 'organizations/alhuda/logo.png',
      name: 'Al-Huda Learning Centre',
      status: 'active',
    });
  });

  it('gets an organization dashboard only for an organization returned by an authorized flow', async () => {
    get.mockResolvedValue({ data: { data: { active_students: 20 } } });

    await adminApi.getOrganizationDashboard(5);

    expect(get).toHaveBeenCalledWith('/admin/organizations/5/dashboard');
  });

  it('updates an organization through the documented patch endpoint', async () => {
    patch.mockResolvedValue({
      data: { data: { id: 1, name: 'Updated Organization', status: 'active' } },
    });

    await expect(
      adminApi.updateOrganization(1, {
        description: 'Updated description',
        name: 'Updated Organization',
        status: 'active',
      }),
    ).resolves.toEqual({ id: 1, name: 'Updated Organization', status: 'active' });

    expect(patch).toHaveBeenCalledWith('/admin/organizations/1', {
      description: 'Updated description',
      name: 'Updated Organization',
      status: 'active',
    });
  });

  it('gets classes scoped to the selected organization', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          classes: [{ id: 4, name: 'Algebra' }],
          pagination: { current_page: 1, last_page: 1 },
        },
      },
    });

    await expect(adminApi.getOrganizationClasses(12)).resolves.toEqual({
      data: [{ id: 4, name: 'Algebra' }],
      meta: { current_page: 1, last_page: 1 },
    });
    expect(get).toHaveBeenCalledWith('/organizations/12/classes', {
      params: { page: 1, per_page: 20 },
    });
  });

  it('creates a class under the selected organization', async () => {
    post.mockResolvedValue({
      data: { data: { id: 10, organization_id: 1, name: 'Form 5 Physics' } },
    });

    await expect(
      adminApi.createOrganizationClass(1, {
        day_of_week: 1,
        name: 'Form 5 Physics',
        payment_amount: 50,
        recurrence_type: 'weekly',
        start_time: '10:00',
        teacher_name: 'Cikgu Ahmad',
      }),
    ).resolves.toEqual({ id: 10, organization_id: 1, name: 'Form 5 Physics' });

    expect(post).toHaveBeenCalledWith('/organizations/1/classes', {
      day_of_week: 1,
      name: 'Form 5 Physics',
      payment_amount: 50,
      recurrence_type: 'weekly',
      start_time: '10:00',
      teacher_name: 'Cikgu Ahmad',
    });
  });

  it('gets a class through the selected organization scope', async () => {
    get.mockResolvedValue({
      data: { data: { id: 10, organization_id: 1, name: 'Form 5 Physics', status: 'draft' } },
    });

    await expect(adminApi.getOrganizationClass(1, 10)).resolves.toEqual({
      id: 10,
      organization_id: 1,
      name: 'Form 5 Physics',
      status: 'draft',
    });
    expect(get).toHaveBeenCalledWith('/organizations/1/classes/10');
  });

  it('updates a class through the selected organization scope', async () => {
    patch.mockResolvedValue({
      data: { data: { id: 10, organization_id: 1, name: 'Form 5 Advanced Physics' } },
    });

    await expect(
      adminApi.updateOrganizationClass(1, 10, {
        day_of_week: 1,
        name: 'Form 5 Advanced Physics',
        payment_amount: 50,
        recurrence_type: 'weekly',
        start_time: '10:00',
        status: 'active',
      }),
    ).resolves.toEqual({ id: 10, organization_id: 1, name: 'Form 5 Advanced Physics' });

    expect(patch).toHaveBeenCalledWith('/organizations/1/classes/10', {
      day_of_week: 1,
      name: 'Form 5 Advanced Physics',
        payment_amount: 50,
        recurrence_type: 'weekly',
        start_time: '10:00',
      status: 'active',
    });
  });

  it('updates a class schedule through the schedule endpoint', async () => {
    patch.mockResolvedValue({
      data: { data: { id: 22, class_id: 10, day_of_week: 2, start_time: '17:30' } },
    });

    await expect(
      adminApi.updateClassSchedule(22, {
        day_of_week: 2,
        recurrence_type: 'fortnightly',
        start_time: '17:30',
      }),
    ).resolves.toEqual({ id: 22, class_id: 10, day_of_week: 2, start_time: '17:30' });
    expect(patch).toHaveBeenCalledWith('/class-schedules/22', {
      day_of_week: 2,
      recurrence_type: 'fortnightly',
      start_time: '17:30',
    });
  });

  it('gets the class payment setting', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          bank_account_name: 'Najib Yusof',
          bank_account_number: '55419004846',
          bank_name: 'Maybank',
          class_id: 10,
          qr_code_path: 'qr-codes/class.png',
          required_amount: '50.00',
        },
      },
    });

    await expect(adminApi.getClassPaymentSetting(10)).resolves.toEqual({
      bank_account_name: 'Najib Yusof',
      bank_account_number: '55419004846',
      bank_name: 'Maybank',
      class_id: 10,
      qr_code_path: 'qr-codes/class.png',
      required_amount: '50.00',
    });
    expect(get).toHaveBeenCalledWith('/classes/10/payment-setting');
  });

  it('updates class payment setting bank details', async () => {
    patch.mockResolvedValue({
      data: { data: { id: 5, class_id: 10, bank_name: 'Maybank' } },
    });

    await expect(
      adminApi.updateClassPaymentSetting(10, {
        bank_account_name: 'Padat Education',
        bank_account_number: '1234567890',
        bank_name: 'Maybank',
      }),
    ).resolves.toEqual({ id: 5, class_id: 10, bank_name: 'Maybank' });

    expect(patch).toHaveBeenCalledWith('/classes/10/payment-setting', {
      bank_account_name: 'Padat Education',
      bank_account_number: '1234567890',
      bank_name: 'Maybank',
    });
  });

  it('uploads class payment QR code as multipart form data', async () => {
    post.mockResolvedValue({
      data: { data: { id: 5, class_id: 10, qr_code_path: 'qr-codes/class.png' } },
    });

    await expect(
      adminApi.uploadClassPaymentQrCode(10, {
        name: 'class-qr.png',
        type: 'image/png',
        uri: 'file:///class-qr.png',
      }),
    ).resolves.toEqual({ id: 5, class_id: 10, qr_code_path: 'qr-codes/class.png' });

    expect(post).toHaveBeenCalledWith(
      '/classes/10/payment-setting/qr-code',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });

  it('lists and adds participants for a class', async () => {
    get.mockResolvedValue({
      data: {
        data: [
          {
            id: 7,
            class_id: 10,
            user: { id: 12, name: 'Ahmad Daniel', phone: '+60123456789' },
            participant_type: 'student',
            status: 'active',
          },
        ],
      },
    });
    post.mockResolvedValue({ data: { data: { id: 8, name: 'Nur Aina', user_id: 22 } } });

    await expect(adminApi.getClassParticipants(10)).resolves.toEqual({
      data: [
        {
          id: 7,
          class_id: 10,
          user: { id: 12, name: 'Ahmad Daniel', phone: '+60123456789' },
          participant_type: 'student',
          status: 'active',
        },
      ],
      meta: { current_page: 1, last_page: 1 },
    });
    await expect(
      adminApi.addClassParticipant(10, { participant_type: 'student', user_id: 22 }),
    ).resolves.toEqual({ id: 8, name: 'Nur Aina', user_id: 22 });

    expect(post).toHaveBeenCalledWith('/admin/classes/10/participants', {
      participant_type: 'student',
      user_id: 22,
    });
  });

  it('updates a student profile', async () => {
    patch.mockResolvedValue({ data: { data: { id: 12, name: 'Updated Student' } } });
    await expect(adminApi.updateAdminStudent(12, { name: 'Updated Student' })).resolves.toEqual({
      id: 12,
      name: 'Updated Student',
    });
    expect(patch).toHaveBeenCalledWith('/admin/students/12', { name: 'Updated Student' });
  });

  it('removes a participant from a class', async () => {
    del.mockResolvedValue({});
    await expect(adminApi.deleteClassParticipant(10, 22)).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith('/admin/classes/10/participants/22');
  });

  it('supports the legacy wrapped participants shape', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          participants: [{ id: 7, name: 'Ahmad Daniel' }],
          pagination: { current_page: 2, last_page: 3 },
        },
      },
    });

    await expect(adminApi.getClassParticipants(10)).resolves.toEqual({
      data: [{ id: 7, name: 'Ahmad Daniel' }],
      meta: { current_page: 2, last_page: 3 },
    });
  });

  it('searches students and sponsors by phone', async () => {
    get
      .mockResolvedValueOnce({ data: { data: { students: [{ id: 15, name: 'Ahmad Ali' }] } } })
      .mockResolvedValueOnce({ data: { data: { sponsors: [{ id: 16, name: 'Maya Ali' }] } } });

    await expect(adminApi.searchAdminStudents('+60123456789')).resolves.toEqual([
      { id: 15, name: 'Ahmad Ali' },
    ]);
    await expect(adminApi.searchAdminSponsors('+60123456789')).resolves.toEqual([
      { id: 16, name: 'Maya Ali' },
    ]);

    expect(get).toHaveBeenNthCalledWith(1, '/admin/students', {
      params: { page: 1, per_page: 20, search: '+60123456789' },
    });
    expect(get).toHaveBeenNthCalledWith(2, '/admin/sponsors', {
      params: { page: 1, per_page: 20, search: '+60123456789' },
    });
  });

  it('uses only documented admin payment listing and report endpoints', async () => {
    get
      .mockResolvedValueOnce({
        data: { data: { payments: [], pagination: { current_page: 1, last_page: 1 } } },
      })
      .mockResolvedValue({ data: { data: {} } });

    await adminApi.getPayments(2);
    await adminApi.getPayments(3, 92);
    await adminApi.getPayments(4, undefined, 7);
    await adminApi.getPayments(5, 92, 7, '2026-09-01', '2026-09-18');
    await adminApi.getPaymentSummary();
    await adminApi.getOutstandingReport();
    await adminApi.getOverdueReport();

    expect(get).toHaveBeenNthCalledWith(1, '/admin/payments', { params: { page: 2 } });
    expect(get).toHaveBeenNthCalledWith(2, '/admin/payments', {
      params: { page: 3, class_id: 92 },
    });
    expect(get).toHaveBeenNthCalledWith(3, '/admin/payments', {
      params: { page: 4, organization_id: 7 },
    });
    expect(get).toHaveBeenNthCalledWith(4, '/admin/payments', {
      params: { page: 5, class_id: 92, organization_id: 7, date_from: '2026-09-01', date_to: '2026-09-18' },
    });
    expect(get).toHaveBeenNthCalledWith(5, '/admin/reports/payment-summary');
    expect(get).toHaveBeenNthCalledWith(6, '/admin/reports/outstanding');
    expect(get).toHaveBeenNthCalledWith(7, '/admin/reports/overdue');
  });

  it('passes organization, class, and date filters to report endpoints', async () => {
    get.mockResolvedValue({ data: { data: {} } });

    const filters = {
      class_id: 92,
      date_from: '2026-09-01',
      date_to: '2026-09-18',
      organization_id: 7,
    };
    await adminApi.getPaymentSummary(filters);
    await adminApi.getOutstandingReport(filters);
    await adminApi.getOverdueReport(filters);

    expect(get).toHaveBeenNthCalledWith(1, '/admin/reports/payment-summary', { params: filters });
    expect(get).toHaveBeenNthCalledWith(2, '/admin/reports/outstanding', { params: filters });
    expect(get).toHaveBeenNthCalledWith(3, '/admin/reports/overdue', { params: filters });
  });

  it('sends a reminder for an overdue payment schedule', async () => {
    post.mockResolvedValue({ data: {} });

    await expect(adminApi.sendPaymentScheduleReminder(1)).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith('/payment-schedules/1/reminder');
  });

  it('verifies a paid payment through the admin payment update endpoint', async () => {
    patch.mockResolvedValue({
      data: { data: { id: 501, amount: 80, status: 'verified' } },
    });

    await expect(adminApi.updatePayment(501, { status: 'verified' })).resolves.toEqual({
      id: 501,
      amount: 80,
      status: 'verified',
    });
    expect(patch).toHaveBeenCalledWith('/payments/501', { status: 'verified' });
  });

  it('uploads an organization logo as multipart form data', async () => {
    post.mockResolvedValue({
      data: { data: { id: 1, name: 'Padat School', logo_path: 'organization-logos/logo.png' } },
    });

    await expect(
      adminApi.uploadOrganizationLogo(1, {
        name: 'logo.png',
        type: 'image/png',
        uri: 'file:///logo.png',
      }),
    ).resolves.toEqual({
      id: 1,
      name: 'Padat School',
      logo_path: 'organization-logos/logo.png',
    });

    expect(post).toHaveBeenCalledWith(
      '/admin/organizations/1/logo',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });

  it('retrieves an organization logo URL', async () => {
    get.mockResolvedValue({
      data: { data: { logo_url: 'https://classpay.padat.net/storage/organization-logos/logo.png' } },
    });

    await expect(adminApi.getOrganizationLogoUrl(1)).resolves.toBe(
      'https://classpay.padat.net/storage/organization-logos/logo.png',
    );

    expect(get).toHaveBeenCalledWith('/admin/organizations/1/logo');
  });
});
