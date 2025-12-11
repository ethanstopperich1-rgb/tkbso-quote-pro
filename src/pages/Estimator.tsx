import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EstimatorProvider, useEstimator } from "@/contexts/EstimatorContext";
import { EstimatorLayout } from "@/components/estimator/EstimatorLayout";
import { toast } from 'sonner';

function EstimatorContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { loadDraft } = useEstimator();
  const resumeId = searchParams.get('resume');

  useEffect(() => {
    if (resumeId) {
      loadDraft(resumeId).then((success) => {
        if (success) {
          toast.success('Draft resumed');
        }
        // Clear the URL param after loading
        setSearchParams({});
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
