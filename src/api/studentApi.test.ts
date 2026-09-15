import { studentApi } from './studentApi';

const mockGet = jest.fn();

jest.mock('./client', () => ({ apiClient: { get: jest.fn() } }));

import { apiClient } from './client';

const get = apiClient.get as jest.Mock;

describe('studentApi', () => {
  beforeEach(() => get.mockReset());

  it('loads the backend-defined current payment schedule', async () => {
    const schedule = { id: 1, required_amount: 80 };
    get.mockResolvedValue({ data: { data: schedule } });

    await expect(studentApi.getCurrentPaymentSchedule()).resolves.toEqual(schedule);
    expect(mockGet).not.toHaveBeenCalled();
    expect(get).toHaveBeenCalledWith('/student/payment-schedules/current');
  });

  it('requests payment history by backend pagination page', async () => {
    get.mockResolvedValue({ data: { data: [], meta: { current_page: 1, last_page: 2 } } });

    await studentApi.getPayments(2);

    expect(get).toHaveBeenCalledWith('/student/payments', { params: { page: 2 } });
  });

  it('gets an individual schedule from the documented self-service endpoint', async () => {
    const schedule = { id: 12 };
    get.mockResolvedValue({ data: { data: schedule } });

    await expect(studentApi.getPaymentSchedule(12)).resolves.toEqual(schedule);
    expect(get).toHaveBeenCalledWith('/student/payment-schedules/12');
  });
});
