import { useState } from 'react';
import { X, User, Trophy, Hash } from 'lucide-react';
import { useAthletes } from '../hooks/useAthletes';
import { useEvents } from '../hooks/useEvents';
import { useCreateRoutine } from '../hooks/useRoutines';

interface ScoreEntryProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
}

export function ScoreEntry({ isOpen, onClose, competitionId }: ScoreEntryProps) {
  const [athleteId, setAthleteId] = useState('');
  const [eventId, setEventId] = useState('');
  const [difficultyScore, setDifficultyScore] = useState('');
  const [executionScore, setExecutionScore] = useState('');
  const [deductions, setDeductions] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { data: athletes } = useAthletes();
  const { data: events } = useEvents();
  const createRoutine = useCreateRoutine();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const diffScore = parseFloat(difficultyScore) || 0;
      const execScore = parseFloat(executionScore) || 0;
      const deductionScore = parseFloat(deductions) || 0;
      const finalScore = diffScore + execScore - deductionScore;

      await createRoutine.mutateAsync({
        competition_id: competitionId,
        athlete_id: athleteId,
        event_id: eventId,
        difficulty_score: diffScore,
        execution_score: execScore,
        neutral_deductions: deductionScore,
        final_score: finalScore,
        status: 'completed',
      });

      onClose();
      setAthleteId('');
      setEventId('');
      setDifficultyScore('');
      setExecutionScore('');
      setDeductions('');
    } catch (error) {
      console.error('Error creating routine:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Enter Score</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Athlete
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select an athlete</option>
                {athletes?.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.first_name} {athlete.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event
            </label>
            <div className="relative">
              <Trophy className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select an event</option>
                {events?.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.gender})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Score
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={difficultyScore}
                  onChange={(e) => setDifficultyScore(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Execution Score
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="10"
                  value={executionScore}
                  onChange={(e) => setExecutionScore(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.000"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deductions (Optional)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.001"
                min="0"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Score'}
          </button>
        </form>
      </div>
    </div>
  );
}