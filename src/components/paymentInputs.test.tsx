import { fireEvent, render } from '@testing-library/react-native';

import { AdditionalInfaqInput } from './AdditionalInfaqInput';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentFailedScreen } from '../screens/payment-schedules/PaymentFailedScreen';
import { PaymentPendingScreen } from '../screens/payment-schedules/PaymentPendingScreen';
import { PaymentSuccessScreen } from '../screens/payment-schedules/PaymentSuccessScreen';

describe('payment inputs', () => {
  it('renders the selected payment method', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <PaymentMethodSelector onChange={onChange} value="bank_transfer" />,
    );

    fireEvent(screen.getByLabelText('Payment method'), 'onValueChange', 'qr');
    expect(onChange).toHaveBeenCalledWith('qr');
  });

  it('disables and resets additional infaq when the schedule does not allow it', async () => {
    const screen = await render(
      <AdditionalInfaqInput
        allowed={false}
        currency="MYR"
        onChangeText={jest.fn()}
        value="25.00"
      />,
    );

    const input = screen.getByLabelText('Additional infaq');
    expect(input.props.editable).toBe(false);
    expect(input.props.value).toBe('0');
    expect(screen.getByText('Additional infaq is not available for this schedule.')).toBeTruthy();
  });

  it('renders pending, failed, and backend-confirmed success states distinctly', async () => {
    const pending = await render(<PaymentPendingScreen onDone={jest.fn()} status="pending" />);
    expect(pending.getByText('Payment pending')).toBeTruthy();
    expect(pending.getByText(/It has not been marked as paid/)).toBeTruthy();

    const failed = await render(<PaymentFailedScreen onDone={jest.fn()} />);
    expect(failed.getByText('Payment failed')).toBeTruthy();

    const success = await render(<PaymentSuccessScreen onDone={jest.fn()} />);
    expect(success.getByText('The backend has confirmed this payment as paid.')).toBeTruthy();
  });
});
