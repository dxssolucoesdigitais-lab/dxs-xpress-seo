import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PricingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface PricingTier {
  planId: string;
  name: string;
  price: string;
  credits: number;
  features: string[];
  popular: boolean;
}

const PricingDialog: React.FC<PricingDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const pricingTiers: PricingTier[] = t('pricingDialog.tiers', { returnObjects: true });

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      showError("toasts.plans.loginRequired");
      return;
    }
    setIsSubmitting(planId);
    try {
      // Invoca a edge function para criar uma sessão de checkout
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId },
      });

      if (error) throw error;

      // Redireciona o usuário para a URL do gateway de pagamento
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Checkout URL not received.");
      }

    } catch (error: any) {
      showError('toasts.plans.checkoutFailed');
      console.error("Error creating checkout session:", error.message);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t('pricingDialog.title')}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {t('pricingDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "p-6 rounded-lg border bg-secondary flex flex-col relative",
                tier.popular ? "border-cyan-400" : "border-border",
                user?.plan_type === tier.planId && "ring-2 ring-cyan-400"
              )}
            >
              {tier.popular && (
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-cyan-400 text-black px-3 py-1 text-xs font-bold rounded-full">
                  {t('pricingDialog.popular')}
                </div>
              )}
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">
                {tier.price}
                <span className="text-base font-medium text-muted-foreground"> {t('pricingDialog.perMonth')}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1">{feature.startsWith('👉') ? '' : '✔'}</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="mt-8 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px"
                disabled={isSubmitting !== null || user?.plan_type === tier.planId}
                onClick={() => handleSelectPlan(tier.planId)}
              >
                {isSubmitting === tier.planId ? <Loader2 className="h-4 w-4 animate-spin" /> : (user?.plan_type === tier.planId ? t('pricingDialog.currentPlan') : t('pricingDialog.selectPlan'))}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
            <div className="text-xs text-muted-foreground text-center w-full space-y-1">
              <p>{t('pricingDialog.footerNote1')}</p>
              <p>{t('pricingDialog.footerNote2')}</p>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;