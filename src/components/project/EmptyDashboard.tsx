import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyDashboard = () => {
  return (
    <div className="flex items-center justify-center py-16 sm:py-24">
      <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl max-w-lg mx-auto glass-effect">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 animate-pulse-glow">
          <Rocket className="h-8 w-8 text-cyan-400" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">Ready to Launch Your Next Project?</h3>
        <p className="mt-2 text-base text-gray-400">
          Your dashboard is empty, but it's full of potential. Create your first project to start generating powerful SEO content with AI.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/20">
              <PlusCircle className="-ml-0.5 mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmptyDashboard;