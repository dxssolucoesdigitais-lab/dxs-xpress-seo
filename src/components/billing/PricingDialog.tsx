import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import CurrencySelectionDialog from './CurrencySelectionDialog';

// ... (código existente mantido) ...

const PricingDialog: React.FC<PricingDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [selectedPlanForCurrency, setSelectedPlanForCurrency] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanForCurrency(planId);
    setShowCurrencyDialog(true);
  };

  const handleCurrencySelected = async (currency: 'BRL' | 'USD') => {
    if (!user || !selectedPlanForCurrency) return;
    
    setIsSubmitting(selectedPlanForCurrency);
    setShowCurrencyDialog(false);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          planId: selectedPlanForCurrency,
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
      setSelectedPlanForCurrency(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {/* ... (código existente mantido) ... */}
      </Dialog>

      <CurrencySelectionDialog
        isOpen={showCurrencyDialog}
        onOpenChange={setShowCurrencyDialog}
        selectedPlan={selectedPlanForCurrency || ''}
        onCurrencySelected={handleCurrencySelected}
        isLoading={isSubmitting !== null}
      />
    </>
  );
};

export default PricingDialog;