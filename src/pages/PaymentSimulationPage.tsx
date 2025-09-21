import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const PaymentSimulationPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando seu pagamento...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('status');
    const userId = params.get('userId');
    const planId = params.get('planId');

    const timer = setTimeout(() => {
      if (paymentStatus === 'success' && userId && planId) {
        setStatus('success');
        setMessage(`Pagamento para o plano '${planId}' foi bem-sucedido! Você será redirecionado em breve.`);
        
        // Em uma aplicação real, o webhook do n8n já teria atualizado o plano do usuário.
        // Isto é apenas para simular a experiência do usuário.
        console.log("SIMULAÇÃO: Webhook do gateway de pagamento seria enviado para o n8n agora.");
        console.log(`SIMULAÇÃO: n8n receberia: { userId: ${userId}, planId: ${planId} }`);
        console.log("SIMULAÇÃO: n8n então atualizaria o plano do usuário no banco de dados.");

        setTimeout(() => navigate('/profile'), 4000);
      } else {
        setStatus('error');
        setMessage('Houve um erro com seu pagamento. Por favor, tente novamente.');
        setTimeout(() => navigate('/profile'), 4000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      {status === 'processing' && <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />}
      {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
      {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
      <h1 className="text-2xl font-bold mt-6">{
        status === 'processing' ? 'Processando...' :
        status === 'success' ? 'Sucesso!' : 'Erro'
      }</h1>
      <p className="mt-2 text-lg text-muted-foreground">{message}</p>
      {status !== 'processing' && (
         <Button onClick={() => navigate('/profile')} className="mt-8">
            Retornar ao Perfil
        </Button>
      )}
    </div>
  );
};

export default PaymentSimulationPage;