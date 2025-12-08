import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Video, Square, RotateCcw, ArrowRight, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ProcessingStep = 1 | 2 | 3;

const PROCESSING_STEPS = [
  { step: 1, title: 'Transcribing Audio', description: 'Converting speech to text' },
  { step: 2, title: 'Analyzing Video Frames', description: 'Identifying fixtures & materials' },
  { step: 3, title: 'Synthesizing Estimate', description: 'Mapping to line items' },
];

const RECORDING_TIPS = [
  'Walk slowly and pan the camera to capture all fixtures',
  'Narrate what you see: "This is a 36-inch vanity, needs replacement"',
  'Mention specific requests: "Client wants quartz counters, soft-close hinges"',
  'Point out concerns: "Water damage under sink, needs subfloor work"',
  'Typical video length: 2-5 minutes',
];

export default function EstimatorVideo() {
  const { contractor } = useAuth();
  const navigate = useNavigate();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(1);

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

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        
        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
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
    setRecordingTime(0);
  };

  const processVideo = async () => {
    if (!recordedVideo || !contractor?.id) {
      toast.error('No video to process');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(1);

    try {
      // Simulate processing steps (in real implementation, this would be API calls)
      // Step 1: Transcribe audio
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProcessingStep(2);
      
      // Step 2: Analyze frames
      await new Promise(resolve => setTimeout(resolve, 3000));
      setProcessingStep(3);
      
      // Step 3: Synthesize estimate
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Video processed successfully!');
      
      // TODO: Navigate to estimate builder with processed data
      // For now, navigate to chat with a message
      navigate('/estimator/chat');

    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo);
      }
    };
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30 p-4 sm:p-6 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6 animate-bounce">🤖</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              AI is Processing Your Video
            </h2>
            <p className="text-muted-foreground mb-8">
              This typically takes 30-60 seconds. We're transcribing your narration and analyzing the visual content.
            </p>

            <div className="max-w-sm mx-auto space-y-4">
              {PROCESSING_STEPS.map((s) => (
                <div key={s.step} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      processingStep >= s.step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {processingStep > s.step ? (
                      <Check className="w-5 h-5" />
                    ) : processingStep === s.step ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      s.step
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/estimator/new')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Video Walk-and-Talk</h1>
            <p className="text-sm text-muted-foreground">
              Record yourself walking through the space
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {/* Video Preview */}
            <div 
              className="relative bg-slate-900 rounded-lg overflow-hidden mb-6"
              style={{ aspectRatio: '16/9' }}
            >
              {!isRecording && !recordedVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎥</div>
                    <p className="text-lg">Ready to record</p>
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
              
              {recordedVideo && (
                <video
                  src={recordedVideo}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-full">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="font-semibold">REC {formatTime(recordingTime)}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isRecording && !recordedVideo && (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 rounded-full"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}
              
              {isRecording && (
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-full"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {recordedVideo && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReRecord}
                    className="rounded-full"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Re-record
                  </Button>
                  <Button
                    size="lg"
                    onClick={processVideo}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full"
                  >
                    Process Video
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg">
              <h4 className="font-semibold text-sky-900 dark:text-sky-100 mb-2">
                Recording Tips:
              </h4>
              <ul className="text-sm text-sky-800 dark:text-sky-200 space-y-1">
                {RECORDING_TIPS.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
