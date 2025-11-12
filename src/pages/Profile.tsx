import { useSession } from '@/contexts/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import UsageHistory from '@/components/profile/UsageHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingInfo from '@/components/profile/BillingInfo';
import { useTranslation } from 'react-i18next';
import FeedbackHistory from '@/components/profile/FeedbackHistory';
import { useLocation, useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const Profile = () => {
  const { t } = useTranslation();
  const { user, session } = useSession();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  // Update default values when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.full_name || '' });
    }
  }, [user, profileForm]);

  // Handle payment success/cancellation from Stripe redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment');

    if (paymentStatus === 'success') {
      showSuccess('toasts.plans.checkoutSuccess'); // Assuming you'll add this key to i18n
      navigate(location.pathname, { replace: true }); // Clear query params
    } else if (paymentStatus === 'cancelled') {
      showError('toasts.plans.checkoutCancelled'); // Assuming you'll add this key to i18n
      navigate(location.pathname, { replace: true }); // Clear query params
    }
  }, [location.search, navigate]);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsSubmittingProfile(true);
    const { error } = await supabase
      .from('users')
      .update({ full_name: values.fullName })
      .eq('id', user.id);

    if (error) {
      showError('toasts.profile.updateFailed');
    } else {
      showSuccess('toasts.profile.updateSuccess');
    }
    setIsSubmittingProfile(false);
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmittingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      showError('toasts.password.updateFailed');
    } else {
      showSuccess('toasts.password.updateSuccess');
      passwordForm.reset();
    }
    setIsSubmittingPassword(false);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">{t('profilePage.title')}</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-transparent border border-border p-1 h-auto mb-6">
          <TabsTrigger value="profile">{t('profilePage.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="password">{t('profilePage.tabs.password')}</TabsTrigger>
          <TabsTrigger value="billing">{t('profilePage.tabs.billing')}</TabsTrigger>
          <TabsTrigger value="feedbacks">{t('profilePage.tabs.feedbacks')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="glass-effect border-border text-card-foreground">
            <CardHeader>
              <CardTitle>{t('profilePage.profileDetails.title')}</CardTitle>
              <CardDescription className="text-muted-foreground">{t('profilePage.profileDetails.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('profilePage.profileDetails.email')}</Label>
                  <Input value={session?.user?.email || ''} disabled className="bg-secondary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('profilePage.profileDetails.fullName')}</Label>
                  <Input id="fullName" {...profileForm.register('fullName')} className="bg-transparent border-border" />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-sm text-red-400">{profileForm.formState.errors.fullName.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled={isSubmittingProfile}>
                  {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('profilePage.profileDetails.save')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="glass-effect border-border text-card-foreground">
            <CardHeader>
              <CardTitle>{t('profilePage.changePassword.title')}</CardTitle>
              <CardDescription className="text-muted-foreground">{t('profilePage.changePassword.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('profilePage.changePassword.newPassword')}</Label>
                  <Input id="password" type="password" {...passwordForm.register('password')} className="bg-transparent border-border" />
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-red-400">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled={isSubmittingPassword}>
                  {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('profilePage.changePassword.update')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="grid gap-8">
            <BillingInfo />
            <UsageHistory />
          </div>
        </TabsContent>

        <TabsContent value="feedbacks">
          <FeedbackHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;