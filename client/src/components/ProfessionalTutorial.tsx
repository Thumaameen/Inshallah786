
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, FileText, MessageSquare, Download, Settings, Shield, Upload, Eye, AlertTriangle } from 'lucide-react';

const tutorialSteps = [
  {
    id: 1,
    title: 'Welcome to DHA Digital Services Platform',
    description: 'Your complete guide to South African government document generation',
    icon: Shield,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="text-base font-medium">This platform is your official gateway to DHA services. Here's what you can do:</p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>23 Official Document Types:</strong> Generate Birth Certificates, ID Documents, Passports, Marriage Certificates, Death Certificates, and more - all with official DHA formatting and security features.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>AI-Powered Assistant:</strong> Get real-time help in all 11 South African official languages. The AI can explain requirements, guide you through forms, and answer questions about document processes.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Instant Document Generation:</strong> Fill in forms and receive professionally formatted PDF documents immediately - no waiting, no queues.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Government Integration:</strong> Connected to SAPS, CIPC, NPR, and other official databases for verification and authentication.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>OCR Auto-Fill:</strong> Upload existing documents and automatically extract information to fill forms - saves time and reduces errors.
            </div>
          </li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Platform Features:</strong> Biometric verification, fraud detection, blockchain security, real-time monitoring, and 24/7 availability.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Understanding the Navigation',
    description: 'Learn how to navigate the platform effectively',
    icon: Settings,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">The platform has a bottom navigation bar (mobile) or side menu (desktop) with these tabs:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-semibold text-blue-900">📄 Documents Tab</p>
            <p className="text-sm mt-1">Access all 23 document types, fill forms, and generate PDFs. This is your main workspace for creating official documents.</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="font-semibold text-green-900">💬 AI Chat Tab</p>
            <p className="text-sm mt-1">Talk to the AI assistant for help, guidance, translations, and step-by-step instructions. Available in all SA languages.</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="font-semibold text-purple-900">⚙️ Admin Tab</p>
            <p className="text-sm mt-1">Monitor system health, view document history, manage settings, and access advanced features (requires admin login).</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <p className="font-semibold text-orange-900">🔍 Verify Tab</p>
            <p className="text-sm mt-1">Upload and verify existing documents for authenticity using AI and government database checks.</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-yellow-900">
            <strong>💡 Quick Tip:</strong> On mobile, swipe left/right between tabs. On desktop, click the icons on the left sidebar.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Document Generation - Complete Guide',
    description: 'Step-by-step instructions for creating documents',
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">Follow these detailed steps to generate any document:</p>
        <ol className="list-decimal list-inside space-y-3 pl-2">
          <li className="pl-2">
            <strong>Navigate to Documents:</strong> Tap/click the "Documents" tab at the bottom (mobile) or left side (desktop).
          </li>
          <li className="pl-2">
            <strong>Choose Document Type:</strong> Scroll through the list and select your document (e.g., "Birth Certificate", "ID Document", "Passport Application").
          </li>
          <li className="pl-2">
            <strong>Fill Required Fields:</strong> Complete all fields marked with red asterisks (*). These are mandatory for document generation.
            <ul className="list-disc list-inside pl-6 mt-2 space-y-1 text-sm">
              <li>Personal details: Full names, ID number, date of birth</li>
              <li>Address information: Street, city, postal code</li>
              <li>Document-specific data: Marriage date, deceased info, etc.</li>
            </ul>
          </li>
          <li className="pl-2">
            <strong>Use Auto-Fill (Optional):</strong> Click "Auto-fill from Passport" or "Upload Document" to extract data automatically using OCR technology.
          </li>
          <li className="pl-2">
            <strong>Review Information:</strong> Double-check all entries for accuracy. Click "Preview" to see how the document will look.
          </li>
          <li className="pl-2">
            <strong>Generate Document:</strong> Click the green "Generate & Download" button. The system will:
            <ul className="list-disc list-inside pl-6 mt-2 space-y-1 text-sm">
              <li>Validate all information</li>
              <li>Apply DHA formatting and security features</li>
              <li>Generate a professional PDF</li>
              <li>Automatically start downloading to your device</li>
            </ul>
          </li>
        </ol>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-green-900">
            <strong>✨ Pro Features:</strong>
          </p>
          <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
            <li>Save drafts to continue later</li>
            <li>Duplicate previous applications</li>
            <li>Batch generate multiple documents</li>
            <li>Export to different formats (PDF, PNG, DOCX)</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'OCR Auto-Fill Feature',
    description: 'Automatically extract data from existing documents',
    icon: Upload,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">The OCR (Optical Character Recognition) feature saves time by automatically reading your documents:</p>
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-semibold text-blue-900 mb-2">📸 Supported Documents:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>South African ID Books and Smart Cards</li>
              <li>Passports (SA and international)</li>
              <li>Birth Certificates</li>
              <li>Driver's Licenses</li>
              <li>Marriage Certificates</li>
            </ul>
          </div>
          <p className="font-semibold">How to Use OCR:</p>
          <ol className="list-decimal list-inside space-y-2 pl-2 text-sm">
            <li>Open any document generation form</li>
            <li>Click the "Upload Document" or "Scan Document" button</li>
            <li>Choose your file:
              <ul className="list-disc list-inside pl-6 mt-1">
                <li><strong>Mobile:</strong> Use camera to take a photo or select from gallery</li>
                <li><strong>Desktop:</strong> Browse files or drag & drop</li>
              </ul>
            </li>
            <li>Wait 2-5 seconds for AI to extract data</li>
            <li>Review auto-filled fields (highlighted in green)</li>
            <li>Correct any errors manually if needed</li>
            <li>Continue with document generation</li>
          </ol>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-yellow-900">
              <strong>📸 Photo Tips for Best Results:</strong>
            </p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Use good lighting (natural light works best)</li>
              <li>Ensure document is flat and in focus</li>
              <li>Capture the entire document in frame</li>
              <li>Avoid shadows and reflections</li>
              <li>Use high resolution (at least 1080p)</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'AI Assistant - Your Digital Helper',
    description: 'Get instant help and multilingual support',
    icon: MessageSquare,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">The AI Assistant is available 24/7 to help you:</p>
        <div className="space-y-3">
          <p className="font-semibold">What the AI Can Do:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Explain Requirements:</strong> "What documents do I need for a passport?"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Guide Form Filling:</strong> "Help me fill out the BI-9 form"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Translate Content:</strong> "Explain this in Zulu/Afrikaans/Xhosa"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Verify Information:</strong> "Is this ID number format correct?"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Troubleshoot Issues:</strong> "Why isn't my document generating?"</span>
            </li>
          </ul>
          <p className="font-semibold mt-4">How to Use the AI Chat:</p>
          <ol className="list-decimal list-inside space-y-2 pl-2 text-sm">
            <li>Click the "AI Chat" tab</li>
            <li>Type your question in the message box at the bottom</li>
            <li>Press Enter or click the send button</li>
            <li>Wait 1-3 seconds for the AI response</li>
            <li>Read the detailed answer with step-by-step guidance</li>
            <li>Ask follow-up questions for clarification</li>
          </ol>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-purple-900 font-semibold mb-2">
              🌍 Available in 11 Languages:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>• English</div>
              <div>• isiZulu</div>
              <div>• isiXhosa</div>
              <div>• Afrikaans</div>
              <div>• Sepedi</div>
              <div>• Setswana</div>
              <div>• Sesotho</div>
              <div>• Xitsonga</div>
              <div>• siSwati</div>
              <div>• Tshivenda</div>
              <div>• isiNdebele</div>
            </div>
            <p className="text-sm mt-3">Just ask: "Please respond in [language]"</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: 'Downloading Your Documents',
    description: 'Find and manage your generated PDFs',
    icon: Download,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">After generating a document, it downloads automatically. Here's where to find it:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-semibold text-blue-900 flex items-center gap-2">
              📱 iPhone/iPad
            </p>
            <ol className="text-sm mt-2 space-y-2 list-decimal list-inside">
              <li>Look for the download notification at the top of screen</li>
              <li>Tap the notification to open the PDF</li>
              <li><strong>Or:</strong> Go to Files app → Downloads folder</li>
              <li>To save permanently: Tap Share icon → Save to Files → Choose location</li>
              <li>File name format: <code className="bg-gray-100 px-1 rounded">birth_certificate_20240115.pdf</code></li>
            </ol>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="font-semibold text-green-900 flex items-center gap-2">
              🤖 Android Devices
            </p>
            <ol className="text-sm mt-2 space-y-2 list-decimal list-inside">
              <li>Swipe down notification bar to see download complete</li>
              <li>Tap notification to open PDF immediately</li>
              <li><strong>Or:</strong> Open Files/My Files app</li>
              <li>Navigate to Downloads folder</li>
              <li>Sort by "Date modified" to find recent files</li>
              <li>Long-press file to share, rename, or move</li>
            </ol>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="font-semibold text-purple-900 flex items-center gap-2">
              💻 Desktop/Laptop
            </p>
            <ol className="text-sm mt-2 space-y-2 list-decimal list-inside">
              <li>Check browser download bar at bottom of window</li>
              <li>Click downloaded file to open</li>
              <li><strong>Or:</strong> Open File Explorer/Finder</li>
              <li>Navigate to Downloads folder</li>
              <li>Default location:
                <ul className="list-disc list-inside pl-6 mt-1">
                  <li>Windows: <code className="bg-gray-100 px-1 rounded">C:\Users\[YourName]\Downloads</code></li>
                  <li>Mac: <code className="bg-gray-100 px-1 rounded">/Users/[YourName]/Downloads</code></li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-orange-900 font-semibold mb-2">
            ⚠️ Important Notes:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Documents are saved as PDF format for universal compatibility</li>
            <li>File size typically 200KB - 2MB depending on document type</li>
            <li>PDFs include watermarks and security features</li>
            <li>Keep backups in cloud storage (Google Drive, iCloud, OneDrive)</li>
            <li>Don't delete originals - you may need them for verification</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: 'Document Verification',
    description: 'Check authenticity of existing documents',
    icon: Eye,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">Verify any document's authenticity using our advanced AI and government database integration:</p>
        <div className="space-y-3">
          <p className="font-semibold">How to Verify Documents:</p>
          <ol className="list-decimal list-inside space-y-2 pl-2 text-sm">
            <li>Navigate to the "Verify" tab</li>
            <li>Upload the document you want to verify:
              <ul className="list-disc list-inside pl-6 mt-1">
                <li>Click "Choose File" and select document</li>
                <li>Or drag and drop the file into the upload area</li>
                <li>Supported formats: PDF, JPG, PNG</li>
              </ul>
            </li>
            <li>Wait for AI analysis (5-15 seconds)</li>
            <li>Review verification results showing:
              <ul className="list-disc list-inside pl-6 mt-1">
                <li>Authenticity score (0-100%)</li>
                <li>Security features detected</li>
                <li>Government database matches</li>
                <li>Potential fraud indicators</li>
                <li>Issue date and expiry validation</li>
              </ul>
            </li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-green-900 font-semibold mb-2">
              ✅ What Gets Verified:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Watermarks and security features</li>
              <li>Document numbers against government databases</li>
              <li>Signature authenticity</li>
              <li>Tamper detection</li>
              <li>Format compliance with DHA standards</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: 'Security & Privacy',
    description: 'How we protect your information',
    icon: Shield,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">Your security and privacy are our top priorities. Here's how we protect you:</p>
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-semibold text-blue-900 mb-2">🔒 Data Protection:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>256-bit AES encryption for all data</li>
              <li>SSL/TLS secure connections (https://)</li>
              <li>Zero-knowledge architecture - we can't see your passwords</li>
              <li>Automatic data deletion after 30 days</li>
              <li>POPIA (Protection of Personal Information Act) compliant</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-semibold text-green-900 mb-2">🛡️ Security Features:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Biometric authentication (fingerprint/face ID)</li>
              <li>Two-factor authentication (2FA) available</li>
              <li>Real-time fraud detection AI</li>
              <li>Blockchain document verification</li>
              <li>Audit trails for all activities</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="font-semibold text-purple-900 mb-2">👤 Privacy Controls:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>You own all your data - delete anytime</li>
              <li>No data sharing with third parties</li>
              <li>Anonymous usage analytics only</li>
              <li>Right to access all stored information</li>
              <li>Compliant with GDPR and POPIA</li>
            </ul>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
          <p className="text-sm text-red-900">
            <strong>⚠️ Security Tips:</strong>
          </p>
          <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
            <li>Never share your login credentials</li>
            <li>Use strong, unique passwords</li>
            <li>Enable biometric login when available</li>
            <li>Log out when using shared devices</li>
            <li>Report suspicious activity immediately</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 9,
    title: 'Troubleshooting & Support',
    description: 'Common issues and how to resolve them',
    icon: AlertTriangle,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="font-medium text-base">Having issues? Here are solutions to common problems:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <p className="font-semibold text-red-900">❌ Document Won't Generate</p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Check all required fields are filled (marked with *)</li>
              <li>Verify ID numbers are in correct format</li>
              <li>Ensure dates are valid and in correct format</li>
              <li>Clear browser cache and try again</li>
              <li>Check internet connection</li>
            </ul>
          </div>
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <p className="font-semibold text-orange-900">📥 Download Not Working</p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Check browser download settings/permissions</li>
              <li>Disable popup blockers for this site</li>
              <li>Try a different browser (Chrome, Safari, Firefox)</li>
              <li>Check available storage space on device</li>
              <li>On mobile: Allow file downloads in browser settings</li>
            </ul>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="font-semibold text-yellow-900">📸 OCR Not Detecting Text</p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Ensure good lighting when taking photo</li>
              <li>Keep document flat and camera steady</li>
              <li>Use higher image resolution</li>
              <li>Avoid shadows and glare</li>
              <li>Try uploading a clearer scan</li>
            </ul>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-semibold text-blue-900">🤖 AI Assistant Not Responding</p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Check internet connection</li>
              <li>Refresh the page</li>
              <li>Clear conversation and start new chat</li>
              <li>Try asking question differently</li>
              <li>Wait a moment - AI may be processing</li>
            </ul>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-green-900 font-semibold mb-2">
            💬 Need More Help?
          </p>
          <ul className="text-sm space-y-2">
            <li><strong>AI Chat:</strong> Ask the AI assistant any question - it's available 24/7</li>
            <li><strong>Tutorial:</strong> Click the help icon (?) to restart this tutorial anytime</li>
            <li><strong>Admin Support:</strong> Contact support through the Admin tab for technical issues</li>
            <li><strong>Government Portal:</strong> Visit www.dha.gov.za for official DHA information</li>
          </ul>
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

    // Listen for tutorial show event
    const handleShowTutorial = () => {
      setOpen(true);
      const savedStep = localStorage.getItem('dha_tutorial_step');
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
        localStorage.removeItem('dha_tutorial_step');
      } else {
        setCurrentStep(0);
      }
    };

    window.addEventListener('showTutorial', handleShowTutorial);
    
    return () => {
      window.removeEventListener('showTutorial', handleShowTutorial);
    };
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

  const handleSkip = () => {
    localStorage.setItem('dha_tutorial_completed', 'true');
    setOpen(false);
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">{step.title}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {step.content}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-1.5">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-600 w-8' 
                    : index < currentStep 
                    ? 'bg-green-500 w-2' 
                    : 'bg-gray-300 w-2'
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
            <Button variant="ghost" onClick={handleSkip} className="min-w-24">
              Skip
            </Button>
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
          Step {currentStep + 1} of {tutorialSteps.length} • 
          <span className="ml-2">
            {currentStep === 0 && "Getting Started"}
            {currentStep === 1 && "Navigation Guide"}
            {currentStep === 2 && "Document Generation"}
            {currentStep === 3 && "OCR Features"}
            {currentStep === 4 && "AI Assistant"}
            {currentStep === 5 && "Downloads"}
            {currentStep === 6 && "Verification"}
            {currentStep === 7 && "Security"}
            {currentStep === 8 && "Troubleshooting"}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
