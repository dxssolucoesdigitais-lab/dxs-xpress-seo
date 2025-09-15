import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface BuyCreditsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const pricingTiers = [
  {
    name: "Starter Pack",
    price: "$10",
    credits: 50,
    features: ["50 Credits", "Standard AI model", "Email support"],
  },
  {
    name: "Pro Pack",
    price: "$25",
    credits: 150,
    features: ["150 Credits", "Advanced AI model", "Priority support"],
    popular: true,
  },
  {
    name: "Agency Pack",
    price: "$50",
    credits: 400,
    features: ["400 Credits", "Best AI model", "Dedicated support"],
  },
];

const BuyCreditsDialog: React.FC<BuyCreditsDialogProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1f] border-white/20 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Get More Credits</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Choose a credit pack that fits your needs. Each AI generation step costs 1 credit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-6 rounded-lg border ${
                tier.popular ? "border-cyan-400" : "border-white/20"
              } bg-black/20 flex flex-col relative`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-cyan-400 text-black px-3 py-1 text-xs font-bold rounded-full">
                  POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">
                {tier.price}
                <span className="text-base font-medium text-gray-400"> / one-time</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-300 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold" disabled>
                Go to Checkout
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
            <p className="text-xs text-gray-500 text-center w-full">
                Payment processing is not yet implemented. This is a demonstration.
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsDialog;