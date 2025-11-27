import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Project } from '@/types/database.types';
import { useProjects } from '@/hooks/useProjects';

interface RenameProjectDialogProps {
  project: Project | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const RenameProjectDialog: React.FC<RenameProjectDialogProps> = ({ project, isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { updateProjectName } = useProjects();
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setNewName(project.project_name);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newName.trim() || newName.trim() === project.project_name) return;

    setIsSubmitting(true);
    const success = await updateProjectName(project.id, newName.trim());
    if (success) {
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('renameDialog.title')}</DialogTitle>
            <DialogDescription>{t('renameDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="new-project-name">{t('renameDialog.newNameLabel')}</Label>
              <Input
                id="new-project-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-transparent border-border"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('renameDialog.cancel')}
            </Button>
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled={isSubmitting || !newName.trim() || newName.trim() === project?.project_name}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('renameDialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameProjectDialog;