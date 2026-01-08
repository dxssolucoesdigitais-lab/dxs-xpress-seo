import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: 'signUpForm.validation.fullNameMin' }),
  email: z.string().email({ message: 'signUpForm.validation.emailInvalid' }),
  password: z.string().min(6, { message: 'signUpForm.validation.passwordMin' }),
});

type SignUpFormInputs = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onBackToSignIn: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onBackToSignIn }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignUpFormInputs) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        // Tratamento de erros específicos
        if (error.message.includes('Email rate limit exceeded')) {
          showError('toasts.emailRateLimitExceeded');
        } else if (error.message.includes('Error sending confirmation email')) {
          // Este erro é de infraestrutura, mas podemos dar uma dica ao usuário
          showError('toasts.genericError', { message: t('toasts.plans.checkoutFailed') + ' (Infraestrutura de E-mail)' });
        } else {
          showError(error.message); // Erros Supabase genéricos
        }
        throw error;
      }

      if (data.user) {
        showSuccess('signUpForm.success');
        onBackToSignIn(); // Go back to sign in to allow user to log in
      }
    } catch (error: any) {
      console.error('Error during sign up:', error.message);
      // O toast de erro já foi exibido no bloco try/catch
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t('signUpForm.fullNameLabel')}</Label>
        <Input
          id="fullName"
          type="text"
          placeholder={t('signUpForm.fullNamePlaceholder')}
          className="bg-transparent border-border"
          {...form.register('fullName')}
        />
        {form.formState.errors.fullName && (
          <p className="text-sm text-red-400">{t(form.formState.errors.fullName.message)}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t('signUpForm.emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('signUpForm.emailPlaceholder')}
          className="bg-transparent border-border"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-400">{t(form.formState.errors.email.message)}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t('signUpForm.passwordLabel')}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t('signUpForm.passwordPlaceholder')}
          className="bg-transparent border-border"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-400">{t(form.formState.errors.password.message)}</p>
        )}
      </div>
      <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('signUpForm.signUpButton')}
      </Button>
      <Button type="button" variant="link" onClick={onBackToSignIn} className="w-full text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('signUpForm.backToSignIn')}
      </Button>
    </form>
  );
};

export default SignUpForm;