
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, FileText, MessageSquare, Settings, Download, ArrowRight } from 'lucide-react';

const tutorialSteps = [
  {
    id: 1,
    title: '👋 Welcome to DHA Digital Services',
    description: 'Generate official South African government documents with AI assistance',
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <p>This platform provides:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>✅ 23 Official DHA Document Types</li>
          <li>✅ AI-Powered Document Assistant</li>
          <li>✅ Real-time Document Generation</li>
          <li>✅ Government API Integration</li>
        </ul>
      </div>
    )
  },
  {
    id: 2,
    title: '📄 Generate Documents',
    description: 'How to generate official documents',
    icon: FileText,
    content: (
      <div className="space-y-4">
        <p className="font-semibold">Steps to Generate:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "Documents" tab at bottom</li>
          <li>Select document type (e.g., Birth Certificate, Passport)</li>
          <li>Fill in required details</li>
          <li>Click "Generate Document"</li>
          <li>PDF will download automatically</li>
        </ol>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">💡 Tip: Use the OCR Auto-fill feature to extract data from uploaded documents!</p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: '💬 AI Chat Assistant',
    description: 'Get help from our AI assistant',
    icon: MessageSquare,
    content: (
      <div className="space-y-4">
        <p className="font-semibold">Using AI Chat:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "AI Chat" tab at bottom</li>
          <li>Type your question (e.g., "Help me apply for a passport")</li>
          <li>AI responds with step-by-step guidance</li>
          <li>Available in all 11 SA languages</li>
        </ol>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">✨ The AI can explain requirements, fill forms, and verify documents</p>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: '📥 Download Your Documents',
    description: 'Where to find your generated documents',
    icon: Download,
    content: (
      <div className="space-y-4">
        <p className="font-semibold">Finding Downloads:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Documents download automatically to your browser's download folder</li>
          <li>Look for files named like: <code>birth_certificate_ABC123.pdf</code></li>
          <li>On mobile: Check "Downloads" folder in Files app</li>
          <li>On desktop: Check browser's download bar at bottom</li>
        </ul>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-800">📱 Mobile: Tap the download notification to open the PDF</p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: '⚙️ Admin Features',
    description: 'Access advanced system controls',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="font-semibold">Admin Dashboard:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Click "Admin" tab for system overview</li>
          <li>View all generated documents</li>
          <li>Monitor system health</li>
          <li>Configure integrations</li>
          <li>Access unlimited AI features</li>
        </ul>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-purple-800">🔐 Admin access: Use credentials from setup</p>
        </div>
      </div>
    )
  }
];

export function FirstTimeUserTutorial() {
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

  const handleComplete = () => {
    localStorage.setItem('dha_tutorial_completed', 'true');
    setOpen(false);
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-blue-600" />
            <div>
              <DialogTitle className="text-2xl">{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {step.content}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Skip Tutorial
            </Button>
            <Button onClick={handleNext}>
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          Step {currentStep + 1} of {tutorialSteps.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}
