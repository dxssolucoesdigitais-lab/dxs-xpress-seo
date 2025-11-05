import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface CurrencySelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedPlan: string;
  onCurrencySelected: (currency: 'BRL' | 'USD' | 'EUR') => void;
  isLoading?: boolean;
}

const CurrencySelectionDialog: React.FC<CurrencySelectionDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedPlan,
  onCurrencySelected,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Get the plan name for display in the description
  const planName = t(`pricingDialog.tiers.${selectedPlan}.name`, { defaultValue: selectedPlan });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {t('currencyDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {t('currencyDialog.description', { planName })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button
              onClick={() => onCurrencySelected('BRL')}
              disabled={isLoading}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-8 w-8" />
                  <span>BRL - Real Brasileiro</span>
                  <span className="text-sm font-normal">Cartão, PIX, Boleto</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => onCurrencySelected('USD')}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-amber-400 text-amber-400 hover:bg-amber-400/10 font-bold transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Banknote className="h-8 w-8" />
                  <span>USD - Dólar Americano</span>
                  <span className="text-sm font-normal">Transferência Bancária</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => onCurrencySelected('EUR')}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-green-400 text-green-400 hover:bg-green-400/10 font-bold transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Banknote className="h-8 w-8" />
                  <span>EUR - Euro</span>
                  <span className="text-sm font-normal">Transferência Bancária</span>
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>{t('currencyDialog.noteBRL')}</p>
            <p>{t('currencyDialog.noteUSD')}</p>
            <p>{t('currencyDialog.noteEUR')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencySelectionDialog;