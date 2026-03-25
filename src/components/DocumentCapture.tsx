import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Check, X, RotateCcw, Loader2, SwitchCamera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentCaptureProps {
  documentType: 'id' | 'business' | 'selfie';
  title: string;
  description: string;
  onCapture: (url: string) => void;
  userId: string;
}

const DocumentCapture = ({ documentType, title, description, onCapture, userId }: DocumentCaptureProps) => {
  const [mode, setMode] = useState<'initial' | 'camera' | 'preview'>('initial');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    documentType === 'selfie' ? 'user' : 'environment'
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async (facing?: 'user' | 'environment') => {
    const useFacing = facing || facingMode;
    try {
      // Stop existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Try requested facing mode first, fall back to any camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: useFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch {
        // Fallback: try without facingMode constraint (works on laptops)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setMode('camera');
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access or upload a file instead.",
        variant: "destructive"
      });
    }
  }, [facingMode, toast]);

  const switchCamera = useCallback(async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await startCamera(newFacing);
  }, [facingMode, startCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageData);
    stopCamera();
    setMode('preview');
  }, [facingMode, stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setUploaded(false);
    startCamera();
  }, [startCamera]);

  const uploadDocument = useCallback(async () => {
    if (!capturedImage) return;
    setUploading(true);

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const fileName = `${userId}/${documentType}_${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      onCapture(urlData.publicUrl);
      setUploaded(true);

      toast({ title: "Document Uploaded", description: `${title} has been successfully uploaded.` });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload Failed", description: "Failed to upload. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [capturedImage, userId, documentType, onCapture, title, toast]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setMode('preview');
    };
    reader.readAsDataURL(file);
  }, [toast]);

  return (
    <Card className={uploaded ? 'border-success bg-success/5' : ''}>
      <CardHeader className="pb-2 p-4">
        <CardTitle className="text-base flex items-center gap-2">
          {uploaded && <Check className="h-4 w-4 text-success" />}
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {mode === 'initial' && (
          <div className="flex gap-2">
            <Button onClick={() => startCamera()} size="sm" className="flex-1">
              <Camera className="h-4 w-4 mr-1" />
              Camera
            </Button>
            <label className="flex-1">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                capture={documentType === 'selfie' ? 'user' : 'environment'}
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {mode === 'camera' && (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden bg-foreground/5 aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              {documentType === 'selfie' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-48 border-2 border-dashed border-accent/60 rounded-full" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-foreground/20 text-background hover:bg-foreground/40 h-8 w-8"
                onClick={switchCamera}
              >
                <SwitchCamera size={16} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { stopCamera(); setMode('initial'); }} className="flex-1">
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-1" /> Capture
              </Button>
            </div>
          </div>
        )}

        {mode === 'preview' && capturedImage && (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden bg-foreground/5 aspect-[4/3]">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={retake} disabled={uploading} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-1" /> Retake
              </Button>
              <Button size="sm" onClick={uploadDocument} disabled={uploading || uploaded} className="flex-1">
                {uploading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Uploading...</>
                  : uploaded ? <><Check className="h-4 w-4 mr-1" /> Done</>
                  : <><Upload className="h-4 w-4 mr-1" /> Upload</>}
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};

export default DocumentCapture;
