import { useMemo } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Workaround for the import issue: define pt-BR translations directly
const ptBR = {
  sign_up: {
    email_label: 'Endereço de e-mail',
    password_label: 'Crie uma senha',
    email_input_placeholder: 'Seu endereço de e-mail',
    password_input_placeholder: 'Sua senha',
    button_label: 'Inscrever-se',
    loading_button_label: 'Inscrevendo-se...',
    social_provider_text: 'Entrar com {{provider}}',
    link_text: 'Não tem uma conta? Inscrever-se',
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
    link_text: 'Já tem uma conta? Entrar',
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
    <div className="flex flex-col justify-center items-center h-screen bg-[#0a0a0f]">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="XpressSEO Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-white">XpressSEO</span>
        </Link>
      </div>
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1a1a1f] rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white">{t('login.welcome')}</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="dark"
          localization={{
            variables: authLocalizationVariables,
          }}
          defaultView="sign_in"
          showLinks={true}
        />
      </div>
    </div>
  );
};

export default Login;