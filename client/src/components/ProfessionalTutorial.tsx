
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, FileText, MessageSquare, Download, Settings } from 'lucide-react';

const tutorialSteps = [
  {
    id: 1,
    title: 'Welcome to DHA Digital Services',
    description: 'Professional document generation platform',
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="text-base">Generate official South African government documents with ease:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>23 official DHA document types</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>AI-powered document assistant</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Real-time document generation</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Secure government API integration</span>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 2,
    title: 'Generate Documents',
    description: 'Create official documents in minutes',
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">How to generate documents:</p>
        <ol className="list-decimal list-inside space-y-2 pl-2">
          <li>Navigate to the Documents tab</li>
          <li>Select your document type</li>
          <li>Fill in required information</li>
          <li>Click "Generate Document"</li>
          <li>Download your PDF automatically</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Use the OCR feature to auto-fill from existing documents
          </p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'AI Assistant',
    description: 'Get instant help and guidance',
    icon: MessageSquare,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">Using the AI assistant:</p>
        <ol className="list-decimal list-inside space-y-2 pl-2">
          <li>Click the AI Chat tab</li>
          <li>Type your question or request</li>
          <li>Receive instant guidance</li>
          <li>Available in all 11 SA languages</li>
        </ol>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-green-900">
            The AI can explain requirements, help fill forms, and verify documents
          </p>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Download Documents',
    description: 'Access your generated files',
    icon: Download,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">Finding your downloads:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-3">
            <p className="font-medium text-sm">iPhone/iPad:</p>
            <p className="text-sm mt-1">Tap document → Share icon → Save to Files</p>
          </div>
          <div className="border-l-4 border-green-500 pl-3">
            <p className="font-medium text-sm">Android:</p>
            <p className="text-sm mt-1">Check Downloads folder in Files app</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-3">
            <p className="font-medium text-sm">Desktop:</p>
            <p className="text-sm mt-1">Check your Downloads folder</p>
          </div>
        </div>
      </div>
    )
  }
];

export function ProfessionalTutorial() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('dha_tutorial_completed');
    if (!hasSeenTutorial) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('dha_tutorial_completed', 'true');
    setOpen(false);
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">{step.title}</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {step.content}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-1.5">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-600 w-8' 
                    : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} className="min-w-24">
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="min-w-24 bg-blue-600 hover:bg-blue-700">
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 border-t pt-3">
          Step {currentStep + 1} of {tutorialSteps.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}
