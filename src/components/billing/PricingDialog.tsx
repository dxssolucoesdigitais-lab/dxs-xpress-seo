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
import { CheckCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import CurrencySelectionDialog from './CurrencySelectionDialog';
import useEmblaCarousel from 'embla-carousel-react';

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

interface GSCService {
  serviceId: string;
  title: string;
  description: string;
  price: string;
  perAnalysis: string;
  features: string[];
  buyNow: string;
}

const PricingDialog: React.FC<PricingDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [selectedItemForCurrency, setSelectedItemForCurrency] = useState<{ type: 'plan' | 'gsc_analysis', id: string } | null>(null);

  const pricingTiers: PricingTier[] = t('pricingDialog.tiers', { returnObjects: true });
  const gscService: GSCService = t('pricingDialog.gscService', { returnObjects: true });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleSelectPlan = async (planId: string) => {
    setSelectedItemForCurrency({ type: 'plan', id: planId });
    setShowCurrencyDialog(true);
  };

  const handleBuyGSCAnalysis = async () => {
    setSelectedItemForCurrency({ type: 'gsc_analysis', id: gscService.serviceId });
    setShowCurrencyDialog(true);
  };

  const handleCurrencySelected = async (currency: 'BRL' | 'USD') => {
    if (!user || !selectedItemForCurrency) return;
    
    setIsSubmitting(selectedItemForCurrency.id);
    setShowCurrencyDialog(false);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          serviceType: selectedItemForCurrency.type,
          serviceId: selectedItemForCurrency.id,
          currency 
        },
      });

      if (error) throw error;

      if (currency === 'BRL' && data.checkoutUrl) {
        // Redirecionar para checkout BRL
        window.location.href = data.checkoutUrl;
      } else if (currency === 'USD' && data.bankDetails) {
        // Mostrar instruções para USD
        showSuccess('toasts.plans.bankInstructionsSent');
        // Aqui você pode redirecionar para uma página com instruções detalhadas
        // ou mostrar um modal com os dados bancários
        console.log('Bank details:', data.bankDetails);
      }

    } catch (error: any) {
      showError('toasts.plans.checkoutFailed');
    } finally {
      setIsSubmitting(null);
      setSelectedItemForCurrency(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-popover border-border text-popover-foreground max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">{t('pricingDialog.title')}</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {t('pricingDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="relative py-6">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="flex-none w-full md:w-1/3 pl-4">
                    <div
                      className={cn(
                        "p-6 rounded-lg border bg-secondary flex flex-col h-full relative",
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
                            {!feature.startsWith('👉') && !feature.startsWith('✔') && !feature.includes('Para cada crédito:') && <span className="mt-1">✔</span>}
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
                  </div>
                ))}
                {/* GSC Analysis Card */}
                <div className="flex-none w-full md:w-1/3 pl-4">
                  <div className="p-6 rounded-lg border border-amber-400 bg-secondary flex flex-col h-full relative">
                    <h3 className="text-xl font-bold text-amber-400">{gscService.title}</h3>
                    <p className="mt-2 text-3xl font-extrabold text-amber-300">
                      {gscService.price}
                      <span className="text-base font-medium text-muted-foreground"> {gscService.perAnalysis}</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{gscService.description}</p>
                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-grow">
                      {gscService.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          {!feature.startsWith('👉') && !feature.startsWith('✔') && <span className="mt-1">✔</span>}
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="mt-8 w-full bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.6)] hover:-translate-y-px"
                      disabled={isSubmitting !== null}
                      onClick={handleBuyGSCAnalysis}
                    >
                      {isSubmitting === gscService.serviceId ? <Loader2 className="h-4 w-4 animate-spin" /> : gscService.buyNow}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={scrollPrev} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70 rounded-full hidden md:flex"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={scrollNext} 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70 rounded-full hidden md:flex"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          <DialogFooter>
              <div className="text-xs text-muted-foreground text-center w-full space-y-1">
                <p>{t('pricingDialog.footerNote1')}</p>
                <p>{t('pricingDialog.footerNote2')}</p>
              </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CurrencySelectionDialog
        isOpen={showCurrencyDialog}
        onOpenChange={setShowCurrencyDialog}
        selectedPlan={selectedItemForCurrency?.id || ''}
        onCurrencySelected={handleCurrencySelected}
        isLoading={isSubmitting !== null}
      />
    </>
  );
};

export default PricingDialog;