import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyDashboard = () => {
  return (
    <div className="text-center py-16 sm:py-24">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">
        <Rocket className="h-8 w-8 text-cyan-400" />
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">No projects yet</h3>
      <p className="mt-2 text-base text-gray-400">
        Get started by creating your first SEO project.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
            <PlusCircle className="-ml-0.5 mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyDashboard;