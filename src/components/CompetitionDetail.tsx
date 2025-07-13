import React, { useState } from 'react';
import { Competition } from '../lib/supabase';
import { ArrowLeft, Users, Trophy, FileDown, Gavel } from 'lucide-react';
import { ScoreEntry } from './ScoreEntry';
import { JudgesScoring } from './JudgesScoring';
import { Leaderboard } from './Leaderboard';
import { ExportResultsModal } from './ExportResultsModal';
import { AthleteManagement } from './AthleteManagement';

interface CompetitionDetailProps {
  competition: Competition;
  onBack: () => void;
}

type ActiveTab = 'athletes' | 'scoring' | 'judges' | 'leaderboard' | 'export';

export default function CompetitionDetail({ competition, onBack }: CompetitionDetailProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('athletes');
  const [showExportModal, setShowExportModal] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const tabs = [
    { id: 'athletes' as const, label: 'Manage Athletes', icon: Users },
    { id: 'scoring' as const, label: 'Score Entry', icon: Trophy },
    { id: 'judges' as const, label: 'Judges Scoring', icon: Gavel },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { id: 'export' as const, label: 'Export Results', icon: FileDown },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'athletes':
        return <AthleteManagement onBack={() => setActiveTab('athletes')} onCreateAthlete={() => {}} />;
      case 'scoring':
        return <ScoreEntry competitionId={competition.id} />;
      case 'judges':
        return <JudgesScoring competition={competition} onBack={() => setActiveTab('judges')} />;
      case 'leaderboard':
        return <Leaderboard competitionId={competition.id} />;
      case 'export':
        return (
          <div className="text-center py-12">
            <FileDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Export Competition Results</h3>
            <p className="text-gray-600 mb-6">Download competition data and results in various formats.</p>
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Export Options
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Competitions
              </button>
              <div className="h-6 border-l border-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{competition.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                    {competition.status?.charAt(0).toUpperCase() + competition.status?.slice(1)}
                  </span>
                  {competition.location && (
                    <span className="text-sm text-gray-600">{competition.location}</span>
                  )}
                  <span className="text-sm text-gray-600">
                    {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportResultsModal
          isOpen={showExportModal}
          competition={competition}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}