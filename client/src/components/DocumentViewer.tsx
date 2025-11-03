import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Download, Share, Eye } from 'lucide-react';
import { useToast } from '@components/ui/use-toast';

interface DocumentViewerProps {
  documentUrl: string;
  fileName: string;
  referenceNumber: string;
  onDownload?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  fileName,
  referenceNumber,
  onDownload
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (onDownload) {
        onDownload();
      }

      toast({
        title: "Download Started",
        description: "Your document is being downloaded",
        duration: 3000
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: fileName,
          text: `DHA Document Reference: ${referenceNumber}`,
          url: documentUrl
        });
      } else {
        await navigator.clipboard.writeText(documentUrl);
        toast({
          title: "Link Copied",
          description: "Document link copied to clipboard",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={`document-viewer ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-mobile-lg font-semibold">{fileName}</h3>
          <p className="text-mobile-sm text-gray-500">Ref: {referenceNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="touch-target"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="touch-target"
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleDownload}
            className="touch-target"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={`pdf-viewer ${isFullscreen ? 'h-[calc(100vh-4rem)]' : 'h-[70vh]'}`}>
        <iframe
          src={`${documentUrl}#toolbar=0`}
          className="w-full h-full"
          title={fileName}
        />
      </div>

      {!isFullscreen && (
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleDownload}
            className="w-full text-mobile-base font-medium"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Document
          </Button>
        </div>
      )}

      {/* Mobile Download Button */}
      <Button
        onClick={handleDownload}
        className="download-button md:hidden"
        size="icon"
      >
        <Download className="h-6 w-6" />
      </Button>
    </Card>
  );
};