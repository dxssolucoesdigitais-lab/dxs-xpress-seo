import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const projectSchema = z.object({
  projectName: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  productLink: z.string().url({ message: "Please enter a valid URL." }),
  targetCountry: z.string().min(2, { message: "Target country is required." }),
  targetAudience: z.string().min(10, { message: "Target audience description must be at least 10 characters." }),
});

const NewProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: '',
      productLink: '',
      targetCountry: '',
      targetAudience: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    setIsSubmitting(true);
    const newProject = await createProject({
      project_name: values.projectName,
      product_link: values.productLink,
      target_country: values.targetCountry,
      target_audience: values.targetAudience,
    });

    if (newProject) {
      navigate(`/project/${newProject.id}`);
    } else {
      // If creation fails, stay on the page but stop loading
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-full">
      <Card className="w-full glass-effect border-white/10 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 animate-pulse-glow mb-4">
            <Rocket className="h-8 w-8 text-cyan-400" />
          </div>
          <CardTitle className="text-2xl">{t('newProjectPage.title')}</CardTitle>
          <CardDescription className="text-gray-400">{t('newProjectPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newProjectPage.projectName.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('newProjectPage.projectName.placeholder')} {...field} className="bg-transparent border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newProjectPage.productLink.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} className="bg-transparent border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newProjectPage.targetCountry.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('newProjectPage.targetCountry.placeholder')} {...field} className="bg-transparent border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newProjectPage.targetAudience.label')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('newProjectPage.targetAudience.placeholder')} {...field} className="bg-transparent border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('newProjectPage.cta')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProject;