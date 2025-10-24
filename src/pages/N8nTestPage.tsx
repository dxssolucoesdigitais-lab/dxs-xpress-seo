import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { useSession } from '@/contexts/SessionContext'; // Import useSession

const N8nTestPage = () => {
  const { session } = useSession();
  const [projectId, setProjectId] = useState('');
  const [userMessage, setUserMessage] = useState('Olá n8n, este é um teste!');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!session?.user) {
      setResponse('Erro: Usuário não autenticado. Faça login primeiro.');
      return;
    }

    setIsLoading(true);
    setResponse('');
    try {
      const payload = {
        projectId: projectId || null, // Pode ser null para iniciar um novo projeto
        userMessage: userMessage,
      };

      const { data, error } = await supabase.functions.invoke('trigger-step', {
        body: payload,
      });

      if (error) {
        let errorMessage = `A requisição falhou. Verifique se a Edge Function está ativa e se o fluxo no n8n está ativo.\n\n`;
        errorMessage += `Erro: ${error.message}\n\n`;
        if (error.context?.response?.status === 402) {
          errorMessage += `(Status 402: Créditos insuficientes ou ação bloqueada pelo gatekeeper de créditos.)\n`;
        }
        errorMessage += `Verifique o console do desenvolvedor (F12) para mais detalhes.`;
        setResponse(errorMessage);
        console.error('Erro ao invocar trigger-step:', error);
        return;
      }

      let responseText = "Resposta recebida da Edge Function trigger-step:\n";
      responseText += JSON.stringify(data, null, 2);
      responseText += "\n\nAgora, verifique a aba do seu navegador com o webhook.site (ou o seu n8n) para ver o payload completo que a Edge Function enviou.";
      setResponse(responseText);

    } catch (error: any) {
      let errorMessage = `Ocorreu um erro inesperado: ${error.message}\n\n`;
      errorMessage += `Verifique o console do desenvolvedor (F12) para mais detalhes.`;
      setResponse(errorMessage);
      console.error('Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">n8n Trigger-Step Test Page</h1>
      <p className="text-muted-foreground mb-6">
        Use esta página para testar a Edge Function `trigger-step` e verificar a comunicação com seu workflow n8n.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-effect border-border text-card-foreground">
          <CardHeader>
            <CardTitle>1. Configuração da Requisição</CardTitle>
            <CardDescription>Defina o ID do projeto (opcional) e a mensagem do usuário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">ID do Projeto (Opcional)</Label>
              <Input 
                id="projectId" 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)} 
                placeholder="Deixe em branco para iniciar um novo projeto"
              />
              <p className="text-xs text-muted-foreground">
                Se fornecido, a mensagem será enviada para este projeto. Se vazio, um novo projeto será criado.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userMessage">Mensagem do Usuário</Label>
              <Textarea
                id="userMessage"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="font-mono text-xs h-24 mt-2"
              />
              <p className="text-xs text-muted-foreground">
                Esta mensagem será enviada para o n8n.
              </p>
            </div>
            <Button onClick={handleTest} className="w-full" disabled={isLoading || !session?.user}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {session?.user ? 'Enviar para trigger-step' : 'Faça login para testar'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border text-card-foreground">
          <CardHeader>
            <CardTitle>2. Resposta da Edge Function</CardTitle>
            <CardDescription>Veja a resposta imediata da Edge Function `trigger-step`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Resposta da Edge Function</Label>
              <Textarea
                readOnly
                value={response || 'Clique em "Enviar para trigger-step" para ver a resposta aqui.'}
                className="font-mono text-xs h-48 mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default N8nTestPage;