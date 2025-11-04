
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TutorialHelper() {
  const showTutorial = () => {
    window.dispatchEvent(new Event('showTutorial'));
  };

  const tutorials = [
    { id: 'full', name: 'Complete Tutorial', step: 0 },
    { id: 'documents', name: 'Document Generation Guide', step: 1 },
    { id: 'ai', name: 'AI Assistant Guide', step: 2 },
    { id: 'download', name: 'Download Instructions', step: 3 }
  ];

  const showSpecificTutorial = (step: number) => {
    localStorage.setItem('dha_tutorial_step', step.toString());
    window.dispatchEvent(new Event('showTutorial'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={showTutorial}>
          📚 Show Complete Tutorial
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => showSpecificTutorial(1)}>
          📄 Document Generation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => showSpecificTutorial(2)}>
          💬 AI Assistant
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => showSpecificTutorial(3)}>
          📥 Download Help
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
