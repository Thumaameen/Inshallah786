
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Upload, Send, Loader2, Bot, FileText, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export default function EnhancedAIInterface() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [providers, setProviders] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load providers on mount
  useState(() => {
    fetch('/api/ai/providers')
      .then(res => res.json())
      .then(data => setProviders(data.providers || {}))
      .catch(console.error);
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      toast({
        title: 'Files attached',
        description: `${e.target.files.length} file(s) ready to upload`
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      formData.append('model', selectedModel);
      files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          model: data.model
        }]);
        setFiles([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Ultra AI Assistant - Multi-Provider Interface
            </CardTitle>
            <p className="text-sm text-blue-100">
              Choose your AI model and upload files for processing
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Model Selection */}
            <div className="mb-4 flex gap-4 items-center">
              <label className="font-medium">AI Model:</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(providers).map(([key, provider]: [string, any]) => (
                    <SelectItem key={key} value={key} disabled={!provider.available}>
                      {provider.name} {!provider.available && '(Unavailable)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant={providers[selectedModel]?.available ? 'default' : 'secondary'}>
                {providers[selectedModel]?.provider?.toUpperCase() || 'N/A'}
              </Badge>
            </div>

            {/* Messages */}
            <ScrollArea className="h-96 border rounded-lg p-4 mb-4 bg-white dark:bg-gray-950">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                  <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your chosen AI model</p>
                  <p className="text-sm mt-2">Upload files for analysis and processing</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.model && (
                          <p className="text-xs mt-2 opacity-70">
                            Model: {providers[msg.model]?.name || msg.model}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* File Upload */}
            {files.length > 0 && (
              <div className="mb-4 flex gap-2 flex-wrap">
                {files.map((file, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {file.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message... (Upload files for document analysis)"
                className="flex-1"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button onClick={handleSend} disabled={isLoading || (!input.trim() && files.length === 0)}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
