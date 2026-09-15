import { ConfirmationDialog } from './ConfirmationDialog';

interface LogoutConfirmationProps {
  visible: boolean;
  isLoggingOut: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmation({
  visible,
  isLoggingOut,
  onConfirm,
  onCancel,
}: LogoutConfirmationProps) {
  return (
    <ConfirmationDialog
      confirmLabel={isLoggingOut ? 'Signing out...' : 'Sign out'}
      message="You will need to sign in again to access ClassPay."
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Sign out of ClassPay?"
      visible={visible}
    />
  );
}
