import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Video, Square, RotateCcw, ArrowRight, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ProcessingStep = 1 | 2 | 3;

interface DetectedLineItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  confidence: number;
  source: string;
}

interface VideoAnalysisResult {
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

const PROCESSING_STEPS = [
  { step: 1, title: 'Transcribing Audio', description: 'Converting speech to text with Whisper' },
  { step: 2, title: 'Analyzing Video Frames', description: 'Identifying fixtures & materials with AI' },
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
        
        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start(1000); // Capture in 1-second chunks
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
          
          // Convert to mono
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
          
          // Convert to 16-bit PCM
          const pcmData = new Int16Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            const s = Math.max(-1, Math.min(1, channelData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Create WAV file
          const wavBuffer = createWavFile(pcmData, sampleRate);
          const base64 = arrayBufferToBase64(wavBuffer);
          
          URL.revokeObjectURL(video.src);
          resolve(base64);
        } catch (err) {
          // Fallback: send the whole video as audio
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
    
    // WAV header
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
    
    // Write PCM data
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

  // Extract frames from video
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
        
        // Limit to 10 frames max
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
    if (!recordedBlobRef.current || !contractor?.id) {
      toast.error('No video to process');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(1);
    setProcessingStatus('Extracting audio...');

    try {
      const videoBlob = recordedBlobRef.current;
      
      // Step 1: Transcribe audio
      setProcessingStatus('Transcribing audio with Whisper...');
      
      let transcript = '';
      try {
        // Extract audio and convert to base64
        const audioBase64 = await extractAudioFromVideo(videoBlob);
        
        // Call transcribe-audio edge function
        const { data: transcriptionResult, error: transcriptionError } = await supabase.functions.invoke('transcribe-audio', {
          body: { 
            audio: audioBase64,
            mimeType: 'audio/wav'
          }
        });

        if (transcriptionError) {
          console.error('Transcription error:', transcriptionError);
          toast.error('Audio transcription failed, continuing with video analysis only');
        } else if (transcriptionResult?.text) {
          transcript = transcriptionResult.text;
          console.log('Transcript:', transcript);
        }
      } catch (audioError) {
        console.error('Audio extraction error:', audioError);
        // Continue without transcript
      }
      
      setProcessingStep(2);
      setProcessingStatus('Extracting video frames...');
      
      // Step 2: Extract frames and analyze
      const frames = await extractFramesFromVideo(videoBlob);
      console.log(`Extracted ${frames.length} frames`);
      
      setProcessingStatus('Analyzing video with AI...');
      
      // Call process-video edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('process-video', {
        body: {
          videoFrames: frames,
          audioTranscript: transcript,
          projectType: 'Remodeling'
        }
      });

      if (analysisError) {
        console.error('Video analysis error:', analysisError);
        throw new Error('Video analysis failed');
      }

      setProcessingStep(3);
      setProcessingStatus('Building estimate...');
      
      // Short delay to show final step
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = analysisResult as VideoAnalysisResult;
      console.log('Analysis result:', result);

      // Store results and navigate to chat with pre-filled data
      if (result.line_items && result.line_items.length > 0) {
        toast.success(`Detected ${result.line_items.length} items from video`);
        
        // Navigate to chat with video analysis context
        navigate('/estimator/chat', {
          state: {
            videoAnalysis: result,
            initialMessage: result.project_summary || 'Video analysis complete. Review detected items.'
          }
        });
      } else {
        toast.warning('No items detected. Try recording with more detail.');
        navigate('/estimator/chat', {
          state: {
            videoAnalysis: result,
            initialMessage: transcript || 'Video processed but no items detected. Please describe the project.'
          }
        });
      }

    } catch (error) {
      console.error('Error processing video:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process video');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
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
            <p className="text-muted-foreground mb-2">
              {processingStatus || 'Processing...'}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              This typically takes 30-60 seconds.
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
