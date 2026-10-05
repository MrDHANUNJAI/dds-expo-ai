import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { communicationApi } from '../../services/communicationApi';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ReviewRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  targetName: string;
  onSuccess?: () => void;
}

export const ReviewRatingModal: React.FC<ReviewRatingModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  targetName,
  onSuccess,
}) => {
  const [overallRating, setOverallRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await communicationApi.submitReview(projectId, {
        overallRating,
        communicationRating,
        qualityRating,
        feedback: feedback.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review & Rate: ${targetName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs text-slate-500">
            For completed project: <strong className="text-slate-800">{projectTitle}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Overall Rating */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Overall Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setOverallRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-slate-700 ml-2">
              {overallRating} / 5
            </span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Communication & Responsiveness
            </label>
            <select
              value={communicationRating}
              onChange={(e) => setCommunicationRating(Number(e.target.value))}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value={5}>5 - Flawless</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Acceptable</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Unacceptable</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Quality of Deliverable
            </label>
            <select
              value={qualityRating}
              onChange={(e) => setQualityRating(Number(e.target.value))}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value={5}>5 - Exceeded Expectations</option>
              <option value={4}>4 - High Quality</option>
              <option value={3}>3 - Satisfactory</option>
              <option value={2}>2 - Needs Revision</option>
              <option value={1}>1 - Defective</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Testimonial & Feedback
          </label>
          <textarea
            rows={4}
            required
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe what made working with this specialist or client great..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || !feedback.trim()}>
            {submitting ? 'Publishing Review...' : 'Publish Official Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
