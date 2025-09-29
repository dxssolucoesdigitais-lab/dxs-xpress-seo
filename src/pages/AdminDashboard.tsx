import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from 'react-i18next';
import UsersTable from '@/components/admin/UsersTable';
import FeedbackViewer from '@/components/admin/FeedbackViewer';

const AdminDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t('admin.dashboard.title')}</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2"> {/* Alterado para 2 colunas */}
          <TabsTrigger value="users">{t('admin.tabs.users')}</TabsTrigger>
          <TabsTrigger value="feedbacks">{t('admin.tabs.feedbacks')}</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <UsersTable />
        </TabsContent>
        <TabsContent value="feedbacks" className="mt-6">
          <FeedbackViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;