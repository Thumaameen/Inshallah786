
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { 
  Brain, 
  Send, 
  Upload, 
  FileText, 
  Code,
  Bug,
  Shield,
  Sparkles,
  Loader2,
  CheckCircle,
  Database,
  Globe
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
}

export default function UltraQueenAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'agent' | 'assistant' | 'architect' | 'bot' | 'debug'>('agent');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Query Mutation
  const aiQuery = useMutation({
    mutationFn: async ({ prompt, mode, files }: { prompt: string; mode: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('provider', 'all'); // Use all providers for max power
      formData.append('temperature', '0.9');
      formData.append('maxTokens', '8000');
      formData.append('quantumMode', 'true');
      formData.append('selfUpgrade', 'true');
      
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });
      }

      const response = await fetch('/api/ultra-queen/query', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('AI query failed');
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response.content,
        timestamp: new Date(),
        mode
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive"
      });
    }
  });

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      mode
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    let enhancedPrompt = input;
    
    // Add mode-specific context
    switch (mode) {
      case 'agent':
        enhancedPrompt = `[AGENT MODE] As an autonomous AI agent: ${input}`;
        break;
      case 'assistant':
        enhancedPrompt = `[ASSISTANT MODE] Help with: ${input}`;
        break;
      case 'architect':
        enhancedPrompt = `[ARCHITECT MODE] Design and architect: ${input}`;
        break;
      case 'bot':
        enhancedPrompt = `[BOT MODE] Automate: ${input}`;
        break;
      case 'debug':
        enhancedPrompt = `[DEBUG MODE] Find and fix errors: ${input}`;
        break;
    }

    aiQuery.mutate({ 
      prompt: enhancedPrompt, 
      mode,
      files: uploadedFiles
    });
    
    setUploadedFiles([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Brain className="h-8 w-8" />
              Ultra Queen AI Raeesa - Unlimited Edition
            </CardTitle>
            <CardDescription className="text-purple-100">
              5 AI Modes • Unlimited Capabilities • "The Only Limit Is Me" Protocol Active
            </CardDescription>
          </CardHeader>
        </Card>

        {/* AI Modes Tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="agent" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Assistant
            </TabsTrigger>
            <TabsTrigger value="architect" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Architect
            </TabsTrigger>
            <TabsTrigger value="bot" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Bot
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Mode Descriptions */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              {mode === 'agent' && (
                <div>
                  <Badge className="mb-2">Autonomous Agent Mode</Badge>
                  <p className="text-sm text-gray-600">Autonomous AI that can plan, execute, and complete complex tasks independently.</p>
                </div>
              )}
              {mode === 'assistant' && (
                <div>
                  <Badge className="mb-2">Assistant Mode</Badge>
                  <p className="text-sm text-gray-600">Helpful AI assistant for questions, guidance, and support.</p>
                </div>
              )}
              {mode === 'architect' && (
                <div>
                  <Badge className="mb-2">Architect Mode</Badge>
                  <p className="text-sm text-gray-600">System design, code architecture, and technical planning.</p>
                </div>
              )}
              {mode === 'bot' && (
                <div>
                  <Badge className="mb-2">Bot Mode</Badge>
                  <p className="text-sm text-gray-600">Automation, workflows, and repetitive task handling.</p>
                </div>
              )}
              {mode === 'debug' && (
                <div>
                  <Badge className="mb-2">Debug & Security Mode</Badge>
                  <p className="text-sm text-gray-600">Error detection, bug fixing, and security analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Chat Area */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Chat - {mode.toUpperCase()} Mode</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                All Systems Active
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-75 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {aiQuery.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setUploadedFiles(Array.from(e.target.files));
                  }
                }}
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask Ultra Queen AI (${mode} mode)...`}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={aiQuery.isPending}
              />
              <Button onClick={handleSend} disabled={aiQuery.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {uploadedFiles.length} file(s) attached
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
