import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../components/ui/use-toast';

interface DocumentFormData {
  name: string;
  passportNumber: string;
  nationality: string;
}

export function DocumentGenerator() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState('');
  const [aiAssistMode, setAiAssistMode] = useState(false);
  const [templateCustomization, setTemplateCustomization] = useState<any>({});
  const [batchGeneration, setBatchGeneration] = useState(false);

  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    passportNumber: '',
    nationality: ''
  });

  const generateMutation = useMutation({
    mutationFn: (data: DocumentFormData) => 
      apiRequest('/api/document/generate', {
        method: 'POST',
        data
      }),
    onSuccess: (data) => {
      // Convert base64 PDF to Blob and download
      const pdfBlob = new Blob([Buffer.from(data.pdf, 'base64')], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DHA-Document-${data.metadata.documentNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Generate Official Document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Passport Number</label>
          <input
            type="text"
            value={formData.passportNumber}
            onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Nationality</label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* AI Assist Mode Toggle */}
        <div className="flex items-center space-x-2">
          <label className="block">AI Assist Mode</label>
          <input
            type="checkbox"
            checked={aiAssistMode}
            onChange={(e) => setAiAssistMode(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>

        {/* Template Customization (Example: JSON input for advanced users) */}
        {aiAssistMode && (
          <div>
            <label className="block mb-2">Template Customization (JSON)</label>
            <textarea
              value={JSON.stringify(templateCustomization, null, 2)}
              onChange={(e) => {
                try {
                  setTemplateCustomization(JSON.parse(e.target.value));
                } catch (error) {
                  console.error("Invalid JSON:", error);
                  toast({ title: "Invalid JSON format", description: "Please enter valid JSON for template customization." });
                }
              }}
              rows={4}
              className="w-full p-2 border rounded"
              placeholder='{"key": "value"}'
            />
          </div>
        )}

        {/* Batch Generation Toggle */}
        <div className="flex items-center space-x-2">
          <label className="block">Batch Generation</label>
          <input
            type="checkbox"
            checked={batchGeneration}
            onChange={(e) => setBatchGeneration(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={generateMutation.isPending}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {generateMutation.isPending ? 'Generating...' : 'Generate Document'}
        </button>
      </form>
    </div>
  );
}