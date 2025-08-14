'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';
import { toast } from 'react-hot-toast';
import { CheckCircle, AlertCircle, Cloud, Database, Shield, Zap } from 'lucide-react';

export default function TestUploadPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testR2Connection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('/api/test-r2', {
        method: 'POST',
      });
      const result = await response.json();
      setTestResult(result);
      
      if (result.success) {
        toast.success('R2 connection test successful!');
      } else {
        toast.error('R2 connection test failed');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Failed to test R2 connection');
      setTestResult({
        success: false,
        error: 'Network error or server unavailable'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleUploadSuccess = (fileData: any) => {
    console.log('File uploaded successfully:', fileData);
    toast.success(`File "${fileData.originalName}" uploaded successfully!`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🏥 आरोग्य अस्पताल</h1>
        <h2 className="text-xl text-muted-foreground">Cloudflare R2 Storage Test</h2>
        <p className="text-sm text-muted-foreground">
          Test file upload functionality for the Hospital Management System
        </p>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Connection Test
          </CardTitle>
          <CardDescription>
            Test the connection to Cloudflare R2 storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testR2Connection} 
            disabled={isTestingConnection}
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing Connection...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Test R2 Connection
              </>
            )}
          </Button>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message || (testResult.success ? 'Connection Successful' : 'Connection Failed')}
                </span>
              </div>

              {testResult.success && testResult.data && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Test File Details:</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• URL: {testResult.data.testFile?.url}</p>
                      <p>• Key: {testResult.data.testFile?.key}</p>
                      <p>• Size: {testResult.data.testFile?.size} bytes</p>
                      <p>• Upload Time: {testResult.data.testFile?.uploadTime}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Configuration:</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Bucket: {testResult.data.configuration?.bucket}</p>
                      <p>• Region: {testResult.data.configuration?.region}</p>
                      <p>• Endpoint: {testResult.data.configuration?.endpoint}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Features Verified:</h4>
                    <div className="flex flex-wrap gap-1">
                      {testResult.data.features?.map((feature: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!testResult.success && testResult.error && (
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {testResult.error}
                  </p>
                  {testResult.troubleshooting && (
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Troubleshooting:</h4>
                      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        {testResult.troubleshooting.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Test */}
      <FileUpload
        patientId="TEST-PATIENT-001"
        onUploadSuccess={handleUploadSuccess}
        maxFileSize={10 * 1024 * 1024} // 10MB
      />

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            R2 Storage Features
          </CardTitle>
          <CardDescription>
            Cloudflare R2 integration features for the hospital management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Storage Capabilities
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Patient medical records</li>
                <li>• Lab reports and test results</li>
                <li>• X-ray and imaging files</li>
                <li>• Prescription documents</li>
                <li>• Profile images</li>
                <li>• General medical documents</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Presigned URLs for secure access</li>
                <li>• File type validation</li>
                <li>• Size limit enforcement</li>
                <li>• Organized file structure</li>
                <li>• Metadata tracking</li>
                <li>• Access control integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
