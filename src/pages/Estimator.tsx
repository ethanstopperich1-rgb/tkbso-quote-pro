import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EstimatorProvider, useEstimator } from "@/contexts/EstimatorContext";
import { EstimatorLayout } from "@/components/estimator/EstimatorLayout";
import { toast } from 'sonner';

function EstimatorContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { loadDraft } = useEstimator();
  const resumeId = searchParams.get('resume');
  const loadAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    // Only attempt to load once per resumeId
    if (resumeId && loadAttemptedRef.current !== resumeId) {
      loadAttemptedRef.current = resumeId;
      
      loadDraft(resumeId).then((success) => {
        if (success) {
          toast.success('Draft resumed successfully');
        } else {
          toast.error('Could not load draft - it may have been deleted');
        }
        // Clear the URL param after loading attempt
        setSearchParams({}, { replace: true });
      });
    }
  }, [resumeId, loadDraft, setSearchParams]);

  return <EstimatorLayout />;
}

export default function Estimator() {
  return (
    <EstimatorProvider>
      <EstimatorContent />
    </EstimatorProvider>
  );
}
