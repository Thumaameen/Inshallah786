
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { activateAllIntegrations, getIntegrationStatus } from '../lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function IntegrationActivator() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await getIntegrationStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      const result = await activateAllIntegrations();
      console.log('Activation result:', result);
      await loadStatus();
    } catch (error) {
      console.error('Activation failed:', error);
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Integration Status</h2>
        <Button onClick={handleActivate} disabled={activating}>
          {activating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Activate All Integrations
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* AI Providers */}
        <Card>
          <CardHeader>
            <CardTitle>AI Providers</CardTitle>
            <CardDescription>5 AI Services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {status?.ai && Object.entries(status.ai).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize">{value.name}</span>
                {value.active ? 
                  <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge> :
                  <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Inactive</Badge>
                }
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Web Services */}
        <Card>
          <CardHeader>
            <CardTitle>Web Services</CardTitle>
            <CardDescription>4 Services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {status?.webServices && Object.entries(status.webServices).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{value.name}</span>
                {value.active ? 
                  <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge> :
                  <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Inactive</Badge>
                }
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Blockchain */}
        <Card>
          <CardHeader>
            <CardTitle>Blockchain</CardTitle>
            <CardDescription>3 Networks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {status?.blockchain && Object.entries(status.blockchain).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{value.name}</span>
                {value.active ? 
                  <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge> :
                  <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Inactive</Badge>
                }
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Government APIs */}
        <Card>
          <CardHeader>
            <CardTitle>Government APIs</CardTitle>
            <CardDescription>4 Services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {status?.government && Object.entries(status.government).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{value.name}</span>
                {value.active ? 
                  <Badge variant="default" className="bg-blue-600"><CheckCircle2 className="w-3 h-3 mr-1" /> {value.mode}</Badge> :
                  <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Mock Mode</Badge>
                }
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cloud Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Cloud Platforms</CardTitle>
            <CardDescription>5 Services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {status?.cloud && Object.entries(status.cloud).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{value.name}</span>
                {value.active ? 
                  <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> {value.ready ? 'Ready' : 'Active'}</Badge> :
                  <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Inactive</Badge>
                }
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
