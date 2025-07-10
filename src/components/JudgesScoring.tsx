import { useState, useMemo } from 'react';
import { ArrowLeft, Users, Trophy, Save, Edit3, Check, X } from 'lucide-react';
import { Competition } from '../lib/supabase';
import { useAthletes } from '../hooks/useAthletes';
import { useEvents } from '../hooks/useEvents';
import { useRoutines, useCreateRoutine, useUpdateRoutine } from '../hooks/useRoutines';

interface JudgesScoringProps {
  competition: Competition;
  onBack: () => void;
}

interface ScoreEntry {
  athleteId: string;
  eventId: string;
  difficultyScore: string;
  executionScore: string;
  deductions: string;
  routineId?: string;
}

export function JudgesScoring({ competition, onBack }: JudgesScoringProps) {
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('female');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data: athletes } = useAthletes();
  const { data: events } = useEvents();
  const { data: routines } = useRoutines(competition.id);
  const createRoutine = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();

  // Filter athletes and events by gender
  const filteredAthletes = useMemo(() => {
    return athletes?.filter(athlete => athlete.gender === activeGender) || [];
  }, [athletes, activeGender]);

  const filteredEvents = useMemo(() => {
    return events?.filter(event => event.gender === activeGender)
      .sort((a, b) => a.display_order - b.display_order) || [];
  }, [events, activeGender]);

  // Create a map of existing routines for quick lookup
  const existingRoutines = useMemo(() => {
    const routineMap: Record<string, any> = {};
    routines?.forEach(routine => {
      const key = `${routine.athlete_id}-${routine.event_id}`;
      routineMap[key] = routine;
    });
    return routineMap;
  }, [routines]);

  const getCellKey = (athleteId: string, eventId: string, field: string) => {
    return `${athleteId}-${eventId}-${field}`;
  };

  const getScoreKey = (athleteId: string, eventId: string) => {
    return `${athleteId}-${eventId}`;
  };

  const getExistingScore = (athleteId: string, eventId: string) => {
    const key = getScoreKey(athleteId, eventId);
    const existing = existingRoutines[key];
    
    if (existing) {
      return {
        difficultyScore: existing.difficulty_score.toFixed(3),
        executionScore: existing.execution_score.toFixed(3),
        deductions: existing.neutral_deductions.toFixed(3),
        finalScore: existing.final_score.toFixed(3),
        routineId: existing.id
      };
    }
    
    return null;
  };

  const updateScore = (athleteId: string, eventId: string, field: keyof ScoreEntry, value: string) => {
    const key = getScoreKey(athleteId, eventId);
    const existing = getExistingScore(athleteId, eventId);
    
    setScores(prev => ({
      ...prev,
      [key]: {
        athleteId,
        eventId,
        difficultyScore: existing?.difficultyScore || '0.000',
        executionScore: existing?.executionScore || '0.000',
        deductions: existing?.deductions || '0.000',
        routineId: existing?.routineId,
        ...prev[key],
        [field]: value
      }
    }));
  };

  const calculateFinalScore = (diffScore: string, execScore: string, deductions: string) => {
    const diff = parseFloat(diffScore) || 0;
    const exec = parseFloat(execScore) || 0;
    const deduct = parseFloat(deductions) || 0;
    return Math.max(0, diff + exec - deduct);
  };

  const saveScore = async (athleteId: string, eventId: string) => {
    const key = getScoreKey(athleteId, eventId);
    const scoreData = scores[key];
    
    if (!scoreData) return;

    setSaving(key);

    try {
      const diffScore = parseFloat(scoreData.difficultyScore) || 0;
      const execScore = parseFloat(scoreData.executionScore) || 0;
      const deductionScore = parseFloat(scoreData.deductions) || 0;
      const finalScore = calculateFinalScore(scoreData.difficultyScore, scoreData.executionScore, scoreData.deductions);

      const routineData = {
        competition_id: competition.id,
        athlete_id: athleteId,
        event_id: eventId,
        difficulty_score: diffScore,
        execution_score: execScore,
        neutral_deductions: deductionScore,
        final_score: finalScore,
        status: 'completed' as const,
      };

      if (scoreData.routineId) {
        // Update existing routine
        await updateRoutine.mutateAsync({
          id: scoreData.routineId,
          ...routineData
        });
      } else {
        // Create new routine
        await createRoutine.mutateAsync(routineData);
      }

      // Clear the score from local state since it's now saved
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[key];
        return newScores;
      });
    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setSaving(null);
    }
  };

  const ScoreCell = ({ 
    athleteId, 
    eventId, 
    field, 
    placeholder, 
    step = "0.001" 
  }: { 
    athleteId: string; 
    eventId: string; 
    field: keyof ScoreEntry; 
    placeholder: string;
    step?: string;
  }) => {
    const cellKey = getCellKey(athleteId, eventId, field);
    const scoreKey = getScoreKey(athleteId, eventId);
    const isEditing = editingCell === cellKey;
    const existing = getExistingScore(athleteId, eventId);
    const currentScore = scores[scoreKey];
    
    let displayValue = '';
    if (field === 'difficultyScore') {
      displayValue = currentScore?.difficultyScore || existing?.difficultyScore || '';
    } else if (field === 'executionScore') {
      displayValue = currentScore?.executionScore || existing?.executionScore || '';
    } else if (field === 'deductions') {
      displayValue = currentScore?.deductions || existing?.deductions || '';
    }

    const hasChanges = currentScore && (
      currentScore.difficultyScore !== (existing?.difficultyScore || '0.000') ||
      currentScore.executionScore !== (existing?.executionScore || '0.000') ||
      currentScore.deductions !== (existing?.deductions || '0.000')
    );

    if (isEditing) {
      return (
        <input
          type="number"
          step={step}
          min="0"
          value={displayValue}
          onChange={(e) => updateScore(athleteId, eventId, field, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditingCell(null);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
      );
    }

    return (
      <div
        onClick={() => setEditingCell(cellKey)}
        className={`px-2 py-1 text-sm cursor-pointer rounded transition-colors ${
          displayValue 
            ? hasChanges 
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200' 
              : 'bg-green-50 text-green-900'
            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
      >
        {displayValue || placeholder}
      </div>
    );
  };

  const FinalScoreCell = ({ athleteId, eventId }: { athleteId: string; eventId: string }) => {
    const scoreKey = getScoreKey(athleteId, eventId);
    const existing = getExistingScore(athleteId, eventId);
    const currentScore = scores[scoreKey];
    
    let finalScore = 0;
    if (currentScore) {
      finalScore = calculateFinalScore(
        currentScore.difficultyScore,
        currentScore.executionScore,
        currentScore.deductions
      );
    } else if (existing) {
      finalScore = parseFloat(existing.finalScore);
    }

    const hasChanges = currentScore && (
      currentScore.difficultyScore !== (existing?.difficultyScore || '0.000') ||
      currentScore.executionScore !== (existing?.executionScore || '0.000') ||
      currentScore.deductions !== (existing?.deductions || '0.000')
    );

    return (
      <div className={`px-2 py-1 text-sm font-semibold rounded ${
        finalScore > 0 
          ? hasChanges 
            ? 'bg-yellow-100 text-yellow-900' 
            : 'bg-blue-100 text-blue-900'
          : 'bg-gray-100 text-gray-500'
      }`}>
        {finalScore > 0 ? finalScore.toFixed(3) : '-'}
      </div>
    );
  };

  const ActionCell = ({ athleteId, eventId }: { athleteId: string; eventId: string }) => {
    const scoreKey = getScoreKey(athleteId, eventId);
    const currentScore = scores[scoreKey];
    const existing = getExistingScore(athleteId, eventId);
    const isSaving = saving === scoreKey;
    
    const hasChanges = currentScore && (
      currentScore.difficultyScore !== (existing?.difficultyScore || '0.000') ||
      currentScore.executionScore !== (existing?.executionScore || '0.000') ||
      currentScore.deductions !== (existing?.deductions || '0.000')
    );

    if (isSaving) {
      return (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (hasChanges) {
      return (
        <div className="flex space-x-1">
          <button
            onClick={() => saveScore(athleteId, eventId)}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
            title="Save changes"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              const key = getScoreKey(athleteId, eventId);
              setScores(prev => {
                const newScores = { ...prev };
                delete newScores[key];
                return newScores;
              });
            }}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Cancel changes"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    if (existing) {
      return (
        <button
          onClick={() => setEditingCell(getCellKey(athleteId, eventId, 'difficultyScore'))}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          title="Edit score"
        >
          <Edit3 size={14} />
        </button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Competition</span>
        </button>
        
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">Judges Scoring</h1>
          <p className="text-gray-600">{competition.name}</p>
        </div>
      </div>

      {/* Gender Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['female', 'male'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setActiveGender(gender)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeGender === gender
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={18} />
              <span>{gender === 'female' ? "Women's Events" : "Men's Events"}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {athletes?.filter(a => a.gender === gender).length || 0}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Scoring Grid */}
      {filteredAthletes.length > 0 && filteredEvents.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Athlete
                  </th>
                  {filteredEvents.map((event) => (
                    <th key={event.id} className="px-3 py-3 text-center border-r border-gray-200">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {event.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ({event.code})
                      </div>
                      <div className="grid grid-cols-5 gap-1 mt-2 text-xs text-gray-400">
                        <div>D</div>
                        <div>E</div>
                        <div>ND</div>
                        <div>Final</div>
                        <div>Action</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAthletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {athlete.first_name} {athlete.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {athlete.club && <span>{athlete.club}</span>}
                        {athlete.level && athlete.club && <span> • </span>}
                        {athlete.level && <span>{athlete.level}</span>}
                      </div>
                    </td>
                    {filteredEvents.map((event) => (
                      <td key={event.id} className="px-3 py-3 border-r border-gray-200">
                        <div className="grid grid-cols-5 gap-1">
                          <ScoreCell
                            athleteId={athlete.id}
                            eventId={event.id}
                            field="difficultyScore"
                            placeholder="D"
                          />
                          <ScoreCell
                            athleteId={athlete.id}
                            eventId={event.id}
                            field="executionScore"
                            placeholder="E"
                          />
                          <ScoreCell
                            athleteId={athlete.id}
                            eventId={event.id}
                            field="deductions"
                            placeholder="ND"
                          />
                          <FinalScoreCell
                            athleteId={athlete.id}
                            eventId={event.id}
                          />
                          <ActionCell
                            athleteId={athlete.id}
                            eventId={event.id}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeGender} athletes found
          </h3>
          <p className="text-gray-500">
            Add athletes to start scoring for this competition.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Scoring Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">D:</span> Difficulty Score
          </div>
          <div>
            <span className="font-medium">E:</span> Execution Score
          </div>
          <div>
            <span className="font-medium">ND:</span> Neutral Deductions
          </div>
          <div>
            <span className="font-medium">Final:</span> D + E - ND
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span>No score entered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span>Unsaved changes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span>Saved score</span>
          </div>
        </div>
      </div>
    </div>
  );
}