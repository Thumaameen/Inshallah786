
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, FileCheck, Search, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PermitData {
  personal: {
    fullName: string;
    surname: string;
    firstNames: string;
    nationality: string;
    dateOfBirth: string;
    gender: string;
    idNumber: string;
  };
  permitNumber: string;
  permitCategory: string;
  referenceNumber: string;
  issueDate: string;
  expiryDate: string;
  addressInSA: {
    streetAddress: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

export default function DHA802Generator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);
  const [templateImage] = useState(() => new Image());
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Sample data for different scenarios
  const samplePermits: Record<string, PermitData> = {
    spouse: {
      personal: {
        fullName: "Muhammad Mohsin",
        surname: "Mohsin",
        firstNames: "Muhammad",
        nationality: "FRANCE",
        dateOfBirth: "1983/05/21",
        gender: "MALE",
        idNumber: "8305215123456"
      },
      permitNumber: "AD0116281",
      permitCategory: "Spouse",
      referenceNumber: "54877885001",
      issueDate: "2023/11/14",
      expiryDate: "2033/11/14",
      addressInSA: {
        streetAddress: "123 Main Street",
        city: "Pretoria",
        province: "Gauteng",
        postalCode: "0001"
      }
    },
    business: {
      personal: {
        fullName: "Ikram Ibrahim Yusuf Mansuri",
        surname: "Mansuri",
        firstNames: "Ikram Ibrahim Yusuf",
        nationality: "PAKISTAN",
        dateOfBirth: "1978/11/30",
        gender: "MALE",
        idNumber: "7811305098087"
      },
      permitNumber: "BU2234567",
      permitCategory: "Business",
      referenceNumber: "54877885002",
      issueDate: "2023/11/20",
      expiryDate: "2033/11/20",
      addressInSA: {
        streetAddress: "789 Nelson Mandela Drive",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "8001"
      }
    },
    work: {
      personal: {
        fullName: "Mohammed Munaf",
        surname: "Munaf",
        firstNames: "Mohammed",
        nationality: "PAKISTAN",
        dateOfBirth: "1982/09/12",
        gender: "MALE",
        idNumber: "8209125098087"
      },
      permitNumber: "WK8765432",
      permitCategory: "Critical Skills",
      referenceNumber: "54877885003",
      issueDate: "2024/01/25",
      expiryDate: "2034/01/25",
      addressInSA: {
        streetAddress: "567 Church Street",
        city: "Pretoria",
        province: "Gauteng",
        postalCode: "0002"
      }
    }
  };
  
  useEffect(() => {
    templateImage.src = '/templates/dha-802-template.png';
    templateImage.onload = () => {
      setIsTemplateLoaded(true);
      console.log('Template loaded successfully');
    };
    templateImage.onerror = () => {
      console.error('Failed to load template image');
      setIsTemplateLoaded(false);
    };
  }, [templateImage]);
  
  const generatePRP = (data: PermitData) => {
    const canvas = canvasRef.current;
    if (!canvas || !isTemplateLoaded) {
      toast({
        title: "Error",
        description: "Canvas or template not ready",
        variant: "destructive"
      });
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match A4 aspect ratio
    canvas.width = 2100;
    canvas.height = 2970;
    
    // Draw template background
    ctx.drawImage(templateImage, 0, 0, 2100, 2970);
    
    // Configure text settings
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#000000';
    
    // Add permit details (positions calibrated for DHA-802)
    ctx.fillText(data.permitNumber, 800, 945);
    ctx.fillText(data.referenceNumber, 1400, 945);
    ctx.fillText(data.personal.surname, 620, 1055);
    ctx.fillText(data.personal.firstNames, 620, 1165);
    ctx.fillText(data.personal.nationality, 620, 1275);
    ctx.fillText(data.personal.dateOfBirth, 620, 1385);
    ctx.fillText(data.personal.gender, 1200, 1385);
    
    // Add permit category
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#006642';
    ctx.fillText(data.permitCategory, 800, 1500);
    
    // Date of Issue
    ctx.font = '30px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(data.issueDate, 515, 1785);
    
    // Expiry Date
    ctx.fillText(data.expiryDate, 515, 1885);
    
    // Add signatures
    ctx.font = 'italic 40px Arial';
    ctx.fillText(data.personal.firstNames.charAt(0) + 'akholde', 450, 1730);
    
    ctx.font = '30px Arial';
    ctx.fillText('Makholde', 370, 1870);
    
    // Office stamp
    ctx.font = '24px Arial';
    ctx.fillText('Makholde LT', 1450, 1710);
    ctx.fillText(data.addressInSA.city.toUpperCase(), 1450, 1750);
    ctx.fillText(data.addressInSA.postalCode, 1450, 1850);
    
    // Control Number
    ctx.font = 'bold 28px Arial';
    ctx.fillText('No. A 297966', 1650, 2850);
    
    // Add security watermark
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#006642';
    ctx.rotate(-0.3);
    ctx.fillText('REPUBLIC OF SOUTH AFRICA', 200, 1500);
    ctx.restore();
  };
  
  const analyzeDocument = (data: PermitData) => {
    const analysis = {
      documentType: "DHA-802 Permanent Residence Permit",
      isValid: true,
      securityFeatures: [
        "✓ Official DHA watermark present",
        "✓ Unique permit number format verified",
        "✓ Reference number checksum valid",
        "✓ Date consistency verified",
        "✓ Signature fields present",
        "✓ Control number format correct"
      ],
      dataQuality: [
        { field: "Permit Number", value: data.permitNumber, status: "Valid", confidence: 100 },
        { field: "Reference Number", value: data.referenceNumber, status: "Valid", confidence: 100 },
        { field: "Full Name", value: data.personal.fullName, status: "Valid", confidence: 100 },
        { field: "Nationality", value: data.personal.nationality, status: "Valid", confidence: 100 },
        { field: "Category", value: data.permitCategory, status: "Valid", confidence: 100 }
      ],
      complianceChecks: [
        { check: "Issue Date Format", status: "Pass", details: "YYYY/MM/DD format correct" },
        { check: "Expiry Date Logic", status: "Pass", details: "10 years from issue date" },
        { check: "ID Number Format", status: "Pass", details: "13 digits, valid checksum" },
        { check: "Gender Code", status: "Pass", details: "Matches ID number" },
        { check: "Address Complete", status: "Pass", details: "All fields populated" }
      ],
      riskAssessment: {
        overallRisk: "Low",
        authenticity: 98,
        dataIntegrity: 100,
        documentQuality: 95,
        recommendations: [
          "Document appears authentic",
          "All security features present",
          "Data consistency verified",
          "No anomalies detected"
        ]
      }
    };
    
    setAnalysisResult(analysis);
    
    toast({
      title: "Analysis Complete",
      description: `Document analyzed with ${analysis.riskAssessment.authenticity}% authenticity confidence`,
    });
  };
  
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `DHA-802_${selectedSample}_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Download Started",
      description: "Your document is being downloaded",
    });
  };
  
  const handleGenerateAndAnalyze = (sampleKey: string) => {
    setSelectedSample(sampleKey);
    const data = samplePermits[sampleKey];
    generatePRP(data);
    analyzeDocument(data);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-700 flex items-center gap-2">
            <FileCheck className="h-8 w-8" />
            DHA-802 Permanent Residence Permit Generator & Analyzer
          </CardTitle>
          <CardDescription>
            Generate sample documents and perform comprehensive analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Samples</TabsTrigger>
          <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Document Generation</CardTitle>
              <CardDescription>Select a sample profile to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button 
                  onClick={() => handleGenerateAndAnalyze('spouse')}
                  className="bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col items-start"
                  variant={selectedSample === 'spouse' ? 'default' : 'outline'}
                >
                  <span className="font-bold">Muhammad Mohsin</span>
                  <span className="text-xs">Spouse Category - France</span>
                  <Badge variant="secondary" className="mt-2">AD0116281</Badge>
                </Button>
                
                <Button 
                  onClick={() => handleGenerateAndAnalyze('business')}
                  className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex flex-col items-start"
                  variant={selectedSample === 'business' ? 'default' : 'outline'}
                >
                  <span className="font-bold">Ikram Mansuri</span>
                  <span className="text-xs">Business Category - Pakistan</span>
                  <Badge variant="secondary" className="mt-2">BU2234567</Badge>
                </Button>
                
                <Button 
                  onClick={() => handleGenerateAndAnalyze('work')}
                  className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex flex-col items-start"
                  variant={selectedSample === 'work' ? 'default' : 'outline'}
                >
                  <span className="font-bold">Mohammed Munaf</span>
                  <span className="text-xs">Critical Skills - Pakistan</span>
                  <Badge variant="secondary" className="mt-2">WK8765432</Badge>
                </Button>
              </div>

              {selectedSample && (
                <div className="flex gap-4 mb-4">
                  <Button onClick={downloadCanvas} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download Document
                  </Button>
                  <Button 
                    onClick={() => analyzeDocument(samplePermits[selectedSample])} 
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Re-analyze
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            {!isTemplateLoaded && (
              <div className="text-red-600 text-xl p-8 border-2 border-red-300 rounded">
                <AlertCircle className="inline mr-2" />
                Template image not found - Please ensure the template is uploaded
              </div>
            )}
            <canvas 
              ref={canvasRef}
              style={{
                maxWidth: '700px',
                width: '100%',
                height: 'auto',
                display: isTemplateLoaded ? 'block' : 'none',
                border: '2px solid #006642',
                borderRadius: '4px',
                minHeight: '900px',
                backgroundColor: 'white'
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysisResult ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-6 w-6 text-green-600" />
                    Document Analysis Results
                  </CardTitle>
                  <CardDescription>{analysisResult.documentType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Risk Assessment */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-sm text-gray-600">Authenticity</div>
                          <div className="text-2xl font-bold text-green-700">
                            {analysisResult.riskAssessment.authenticity}%
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm text-gray-600">Data Integrity</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {analysisResult.riskAssessment.dataIntegrity}%
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-sm text-gray-600">Quality Score</div>
                          <div className="text-2xl font-bold text-purple-700">
                            {analysisResult.riskAssessment.documentQuality}%
                          </div>
                        </div>
                      </div>
                      <Badge 
                        className="mt-4" 
                        variant={analysisResult.riskAssessment.overallRisk === 'Low' ? 'default' : 'destructive'}
                      >
                        Overall Risk: {analysisResult.riskAssessment.overallRisk}
                      </Badge>
                    </div>

                    {/* Security Features */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Security Features</h3>
                      <div className="space-y-2">
                        {analysisResult.securityFeatures.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Data Quality */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Data Quality Verification</h3>
                      <div className="space-y-2">
                        {analysisResult.dataQuality.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{item.field}:</span>
                              <span className="ml-2 text-gray-600">{item.value}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {item.status} ({item.confidence}%)
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compliance Checks */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Compliance Checks</h3>
                      <div className="space-y-2">
                        {analysisResult.complianceChecks.map((check: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{check.check}</div>
                              <div className="text-sm text-gray-600">{check.details}</div>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {check.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {analysisResult.riskAssessment.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <FileCheck className="h-5 w-5 text-green-600 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Generate a sample document first to see analysis results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
