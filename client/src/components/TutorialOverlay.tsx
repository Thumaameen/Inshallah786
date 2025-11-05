
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, MessageSquare, Shield, Download, 
  CheckCircle, ArrowRight, ArrowLeft, X 
} from 'lucide-react';

const tutorialSteps = [
  {
    id: 1,
    title: '🏛️ Welcome to DHA Digital Services',
    description: 'Official South African government document platform',
    content: (
      <div className="space-y-4">
        <p className="text-lg">This platform provides:</p>
        <ul className="space-y-2 text-left">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>23 Official DHA Document Types</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>AI-Powered Assistant</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Real-time Document Generation</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Secure Government Integration</span>
          </li>
        </ul>
      </div>
    ),
    icon: Shield
  },
  {
    id: 2,
    title: '📄 Generate Documents',
    description: 'How to create official documents',
    content: (
      <div className="space-y-4">
        <p className="font-semibold text-lg">Step-by-Step Guide:</p>
        <ol className="list-decimal list-inside space-y-3 text-left">
          <li>Navigate to <strong>"Documents"</strong> tab (bottom navigation)</li>
          <li>Select your document type (e.g., Birth Certificate, Passport)</li>
          <li>Fill in all required information accurately</li>
          <li>Click <strong>"Generate & Download"</strong> button</li>
          <li>PDF will download automatically to your device</li>
        </ol>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Pro Tip:</strong> Use "Auto-fill from Passport" to extract data automatically!
            </p>
          </CardContent>
        </Card>
      </div>
    ),
    icon: FileText
  },
  {
    id: 3,
    title: '💬 AI Chat Assistant',
    description: 'Get instant help and guidance',
    content: (
      <div className="space-y-4">
        <p className="font-semibold text-lg">Using the AI Assistant:</p>
        <ol className="list-decimal list-inside space-y-3 text-left">
          <li>Click <strong>"AI Chat"</strong> tab at the bottom</li>
          <li>Type your question (e.g., "How do I apply for a passport?")</li>
          <li>AI responds with detailed, step-by-step guidance</li>
          <li>Available in all 11 South African languages</li>
        </ol>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <p className="text-sm text-green-800">
              ✨ The AI can explain requirements, help fill forms, and verify documents
            </p>
          </CardContent>
        </Card>
      </div>
    ),
    icon: MessageSquare
  },
  {
    id: 4,
    title: '📥 Download Your Documents',
    description: 'Finding your generated files',
    content: (
      <div className="space-y-4">
        <p className="font-semibold text-lg">Download Locations:</p>
        
        <div className="space-y-3 text-left">
          <div>
            <Badge className="mb-2">iOS (iPhone/iPad)</Badge>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Tap the document preview</li>
              <li>Tap Share icon (square with arrow)</li>
              <li>Choose "Save to Files"</li>
              <li>Select your preferred location</li>
            </ol>
          </div>
          
          <div>
            <Badge className="mb-2">Android</Badge>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Check your notification bar</li>
              <li>Open "Files" app → "Downloads" folder</li>
              <li>Or use any file manager app</li>
            </ol>
          </div>
          
          <div>
            <Badge className="mb-2">Desktop</Badge>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Check your Downloads folder</li>
              <li>Look for files named: <code className="text-xs">document_type_timestamp.pdf</code></li>
            </ol>
          </div>
        </div>
      </div>
    ),
    icon: Download
  }
];

export function TutorialOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('dha_tutorial_completed');
    if (!hasSeenTutorial) {
      setIsOpen(true);
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
    setCompleted(true);
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('dha_tutorial_completed', 'true');
    setIsOpen(false);
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-6 w-6 text-primary" />
              {step.title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </DialogHeader>

        <div className="py-6">
          {step.content}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={handleNext}>
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

        <div className="text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {tutorialSteps.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}
