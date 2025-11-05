import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface DocumentResponse {
  documentId: string;
  pdf: Uint8Array;
  validationUrl: string;
  mobileUrl: string;
  signature: string;
}

export function MobileDocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentResponse | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest<DocumentResponse>('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: data,
      });
    },
    onSuccess: (data) => {
      setDocumentInfo(data);
      // Create downloadable PDF
      const pdfBlob = new Blob([data.pdf], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // For iOS devices
      if (isIOS()) {
        window.location.href = pdfUrl;
      } else {
        // For Android and other devices
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `DHA-Document-${data.documentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(pdfUrl);

      // Generate QR code for validation
      generateValidationQR(data.validationUrl);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('passportImage', file);
    generateMutation.mutate(formData);
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  const generateValidationQR = (url: string) => {
    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Passport & Generate Document</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="passport-upload"
          />
          <label
            htmlFor="passport-upload"
            className="block text-center cursor-pointer"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Passport preview"
                className="max-w-full h-auto mx-auto"
              />
            ) : (
              <div className="text-gray-500">
                <span className="block mb-2">📸 Take Passport Photo</span>
                <span className="text-sm">or click to upload</span>
              </div>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={!file || generateMutation.isPending}
          className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:bg-gray-400"
        >
          {generateMutation.isPending ? 'Processing...' : 'Generate Document'}
        </button>
      </form>

      {documentInfo && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold text-green-800">Document Generated!</h3>
          <div className="mt-2 space-y-2">
            <p>Document ID: {documentInfo.documentId}</p>
            <a
              href={documentInfo.validationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-500 underline"
            >
              Validate Document
            </a>
            <a
              href={documentInfo.mobileUrl}
              className="block text-blue-500 underline"
            >
              View on Mobile
            </a>
          </div>
        </div>
      )}

      {generateMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700">
          Error: {(generateMutation.error as Error).message}
        </div>
      )}
    </div>
  );
}