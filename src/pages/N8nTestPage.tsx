import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const N8nTestPage = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://192.168.0.216:5678/webhook-test/saas-seo-start');
  const [projectId, setProjectId] = useState('test-project-123');
  const [userId, setUserId] = useState('test-user-456');
  const [planType, setPlanType] = useState('premium');
  const [currentStep, setCurrentStep] = useState(1);
  const [productLink, setProductLink] = useState('https://www.examplestore.com/product/widget');
  
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testPayload = {
    projectId,
    userId,
    planType,
    currentStep,
    projectData: {
      id: projectId,
      user_id: userId,
      project_name: "Test Project from UI",
      product_link: productLink,
      target_country: "BR",
      target_audience: "Tech enthusiasts",
      current_step: currentStep,
      status: 'in_progress',
    }
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
      setResponse(JSON.stringify(responseData, null, 2));

    } catch (error: any) {
      let errorMessage = `Request failed. This is expected if your n8n instance is using a self-signed certificate (HTTPS on a local IP) or if CORS is not configured.\n\n`;
      errorMessage += `Please check your browser's developer console (F12) for the specific error message (e.g., CORS policy, NET::ERR_CERT_AUTHORITY_INVALID).\n\n`;
      errorMessage += `Error caught: ${error.message}`;
      setResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">n8n Workflow Test Page</h1>
      <p className="text-muted-foreground mb-6">
        Use this page to send a test request directly from your browser to your local n8n webhook. This bypasses Supabase and helps confirm your n8n workflow is receiving data correctly.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-effect border-border text-card-foreground">
          <CardHeader>
            <CardTitle>1. Configuration</CardTitle>
            <CardDescription>Set the webhook URL and payload data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">n8n Webhook URL</Label>
              <Input id="webhookUrl" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input id="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="productLink">Product Link</Label>
              <Input id="productLink" value={productLink} onChange={(e) => setProductLink(e.target.value)} />
            </div>
            <Button onClick={handleTest} className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Request
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border text-card-foreground">
          <CardHeader>
            <CardTitle>2. Request & Response</CardTitle>
            <CardDescription>Review the data sent and the response received.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Request Body (Payload)</Label>
              <Textarea
                readOnly
                value={JSON.stringify(testPayload, null, 2)}
                className="font-mono text-xs h-48 mt-2"
              />
            </div>
            <div>
              <Label>Response from n8n</Label>
              <Textarea
                readOnly
                value={response || 'Click "Send Test Request" to see the response here.'}
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