import { ExtendedNovaSubmission } from '../types';
import { Badge } from '@tuturuuu/ui/badge';

interface CriteriaEvaluationProps {
  submission: ExtendedNovaSubmission;
}

export default function CriteriaEvaluation({
  submission,
}: CriteriaEvaluationProps) {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-medium">Evaluation Criteria</h4>
        <Badge>{submission.criteria_score.toFixed(1)} points</Badge>
      </div>

      <div className="space-y-3">
        {submission.criteria.map((criterion, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{criterion.name}</span>
              <Badge variant="outline">
                {criterion.result?.score.toFixed(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {criterion.description}
            </p>
            {criterion.result?.feedback && (
              <div className="bg-muted/50 rounded-sm p-2 text-xs">
                {criterion.result.feedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
