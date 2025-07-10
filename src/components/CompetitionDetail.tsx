import { useState } from 'react';
import { ArrowLeft, Users, Trophy, Plus, BarChart3, Download, Calculator } from 'lucide-react';
import { Competition } from '../lib/supabase';
import { useRoutines } from '../hooks/useRoutines';
import { useEvents } from '../hooks/useEvents';
import { ScoreEntry } from './ScoreEntry';
import { Leaderboard } from './Leaderboard';
import { ExportResultsModal } from './ExportResultsModal';
import { JudgesScoring } from './JudgesScoring';

interface CompetitionDetailProps {
  competition: Competition;
  onBack: () => void;
}

export function CompetitionDetail({ competition, onBack }: CompetitionDetailProps) {
  const [activeTab, setActiveTab] = useState<'scoring' | 'judges' | 'leaderboard'>('scoring');
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { data: routines } = useRoutines(competition.id);
  const { data: events } = useEvents();

  const tabs = [
    { id: 'scoring', label: 'Scoring', icon: Trophy },
    { id: 'judges', label: 'Judges Scoring', icon: Calculator },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Competitions</span>
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            disabled={!routines?.length}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={18} />
            <span>Export Results</span>
          </button>
          
          <button
            onClick={() => setShowScoreEntry(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Enter Score</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{competition.name}</h1>
        {competition.location && (
          <p className="text-gray-600 mb-4">{competition.location}</p>
        )}
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
      {activeTab === 'judges' && (
        <JudgesScoring
          competition={competition}
          onBack={() => setActiveTab('scoring')}
        />
      )}

          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>{routines?.length || 0} routines</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy size={16} />
            <span>{events?.length || 0} events</span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'scoring' | 'judges' | 'leaderboard')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'scoring' && (
        <div className="space-y-4">
          {routines && routines.length > 0 ? (
            <div className="grid gap-4">
              {routines.map((routine) => (
                <div key={routine.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {routine.athlete?.first_name} {routine.athlete?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{routine.event?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {routine.final_score.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-500">
                        D: {routine.difficulty_score.toFixed(3)} | 
                        E: {routine.execution_score.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scores yet</h3>
              <p className="text-gray-500">Start by entering the first routine score.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard competitionId={competition.id} />
      )}

      <ScoreEntry
        isOpen={showScoreEntry}
        onClose={() => setShowScoreEntry(false)}
        competitionId={competition.id}
      />
      
      <ExportResultsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        competition={competition}
      />
    </div>
  );
}