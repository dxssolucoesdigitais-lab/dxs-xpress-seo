import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewProject } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

interface NewProjectFormProps {
  onSubmit: (projectData: Omit<NewProject, 'user_id'>) => Promise<void>;
  isSubmitting: boolean;
}

const countries = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "Brazil", label: "Brazil" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
];

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onSubmit, isSubmitting }) => {
  const [projectName, setProjectName] = useState('');
  const [productLink, setProductLink] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !productLink || !targetCountry || !targetAudience) {
      // Basic validation
      return;
    }
    onSubmit({ 
      project_name: projectName, 
      product_link: productLink, 
      target_country: targetCountry,
      target_audience: targetAudience
    });
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
              <Select onValueChange={setTargetCountry} value={targetCountry}>
                <SelectTrigger id="target-country" className="w-full bg-transparent border-white/20">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1f] border-white/20 text-white">
                  {countries.map(country => (
                    <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Textarea
                id="target-audience"
                placeholder="e.g., 'Dog owners in urban areas, aged 30-50, who treat their pets like family and are willing to spend more for quality and comfort.'"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
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