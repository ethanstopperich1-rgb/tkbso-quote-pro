import { EstimatorProvider } from "@/contexts/EstimatorContext";
import { EstimatorLayout } from "@/components/estimator/EstimatorLayout";

export default function Estimator() {
  return (
    <EstimatorProvider>
      <EstimatorLayout />
    </EstimatorProvider>
  );
}
