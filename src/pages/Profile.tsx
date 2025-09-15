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
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import UsageHistory from '@/components/profile/UsageHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingInfo from '@/components/profile/BillingInfo';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const Profile = () => {
  const { user, session } = useSession();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsSubmittingProfile(true);
    const { error } = await supabase
      .from('users')
      .update({ full_name: values.fullName })
      .eq('id', user.id);

    if (error) {
      showError('Failed to update profile.');
    } else {
      showSuccess('Profile updated successfully!');
    }
    setIsSubmittingProfile(false);
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmittingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      showError('Failed to update password.');
    } else {
      showSuccess('Password updated successfully!');
      passwordForm.reset();
    }
    setIsSubmittingPassword(false);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-transparent border border-white/10 p-1 h-auto mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="billing">Billing & Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="glass-effect border-white/10 text-white">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription className="text-gray-400">Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={session?.user?.email || ''} disabled className="bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...profileForm.register('fullName')} className="bg-transparent border-white/20" />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-sm text-red-400">{profileForm.formState.errors.fullName.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold" disabled={isSubmittingProfile}>
                  {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="glass-effect border-white/10 text-white">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription className="text-gray-400">Enter a new password for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" {...passwordForm.register('password')} className="bg-transparent border-white/20" />
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-red-400">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold" disabled={isSubmittingPassword}>
                  {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
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
      </Tabs>
    </div>
  );
};

export default Profile;