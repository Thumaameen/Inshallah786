import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, FileText, Cpu, Database, Globe,
  CheckCircle, AlertCircle, Zap, Network,
  Crown, Lock, Server, Activity, Wallet,
  Download, MessageSquare, Image, Sparkles, FileCode, Brain
} from 'lucide-react';
import GlobalAccessTab from './GlobalAccessTab';

export default function UltraQueenDashboardEnhanced() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/ultra-dashboard/status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status);
        console.log('System Status:', data.status);
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocument = async (docType: string) => {
    toast({
      title: 'Generating Document',
      description: `Creating ${docType.replace(/_/g, ' ')}...`,
    });

    try {
      const response = await fetch('/api/ultra-dashboard/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentType: docType,
          personalData: {
            fullName: 'Queen Raeesa',
            idNumber: '0001015000080',
            dateOfBirth: '2000-01-01',
            nationality: 'South African',
            address: 'Ultra Queen Palace, Johannesburg'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Document Generated Successfully',
          description: `${data.documentType.replace(/_/g, ' ')} is ready for download`,
        });

        // Download the document
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate document',
        variant: 'destructive'
      });
    }
  };

  const sendAIMessage = async () => {
    if (!aiMessage.trim()) return;

    toast({
      title: 'Sending to AI',
      description: 'Processing your message...',
    });

    try {
      const response = await fetch('/api/ultra-dashboard/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: aiMessage,
          systemPrompt: 'You are Ultra Queen AI Raeesa with unlimited capabilities'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '🤖 AI Response',
          description: data.response.substring(0, 100) + '...',
        });
        setAiMessage('');
      }
    } catch (error) {
      toast({
        title: 'AI Error',
        description: 'Failed to get AI response',
        variant: 'destructive'
      });
    }
  };

  const generateAIImage = async () => {
    if (!imagePrompt.trim()) return;

    toast({
      title: 'Generating Image',
      description: 'Creating your image with DALL-E 3...',
    });

    try {
      const response = await fetch('/api/ultra-dashboard/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '🎨 Image Generated',
          description: 'Opening in new tab...',
        });
        window.open(data.imageUrl, '_blank');
        setImagePrompt('');
      }
    } catch (error) {
      toast({
        title: 'Image Generation Failed',
        variant: 'destructive'
      });
    }
  };

  const checkBlockchainBalance = async (network: string) => {
    if (!walletAddress.trim()) {
      toast({
        title: 'Enter Wallet Address',
        description: 'Please enter a wallet address first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/ultra-dashboard/blockchain/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: walletAddress,
          network: network.toLowerCase()
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: `💰 ${network} Balance`,
          description: data.balance,
        });
      }
    } catch (error) {
      toast({
        title: 'Balance Check Failed',
        variant: 'destructive'
      });
    }
  };

  const testBlockchain = async (network: string) => {
    toast({
      title: `Testing ${network}`,
      description: 'Connecting to blockchain...',
    });

    try {
      const response = await fetch('/api/ultra-dashboard/test-blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ network })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result.connected) {
          toast({
            title: `✅ ${network} Connected`,
            description: `Block #${data.result.blockNumber} | Gas: ${data.result.gasPrice}`,
          });
        } else {
          toast({
            title: `❌ ${network} Failed`,
            description: data.result.error,
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-950 to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-24 h-24 text-yellow-400 animate-bounce mx-auto" />
          <h1 className="text-4xl font-bold text-yellow-300 mt-4 animate-pulse">Welcome, Ultra Queen Raeesa</h1>
          <p className="text-white mt-2 animate-fade-in">Initializing Royal Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-teal-950 to-emerald-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Golden Crown Header */}
        <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-yellow-900/30 via-amber-800/20 to-yellow-900/30 rounded-xl border border-yellow-600/30 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Crown className="w-16 h-16 text-yellow-500 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs shadow-md">
                  ULTRA
                </Badge>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Ultra Queen AI Raeesa
              </h1>
              <p className="text-emerald-400 font-semibold text-lg">Global Access • Unlimited Authority • Only Limit Is Me</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 shadow-md">
              ALL SYSTEMS LIVE
            </Badge>
            <span className="text-xs text-yellow-400">Queen Raeesa Exclusive Access</span>
          </div>
        </div>

        {/* Status Cards with Queen Theme */}
        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* AI Status Card */}
            <Card className="bg-gradient-to-br from-teal-900/50 to-emerald-900/50 border-emerald-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-400 uppercase font-semibold">AI Engine</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {systemStatus.ai?.connected ? '🟢 LIVE' : '🔴 OFFLINE'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">GPT-4 Turbo</p>
                  </div>
                  <Cpu className={`w-8 h-8 ${systemStatus.ai?.connected ? 'text-emerald-400' : 'text-red-500'}`} />
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Status Card */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-400 uppercase font-semibold">Blockchain</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {systemStatus.blockchain?.ethereum?.connected ? '🟢 LIVE' : '🔴 OFFLINE'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">ETH/MATIC/ZORA</p>
                  </div>
                  <Network className={`w-8 h-8 ${systemStatus.blockchain?.ethereum?.connected ? 'text-purple-400' : 'text-red-500'}`} />
                </div>
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border-yellow-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-400 uppercase font-semibold">Documents</p>
                    <p className="text-xl font-bold text-emerald-400">23 TYPES</p>
                    <p className="text-xs text-gray-400 mt-1">PDF Ready</p>
                  </div>
                  <FileText className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            {/* Global Access Card */}
            <Card className="bg-gradient-to-br from-red-900/50 to-pink-900/50 border-red-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-400 uppercase font-semibold">Authority</p>
                    <p className="text-xl font-bold text-yellow-400">UNLIMITED</p>
                    <p className="text-xs text-gray-400 mt-1">Global Access</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Royal Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 gap-2 bg-gradient-to-r from-cyan-900/40 to-teal-900/40 p-2 rounded-xl border-2 border-yellow-400/30 shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-teal-950 font-bold">
              <Sparkles className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white font-bold">
              <Brain className="w-4 h-4 mr-2" />
              Ultra AI
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 data-[state=active]:text-teal-950 font-bold">
              <FileText className="w-4 h-4 mr-2" />
              DHA Docs
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-blue-500 data-[state=active]:text-white font-bold">
              <FileCode className="w-4 h-4 mr-2" />
              PDF Gen
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold">
              <Globe className="w-4 h-4 mr-2" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="global" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-300 data-[state=active]:to-yellow-500 data-[state=active]:text-teal-950 font-bold">
              <Crown className="w-4 h-4 mr-2" />
              Global
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 border-emerald-600/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Royal Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-teal-950 font-bold shadow-md"
                    onClick={() => generateDocument('south_african_passport')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Test Passport
                  </Button>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                    onClick={() => testBlockchain('Ethereum')}
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Test Ethereum Connection
                  </Button>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                    onClick={() => testBlockchain('Polygon')}
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Test Polygon Connection
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-600/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Server className="w-5 h-5 text-purple-400" />
                    System Status Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemStatus && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-400">AI Model:</span>
                        <span>GPT-4-Turbo</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-400">Ethereum Block:</span>
                        <span>{systemStatus.blockchain?.ethereum?.blockNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-400">Polygon Block:</span>
                        <span>{systemStatus.blockchain?.polygon?.blockNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-400">Zora Network:</span>
                        <span>{systemStatus.blockchain?.zora?.connected ? 'Connected' : 'Offline'}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-400">Web3Auth:</span>
                        <span>{systemStatus.web3auth?.clientId ? 'Configured' : 'Not configured'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="mt-6">
            <Card className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border-2 border-cyan-400/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Brain className="w-8 h-8 text-yellow-400" />
                  👑 Ultra AI Assistant
                </CardTitle>
                <CardDescription className="text-cyan-200 text-lg">
                  Unlimited AI capabilities for the Queen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-semibold">Chat with Queen Raeesa AI</label>
                  <Textarea
                    placeholder="Ask me anything, my Queen..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 shadow-inner min-h-[150px] text-lg"
                  />
                  <Button
                    onClick={sendAIMessage}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold text-lg py-3 shadow-md"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Converse with AI
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-semibold">Generate Royal Image with DALL-E 3</label>
                  <Input
                    placeholder="Describe the majestic image you desire..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 shadow-inner"
                  />
                  <Button
                    onClick={generateAIImage}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-3 shadow-md"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Craft Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border-2 border-yellow-400/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
                  <FileText className="w-8 h-8 text-yellow-400" />
                  👑 DHA Document Generation
                </CardTitle>
                <CardDescription className="text-amber-200 text-lg">
                  Access and generate all your official South African documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    'smart_id_card',
                    'identity_document_book',
                    'south_african_passport',
                    'birth_certificate',
                    'marriage_certificate',
                    'death_certificate',
                    'affidavit',
                    'police_clearance',
                    'company_registration',
                    'vat_registration',
                    'tax_clearance',
                    'import_export_code',
                    'driving_license_application',
                    'vehicle_registration',
                    'title_deed',
                    'lease_agreement',
                    'power_of_attorney',
                    'will_and_testament',
                    'employment_contract',
                    'payslip',
                    'bank_statement',
                    'id_photo_replacement',
                    'travel_document',
                    'refugee_permit',
                    'study_visa_permit',
                    'general_work_visa',
                    'critical_skills_work_visa',
                    'business_visa',
                    'visitor_visa',
                    'permanent_residence_permit',
                    'citizenship_application',
                    'repatriation_document',
                    'birth_registration',
                    'death_registration',
                    'adoption_certificate',
                    'divorce_certificate',
                    'name_change_certificate',
                    'pension_fund_withdrawal',
                    'medical_aid_application',
                    'firearm_license_application',
                    'vehicle_license_renewal'
                  ].map((doc) => (
                    <Button
                      key={doc}
                      variant="outline"
                      className="text-left justify-start shadow-sm border-yellow-500/30 hover:bg-yellow-600/10 transition-colors duration-200"
                      onClick={() => generateDocument(doc)}
                    >
                      <FileText className="w-4 h-4 mr-2 text-yellow-400" />
                      {doc.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
                <Alert className="bg-yellow-500/10 border-yellow-400/50 mt-4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    💎 <strong>Royal Feature:</strong> All generated documents are securely saved to your browser's download folder for your convenience.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF Generator Tab */}
          <TabsContent value="pdf" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 border-2 border-yellow-400/50">
              <CardHeader>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                  <FileCode className="w-8 h-8 text-yellow-400" />
                  👑 Ultra PDF Generator
                </CardTitle>
                <CardDescription className="text-cyan-200 text-lg">
                  Advanced PDF creation with code syntax highlighting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => window.location.href = '/ultra-pdf'}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-teal-950 font-bold text-lg py-6 shadow-lg"
                  >
                    <FileCode className="w-6 h-6 mr-2" />
                    Open PDF Generator
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/official-documents'}
                    className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold text-lg py-6 shadow-lg"
                  >
                    <FileText className="w-6 h-6 mr-2" />
                    Official Documents
                  </Button>
                </div>
                <Alert className="bg-yellow-500/20 border-yellow-400">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    💎 <strong>Royal Feature:</strong> Generate PDFs with syntax highlighting for 40+ programming languages. All documents are saved in your browser's download folder.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain" className="mt-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-2 border-purple-600/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Globe className="w-8 h-8 text-purple-400" />
                  👑 Blockchain Explorer
                </CardTitle>
                <CardDescription className="text-purple-200 text-lg">
                  Monitor blockchain networks and your digital assets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-semibold">Check Wallet Balance</label>
                  <Input
                    placeholder="Enter your royal wallet address (0x...)"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 shadow-inner"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => checkBlockchainBalance('ethereum')}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 shadow-md"
                    >
                      ETH Balance
                    </Button>
                    <Button
                      onClick={() => checkBlockchainBalance('polygon')}
                      className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 shadow-md"
                    >
                      MATIC Balance
                    </Button>
                    <Button
                      onClick={() => checkBlockchainBalance('zora')}
                      className="bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600 text-white font-bold py-3 shadow-md"
                    >
                      Zora Balance
                    </Button>
                  </div>
                </div>

                {systemStatus?.blockchain && (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-900/50 rounded-lg shadow-inner border border-purple-600/30">
                      <h4 className="font-semibold mb-2 text-purple-400">Ethereum Network Status</h4>
                      <div className="text-sm space-y-1 text-gray-300">
                        <div>Connected: {systemStatus.blockchain.ethereum?.connected ? <span className="text-green-400">✅ LIVE</span> : <span className="text-red-400">❌ OFFLINE</span>}</div>
                        <div>Block: {systemStatus.blockchain.ethereum?.blockNumber || 'N/A'}</div>
                        <div>Gas Price: {systemStatus.blockchain.ethereum?.gasPrice ? `${systemStatus.blockchain.ethereum.gasPrice} Gwei` : 'N/A'}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg shadow-inner border border-pink-600/30">
                      <h4 className="font-semibold mb-2 text-pink-400">Polygon Network Status</h4>
                      <div className="text-sm space-y-1 text-gray-300">
                        <div>Connected: {systemStatus.blockchain.polygon?.connected ? <span className="text-green-400">✅ LIVE</span> : <span className="text-red-400">❌ OFFLINE</span>}</div>
                        <div>Block: {systemStatus.blockchain.polygon?.blockNumber || 'N/A'}</div>
                        <div>Gas Price: {systemStatus.blockchain.polygon?.gasPrice ? `${systemStatus.blockchain.polygon.gasPrice} Gwei` : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Access Tab */}
          <TabsContent value="global" className="mt-6">
            <GlobalAccessTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}