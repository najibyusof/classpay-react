import { paymentCreationService } from './paymentCreationService';

jest.mock('../api/client', () => ({ apiClient: { post: jest.fn() } }));

import { apiClient } from '../api/client';

const post = apiClient.post as jest.Mock;

describe('paymentCreationService', () => {
  beforeEach(() => post.mockReset());

  it('sends only the allowed student payment creation fields', async () => {
    post.mockResolvedValue({ data: { data: { id: 3, status: 'initiated' } } });

    await paymentCreationService.create('student', 12, {
      additionalInfaq: '20.00',
      paymentMethod: 'merchant',
    });

    expect(post).toHaveBeenCalledWith('/student/payment-schedules/12/payments', {
      additional_infaq: '20.00',
      payment_method: 'merchant',
    });
    const payload = post.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('payer_id');
    expect(payload).not.toHaveProperty('required_amount');
    expect(payload).not.toHaveProperty('total_amount');
    expect(payload).not.toHaveProperty('status');
    expect(payload).not.toHaveProperty('paid_at');
    expect(payload).not.toHaveProperty('verified_at');
  });

  it('uses the sponsor route without payer or participant fields', async () => {
    post.mockResolvedValue({ data: { id: 4, status: 'pending' } });

    await expect(
      paymentCreationService.create('sponsor', 20, { additionalInfaq: '0', paymentMethod: 'qr' }),
    ).resolves.toEqual({ id: 4, status: 'pending' });
    expect(post).toHaveBeenCalledWith('/sponsor/payment-schedules/20/payments', {
      additional_infaq: '0',
      payment_method: 'qr',
    });
  });

  it('preserves backend-supplied QR payment information without generating it locally', async () => {
    const response = {
      gateway_response: {
        payment_instructions: 'Scan the supplied QR code.',
        qr_code_url: 'https://payments.example.test/qr/4',
      },
      id: 4,
      status: 'initiated',
    };
    post.mockResolvedValue({ data: response });

    await expect(
      paymentCreationService.create('student', 20, {
        additionalInfaq: '0',
        paymentMethod: 'qr',
      }),
    ).resolves.toEqual(response);
  });
});
