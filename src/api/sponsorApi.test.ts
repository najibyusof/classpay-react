import { sponsorApi } from './sponsorApi';

jest.mock('./client', () => ({ apiClient: { get: jest.fn() } }));

import { apiClient } from './client';

const get = apiClient.get as jest.Mock;

describe('sponsorApi', () => {
  beforeEach(() => get.mockReset());

  it('gets sponsor schedules without a client-provided student ID', async () => {
    get.mockResolvedValue({ data: { data: [], meta: { current_page: 1, last_page: 1 } } });

    await sponsorApi.getPaymentSchedules();

    expect(get).toHaveBeenCalledWith('/sponsor/payment-schedules', { params: { page: 1 } });
  });

  it('gets current schedules from the sponsor self-service endpoint', async () => {
    get.mockResolvedValue({ data: { data: [] } });

    await expect(sponsorApi.getCurrentPaymentSchedules()).resolves.toEqual([]);
    expect(get).toHaveBeenCalledWith('/sponsor/payment-schedules/current');
  });

  it('gets sponsor payments without a client-provided student ID', async () => {
    get.mockResolvedValue({ data: { data: [], meta: { current_page: 1, last_page: 1 } } });

    await sponsorApi.getPayments(2);

    expect(get).toHaveBeenCalledWith('/sponsor/payments', { params: { page: 2 } });
  });

  it('gets an individual sponsor-authorized schedule without a student ID', async () => {
    const schedule = { id: 12 };
    get.mockResolvedValue({ data: { data: schedule } });

    await expect(sponsorApi.getPaymentSchedule(12)).resolves.toEqual(schedule);
    expect(get).toHaveBeenCalledWith('/sponsor/payment-schedules/12');
  });
});
