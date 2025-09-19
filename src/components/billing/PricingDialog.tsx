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
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PricingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const pricingTiers = [
  {
    planId: "basic",
    name: "Basic",
    price: "R$ 79",
    credits: 50,
    features: [
      "Análise da palavra-chave (SERP) no país destino de venda",
      "Criação de categoria e produtos aplicando SEO",
      "Geração de arquivo HTML leve e responsivo",
      "Tradução do projeto e arquivo HTML traduzido para o idioma de destino"
    ],
    popular: false,
  },
  {
    planId: "standard",
    name: "Standard",
    price: "R$ 149",
    credits: 100,
    features: [
      "Tudo do plano Basic",
      "+ Conteúdo para Blog com SEO",
      "+ Otimização do Blog para resultado de buscas da Inteligência Artificial"
    ],
    popular: true,
  },
  {
    planId: "premium",
    name: "Premium",
    price: "R$ 197",
    credits: 250,
    features: [
      "Tudo do plano Standard",
      "+ Legendas para redes sociais com SEO e otimizado para IA",
      "+ Devolutiva do conteúdo gerado",
      "+ Análise de relatórios do Google Search Console"
    ],
    popular: false,
  },
];

const PricingDialog: React.FC<PricingDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string, credits: number) => {
    if (!user) {
      showError("You must be logged in to select a plan.");
      return;
    }
    setIsSubmitting(planId);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          plan_type: planId,
          credits_remaining: credits,
        })
        .eq('id', user.id);

      if (error) throw error;

      showSuccess(`Plano ${planId} ativado com sucesso!`);
      onOpenChange(false);
    } catch (error: any) {
      showError("Falha ao atualizar o plano.");
      console.error("Error updating plan:", error.message);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground max-w-3xl">
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
              <p className="text-sm text-cyan-400 font-semibold mt-1">{tier.credits} {t('pricingDialog.credits')}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="mt-8 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                disabled={isSubmitting !== null || user?.plan_type === tier.planId}
                onClick={() => handleSelectPlan(tier.planId, tier.credits)}
              >
                {isSubmitting === tier.planId ? <Loader2 className="h-4 w-4 animate-spin" /> : (user?.plan_type === tier.planId ? t('pricingDialog.currentPlan') : t('pricingDialog.selectPlan'))}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                {t('pricingDialog.paymentNotice')}
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;