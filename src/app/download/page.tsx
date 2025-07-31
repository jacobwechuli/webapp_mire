"use client";

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { CardTransition } from '@/components/layout/PageTransition';
import Script from 'next/script';

function DownloadContent() {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use the API route for better download handling
      const link = document.createElement('a');
      link.href = '/api/download-apk';
      link.download = 'goldplus-advisory-v1.apk';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Complete the progress
      setTimeout(() => {
        setDownloadProgress(100);
        setIsDownloading(false);
        setDownloadComplete(true);
        toast({
          title: "Download Complete!",
          description: "GoldPlus Advisory app has been downloaded successfully.",
        });
      }, 1000);

    } catch (error) {
      setIsDownloading(false);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-card-foreground">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-4xl mx-auto py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Header */}
          <CardTransition index={0}>
            <Card className="bg-card border border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-amber-700 dark:text-amber-500">
                  Download GoldPlus Advisory
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Get the full mobile experience with our Android app
                </p>
              </CardHeader>
            </Card>
          </CardTransition>

          {/* Download Card */}
          <CardTransition index={1}>
            <Card className="bg-card border border-border">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* App Icon and Info */}
                  <div className="flex flex-col items-center text-center md:text-left md:items-start">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-700 to-amber-600 dark:from-amber-600 dark:to-amber-500 rounded-2xl flex items-center justify-center mb-4">
                      <Smartphone className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">GoldPlus Advisory v1.0</h3>
                    {/* <p className="text-muted-foreground mb-4 max-w-md">
                      Access your financial dashboard, track expenses, set goals, and get AI-powered insights on the go.
                    </p> */}
                    {/* <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="secondary">Android 6.0+</Badge>
                      <Badge variant="secondary">Offline Support</Badge>
                      <Badge variant="secondary">AI Powered</Badge>
                    </div> */}
                  </div>

                  {/* Download Section */}
                  <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                    {!downloadComplete ? (
                      <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        size="lg"
                        className="w-full md:w-auto"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {isDownloading ? 'Downloading...' : 'Download APK'}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Download Complete!</span>
                      </div>
                    )}

                    {isDownloading && (
                      <div className="w-full space-y-2">
                        <Progress value={downloadProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground text-center">
                          {downloadProgress}% Complete
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      File size: ~73 MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardTransition>



          {/* Installation Instructions */}
          <CardTransition index={2}>
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>Installation Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Make sure to enable "Install from Unknown Sources" in your Android settings before installing the APK.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <h4 className="font-medium">Download the APK</h4>
                        <p className="text-sm text-muted-foreground">
                          Click the download button above to get the APK file
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <h4 className="font-medium">Enable Unknown Sources</h4>
                        <p className="text-sm text-muted-foreground">
                          Go to Settings → Security → Unknown Sources and enable it
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <h4 className="font-medium">Install the App</h4>
                        <p className="text-sm text-muted-foreground">
                          Open the downloaded APK file and follow the installation prompts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <div>
                        <h4 className="font-medium">Sign In</h4>
                        <p className="text-sm text-muted-foreground">
                          Open the app and sign in with your existing account
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardTransition>
        </div>
      </main>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <>
      <Script id="download-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Download GoldPlus Advisory | GoldPlus",
          "url": "http://goldplus-advisory.com/download",
          "description": "Download the GoldPlus Advisory Android app for mobile financial management.",
        })}
      </Script>
      <ProtectedRoute>
        <DownloadContent />
      </ProtectedRoute>
    </>
  );
}