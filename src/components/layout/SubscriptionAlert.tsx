import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { differenceInDays, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubscriptionAlertProps {
  onRenewClick: () => void;
}

const SubscriptionAlert: React.FC<SubscriptionAlertProps> = ({ onRenewClick }) => {
  const { t } = useTranslation();
  const { user } = useSession();

  if (!user || !user.plan_type || user.plan_type === 'free' || !user.subscription_expires_at) {
    return null;
  }

  const expiresAt = parseISO(user.subscription_expires_at);
  const today = new Date();
  const daysRemaining = differenceInDays(expiresAt, today);

  if (daysRemaining > 7 || daysRemaining < 0) {
    return null;
  }

  const message = daysRemaining > 1 
    ? t('subscriptionAlert.expiresInDays', { count: daysRemaining })
    : daysRemaining === 1
    ? t('subscriptionAlert.expiresInOneDay')
    : t('subscriptionAlert.expired');

  return (
    <div className="px-4 pt-4">
      <Alert variant="destructive" className="bg-yellow-600/20 border-yellow-500 text-yellow-300">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertTitle className="text-yellow-300 font-bold">{t('subscriptionAlert.title')}</AlertTitle>
        <AlertDescription className="flex justify-between items-center text-yellow-200">
          {message}
          <Button onClick={onRenewClick} size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
            {t('subscriptionAlert.renew')}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SubscriptionAlert;