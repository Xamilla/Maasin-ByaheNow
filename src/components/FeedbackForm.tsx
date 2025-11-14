import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { projectId } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';
import { publicAnonKey } from '../utils/supabase/info';

interface FeedbackFormProps {
  onNavigate: (page: string) => void;
}

export function FeedbackForm({ onNavigate }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [plateNumber, setPlateNumber] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please login to submit feedback');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-48e0b4cd/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            rating,
            plateNumber,
            comment,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onNavigate('passenger');
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      alert(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => onNavigate('passenger')}
            className="text-white hover:bg-blue-700 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="mb-2">Submit Feedback</h1>
          <p className="text-blue-100">Help us improve the service</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {submitSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-green-900 mb-2">Feedback Submitted!</h2>
                <p className="text-green-700">
                  Thank you for your feedback. Redirecting...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
              <CardDescription>
                Your feedback helps drivers improve their service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center justify-center gap-2 py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-12 h-12 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-600">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </p>
                  )}
                </div>

                {/* Plate Number */}
                <div className="space-y-2">
                  <Label htmlFor="plate">Vehicle Plate Number (Optional)</Label>
                  <Input
                    id="plate"
                    type="text"
                    placeholder="e.g., ABC-1234"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  />
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Comments (Optional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Tell us about your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    Share details about driver courtesy, vehicle condition, or route adherence
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || rating === 0}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        {!submitSuccess && (
          <Card className="mt-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-blue-900 mb-2">Feedback Guidelines</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Be honest and constructive in your feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Rate based on driver courtesy, vehicle condition, and safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Your feedback helps maintain quality service standards</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
