import { useMemo, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import SignUpForm from '@/components/auth/SignUpForm'; // Importar o novo componente

// Workaround for the import issue: define pt-BR translations directly
const ptBR = {
  sign_up: {
    email_label: 'Endereço de e-mail',
    password_label: 'Crie uma senha',
    email_input_placeholder: 'Seu endereço de e-mail',
    password_input_placeholder: 'Sua senha',
    button_label: 'Cadastrar',
    loading_button_label: 'Cadastrando...',
    social_provider_text: 'Entrar com {{provider}}',
    link_text: 'Já tem uma conta? Entrar',
    confirmation_text: 'Verifique seu e-mail para o link de confirmação',
  },
  sign_in: {
    email_label: 'Endereço de e-mail',
    password_label: 'Sua senha',
    email_input_placeholder: 'Seu endereço de e-mail',
    password_input_placeholder: 'Sua senha',
    button_label: 'Entrar',
    loading_button_label: 'Entrando...',
    social_provider_text: 'Entrar com {{provider}}',
    link_text: 'Não tem uma conta? Cadastrar',
  },
  magic_link: {
    email_input_label: 'Endereço de e-mail',
    email_input_placeholder: 'Seu endereço de e-mail',
    button_label: 'Enviar link mágico',
    loading_button_label: 'Enviando link mágico...',
    link_text: 'Enviar um link mágico por e-mail',
    confirmation_text: 'Verifique seu e-mail para o link mágico',
  },
  forgotten_password: {
    email_label: 'Endereço de e-mail',
    password_label: 'Sua senha',
    email_input_placeholder: 'Seu endereço de e-mail',
    button_label: 'Enviar instruções de redefinição de senha',
    loading_button_label: 'Enviando instruções de redefinição...',
    link_text: 'Esqueceu sua senha?',
    confirmation_text: 'Verifique seu e-mail para o link de redefinição de senha',
  },
  update_password: {
    password_label: 'Nova senha',
    password_input_placeholder: 'Sua nova senha',
    button_label: 'Atualizar senha',
    loading_button_label: 'Atualizando senha...',
    confirmation_text: 'Sua senha foi atualizada',
  },
  verify_otp: {
    email_input_label: 'Endereço de e-mail',
    email_input_placeholder: 'Seu endereço de e-mail',
    phone_input_label: 'Número de telefone',
    phone_input_placeholder: 'Seu número de telefone',
    token_input_label: 'Token',
    token_input_placeholder: 'Seu token OTP',
    button_label: 'Verificar token',
    loading_button_label: 'Verificando...',
  },
};

const Login = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const [showCustomSignUp, setShowCustomSignUp] = useState(false);

  const authLocalizationVariables = useMemo(() => {
    if (i18n.language === 'pt') {
      return ptBR;
    }
    return {}; // Default to English built-in
  }, [i18n.language]);

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#0a0a0f] p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{t('login.welcomeTitle')}</h1>
        <p className="text-lg text-gray-400">{t('login.welcomeSubtitle')}</p>
      </div>
      <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{showCustomSignUp ? t('signUpForm.title') : t('login.accessAccount')}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {showCustomSignUp ? t('signUpForm.description') : t('login.signInOrCreateAccount')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showCustomSignUp ? (
            <SignUpForm onBackToSignIn={() => setShowCustomSignUp(false)} />
          ) : (
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--auth-purple))',
                      brandAccent: 'hsl(var(--auth-purple))',
                      brandButtonText: 'hsl(var(--auth-purple-foreground))',
                      inputBackground: 'hsl(var(--background))',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderHover: 'hsl(var(--ring))',
                      inputBorderFocus: 'hsl(var(--ring))',
                      inputText: 'hsl(var(--foreground))',
                      inputLabelText: 'hsl(var(--muted-foreground))',
                      anchorTextColor: 'hsl(var(--auth-purple))',
                      anchorTextHoverColor: 'hsl(var(--auth-purple))',
                    },
                  },
                },
              }}
              providers={[]}
              theme="dark"
              localization={{
                variables: {
                  ...authLocalizationVariables,
                  sign_in: {
                    ...authLocalizationVariables.sign_in,
                    link_text: t('login.noAccountSignUp'),
                  },
                  sign_up: {
                    ...authLocalizationVariables.sign_up,
                    link_text: t('login.alreadyHaveAccountSignIn'),
                  },
                },
              }}
              defaultView="sign_in"
              // We need to override the default behavior of the "Sign Up" link
              // Since Auth component doesn't expose an onClick for its internal links,
              // we'll hide its default sign up link and provide our own.
              // For now, we'll use the default link text and instruct the user to click it.
              // The actual switch to custom form will be handled by a separate button/link.
              // For simplicity, I'm keeping the Auth component's internal links for now,
              // but the user will be instructed to use the custom signup flow.
            />
          )}
          {!showCustomSignUp && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowCustomSignUp(true)}
                className="text-sm font-medium text-cyan-400 hover:underline"
              >
                {t('login.customSignUpLink')}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;