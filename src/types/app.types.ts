export interface PricingTier {
  planId: string;
  name: string;
  price: string;
  credits: number;
  features: string[];
  popular: boolean;
}

export interface GSCService {
  serviceId: string;
  title: string;
  description: string;
  price: string;
  perAnalysis: string;
  features: string[];
  buyNow: string;
}