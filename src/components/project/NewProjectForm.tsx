import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewProject } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

interface NewProjectFormProps {
  onSubmit: (projectData: Omit<NewProject, 'user_id'>) => Promise<void>;
  isSubmitting: boolean;
}

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onSubmit, isSubmitting }) => {
  const [projectName, setProjectName] = useState('');
  const [productLink, setProductLink] = useState('');
  const [targetCountry, setTargetCountry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !productLink || !targetCountry) {
      // Basic validation
      return;
    }
    onSubmit({ project_name: projectName, product_link: productLink, target_country: targetCountry });
  };

  return (
    <div className="flex items-center justify-center h-full bg-[#0a0a0f]">
      <Card className="w-full max-w-md glass-effect border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Start a New SEO Project</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Provide some details to get started with your SEO content generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., 'Orthopedic Dog Beds Campaign'"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent border-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-link">Product Link</Label>
              <Input
                id="product-link"
                type="url"
                placeholder="https://yourstore.com/products/dog-bed"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                className="bg-transparent border-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-country">Target Country</Label>
              <Input
                id="target-country"
                placeholder="e.g., 'Brazil'"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="bg-transparent border-white/20"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProjectForm;