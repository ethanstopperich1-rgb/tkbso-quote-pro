import { useState, useRef, useEffect } from 'react';
import { Video, Square, RotateCcw, ArrowRight, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type ProcessingStep = 1 | 2 | 3;

interface DetectedLineItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  confidence: number;
  source: string;
}

export interface VideoAnalysisResult {
  project_summary: string;
  line_items: DetectedLineItem[];
  timeline_notes: string | null;
  special_requests: string[];
  concerns_flagged: string[];
  transcript: string;
  room_dimensions: {
    length_ft: number | null;
    width_ft: number | null;
    confidence: number;
  } | null;
}

interface VideoRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoAnalyzed: (result: VideoAnalysisResult) => void;
  contractorId: string;
}

const PROCESSING_STEPS = [
  { step: 1, title: 'Transcribing Audio', description: 'Converting speech to text' },
  { step: 2, title: 'Analyzing Frames', description: 'Detecting fixtures & materials' },
  { step: 3, title: 'Building Estimate', description: 'Mapping to line items' },
];

const RECORDING_TIPS = [
  'Walk slowly and pan the camera to capture all fixtures',
  'Narrate what you see: "36-inch vanity, needs replacement"',
  'Mention requests: "Client wants quartz counters"',
  'Point out concerns: "Water damage under sink"',
];

export function VideoRecordingModal({ 
  open, 
  onOpenChange, 
  onVideoAnalyzed, 
  contractorId 
}: VideoRecordingModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(1);
  const [processingStatus, setProcessingStatus] = useState('');

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      cleanup();
    }
  }, [open]);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    }
    recordedBlobRef.current = null;
    setIsRecording(false);
    setRecordingTime(0);
    setIsProcessing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleReRecord = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    setRecordedVideo(null);
    recordedBlobRef.current = null;
    setRecordingTime(0);
  };

  // Extract audio from video blob
  const extractAudioFromVideo = async (videoBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      
      video.onloadedmetadata = async () => {
        try {
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const arrayBuffer = await videoBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const numberOfChannels = 1;
          const length = audioBuffer.length;
          const sampleRate = 16000;
          const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
          const source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineContext.destination);
          source.start();
          
          const renderedBuffer = await offlineContext.startRendering();
          const channelData = renderedBuffer.getChannelData(0);
          
          const pcmData = new Int16Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            const s = Math.max(-1, Math.min(1, channelData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          const wavBuffer = createWavFile(pcmData, sampleRate);
          const base64 = arrayBufferToBase64(wavBuffer);
          
          URL.revokeObjectURL(video.src);
          resolve(base64);
        } catch (err) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(videoBlob);
        }
      };
      
      video.onerror = reject;
    });
  };

  const createWavFile = (pcmData: Int16Array, sampleRate: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);
    
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length * 2, true);
    
    const offset = 44;
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(offset + i * 2, pcmData[i], true);
    }
    
    return buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const extractFramesFromVideo = async (videoBlob: Blob, intervalSeconds = 2): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      video.muted = true;
      
      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        canvas.width = Math.min(video.videoWidth, 640);
        canvas.height = Math.min(video.videoHeight, 480);
        
        const duration = video.duration;
        const timestamps: number[] = [];
        
        for (let t = 0; t < duration; t += intervalSeconds) {
          timestamps.push(t);
        }
        
        const limitedTimestamps = timestamps.slice(0, 10);
        let currentIndex = 0;
        
        const captureFrame = () => {
          if (currentIndex >= limitedTimestamps.length) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }
          video.currentTime = limitedTimestamps[currentIndex];
        };
        
        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            const base64 = dataUrl.split(',')[1];
            frames.push(base64);
          }
          currentIndex++;
          captureFrame();
        };
        
        captureFrame();
      };
      
      video.onerror = reject;
    });
  };

  const processVideo = async () => {
    if (!recordedBlobRef.current || !contractorId) {
      toast.error('No video to process');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(1);
    setProcessingStatus('Extracting audio...');

    try {
      const videoBlob = recordedBlobRef.current;
      
      // Step 1: Transcribe audio
      setProcessingStatus('Transcribing audio...');
      
      let transcript = '';
      try {
        const audioBase64 = await extractAudioFromVideo(videoBlob);
        
        const transcriptionResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ 
              audio: audioBase64,
              mimeType: 'audio/wav'
            })
          }
        );

        if (transcriptionResponse.ok) {
          const transcriptionResult = await transcriptionResponse.json();
          if (transcriptionResult?.text) {
            transcript = transcriptionResult.text;
          }
        }
      } catch (audioError) {
        console.error('Audio extraction error:', audioError);
      }
      
      setProcessingStep(2);
      setProcessingStatus('Extracting frames...');
      
      const frames = await extractFramesFromVideo(videoBlob);
      
      setProcessingStatus('Analyzing video...');
      
      const analysisResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-video`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            videoFrames: frames,
            audioTranscript: transcript,
            projectType: 'Remodeling'
          })
        }
      );

      if (!analysisResponse.ok) {
        throw new Error('Video analysis failed');
      }

      const result = await analysisResponse.json() as VideoAnalysisResult;

      setProcessingStep(3);
      setProcessingStatus('Building estimate...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (result.line_items && result.line_items.length > 0) {
        toast.success(`Detected ${result.line_items.length} items from video`);
      }

      onVideoAnalyzed(result);
      onOpenChange(false);

    } catch (error) {
      console.error('Error processing video:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process video');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  if (isProcessing) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg [&>button]:hidden">
        
          <div className="p-4 text-center">
            <div className="text-5xl mb-4 animate-bounce">🤖</div>
            <h2 className="text-xl font-bold mb-2">AI Processing Video</h2>
            <p className="text-muted-foreground text-sm mb-6">{processingStatus}</p>

            <div className="space-y-3">
              {PROCESSING_STEPS.map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                      processingStep >= s.step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {processingStep > s.step ? (
                      <Check className="w-4 h-4" />
                    ) : processingStep === s.step ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      s.step
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Walk-Through
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Preview */}
          <div 
            className="relative bg-slate-900 rounded-lg overflow-hidden"
            style={{ aspectRatio: '16/9' }}
          >
            {!isRecording && !recordedVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🎥</div>
                  <p>Ready to record</p>
                </div>
              </div>
            )}
            
            {isRecording && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            
            {recordedVideo && !isRecording && (
              <video
                src={recordedVideo}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            )}

            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Tips */}
          {!recordedVideo && !isRecording && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Tips for best results:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {RECORDING_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isRecording && !recordedVideo && (
              <Button onClick={startRecording} size="lg" className="gap-2">
                <Video className="h-5 w-5" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
            
            {recordedVideo && !isRecording && (
              <>
                <Button onClick={handleReRecord} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Re-record
                </Button>
                <Button onClick={processVideo} size="lg" className="gap-2">
                  Analyze Video
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
