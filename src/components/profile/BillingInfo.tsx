import React, { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import PricingDialog from '@/components/billing/PricingDialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const BillingInfo = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);

  return (
    <>
      <Card className="glass-effect border-white/10 text-white">
        <CardHeader>
          <CardTitle>{t('billingInfo.title')}</CardTitle>
          <CardDescription className="text-gray-400">{t('billingInfo.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-black/20">
            <div>
              <p className="text-sm text-gray-400">{t('billingInfo.currentPlan')}</p>
              <p className="text-lg font-semibold capitalize">{user?.plan_type || t('billingInfo.freePlan')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('billingInfo.creditsRemaining')}</p>
              <p className={cn("text-lg font-semibold", user?.credits_remaining <= 0 ? "text-red-400" : "text-cyan-400")}>
                {user?.credits_remaining}
              </p>
            </div>
          </div>
          <Button 
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
            onClick={() => setIsPricingDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('billingInfo.changePlan')}
          </Button>
        </CardContent>
      </Card>
      <PricingDialog isOpen={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen} />
    </>
  );
};

export default BillingInfo;