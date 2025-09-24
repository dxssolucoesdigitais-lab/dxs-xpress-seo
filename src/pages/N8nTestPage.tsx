import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const N8nTestPage = () => {
  // Cole sua nova URL do n8n Cloud aqui!
  const [webhookUrl, setWebhookUrl] = useState('COLE_AQUI_SUA_NOVA_URL_DO_N8N_CLOUD');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testPayload = {
    message: "Oi"
  };

  const handleTest = async () => {
    setIsLoading(true);
    setResponse('');
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      const responseData = await res.json();
      let responseText = "Resposta recebida do webhook inicial do n8n:\n";
      responseText += JSON.stringify(responseData, null, 2);
      responseText += "\n\nAgora, verifique a aba do seu navegador com o webhook.site para ver a 'resposta da AI' que o n8n enviou.";
      setResponse(responseText);

    } catch (error: any) {
      let errorMessage = `A requisição falhou. Verifique se a URL está correta e se o fluxo no n8n está ativo.\n\n`;
      errorMessage += `Erro: ${error.message}\n\n`;
      errorMessage += `Verifique o console do desenvolvedor (F12) para mais detalhes.`;
      setResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">n8n Ping-Pong Test Page</h1>
      <p className="text-muted-foreground mb-6">
        Use esta página para enviar uma mensagem "Oi" para o seu webhook n8n e verificar se ele envia uma "resposta da AI" para o webhook.site.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-effect border-border text-card-foreground">
          <CardHeader>
            <CardTitle>1. Configuração</CardTitle>
            <CardDescription>Verifique a URL do webhook do seu novo fluxo "Ping Pong".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL do Webhook n8n (Input)</Label>
              <Input id="webhookUrl" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Copie a URL do webhook do seu nó "When webhook is called" no n8n e cole aqui.
              </p>
            </div>
            <Button onClick={handleTest} className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar "Oi"
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border text-card-foreground">
          <CardHeader>
            <CardTitle>2. Resultados</CardTitle>
            <CardDescription>Veja a resposta do n8n e verifique o webhook.site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Request Body (Payload Enviado)</Label>
              <Textarea
                readOnly
                value={JSON.stringify(testPayload, null, 2)}
                className="font-mono text-xs h-24 mt-2"
              />
            </div>
            <div>
              <Label>Resposta Imediata do n8n</Label>
              <Textarea
                readOnly
                value={response || 'Clique em "Enviar Oi" para ver a resposta aqui.'}
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