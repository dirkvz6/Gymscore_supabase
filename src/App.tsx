import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { CompetitionCard } from './components/CompetitionCard';
import { CreateCompetitionModal } from './components/CreateCompetitionModal';
import { CreateAthleteModal } from './components/CreateAthleteModal';
import { ImportAthletesModal } from './components/ImportAthletesModal';
import { AthleteManagement } from './components/AthleteManagement';
import CompetitionDetail from './components/CompetitionDetail';
import { useAuth } from './hooks/useAuth';
import { useCompetitions } from './hooks/useCompetitions';
import { useAthletes } from './hooks/useAthletes';
import { Competition } from './lib/supabase';
import { Plus, Users, Trophy, Calendar, Upload, Settings } from 'lucide-react';

const queryClient = new QueryClient();

function AppContent() {
  const [showAuth, setShowAuth] = useState(false);
  const [showCreateCompetition, setShowCreateCompetition] = useState(false);
  const [showCreateAthlete, setShowCreateAthlete] = useState(false);
  const [showImportAthletes, setShowImportAthletes] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showAthleteManagement, setShowAthleteManagement] = useState(false);
  const { user } = useAuth();
  const { data: competitions } = useCompetitions();
  const { data: athletes } = useAthletes();

  const upcomingCompetitions = competitions?.filter(c => c.status === 'upcoming') || [];
  const activeCompetitions = competitions?.filter(c => c.status === 'active') || [];
  const completedCompetitions = competitions?.filter(c => c.status === 'completed') || [];

  if (selectedCompetition) {
    return (
      <CompetitionDetail
        competition={selectedCompetition}
        onBack={() => setSelectedCompetition(null)}
      />
    );
  }

  if (showAthleteManagement) {
    return (
      <AthleteManagement
        onBack={() => setShowAthleteManagement(false)}
        onCreateAthlete={() => setShowCreateAthlete(true)}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuth(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gymnastics Competition Manager
          </h1>
          <p className="text-gray-600">
            Scoring system for gymnastics competitions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Competitions</p>
                <p className="text-2xl font-bold text-gray-900">{competitions?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Registered Athletes</p>
                <p className="text-2xl font-bold text-gray-900">{athletes?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Competitions</p>
                <p className="text-2xl font-bold text-gray-900">{activeCompetitions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {user && (
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setShowCreateCompetition(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Create Competition</span>
            </button>
            <button
              onClick={() => setShowCreateAthlete(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={18} />
              <span>Add Athlete</span>
            </button>
            <button
              onClick={() => setShowImportAthletes(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload size={18} />
              <span>Import Athletes</span>
            </button>
            <button
              onClick={() => setShowAthleteManagement(true)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings size={18} />
              <span>Manage Athletes</span>
            </button>
          </div>
        )}

        {/* Competitions Sections */}
        <div className="space-y-8">
          {/* Active Competitions */}
          {activeCompetitions.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Competitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    onClick={() => setSelectedCompetition(competition)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Competitions */}
          {upcomingCompetitions.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Competitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    onClick={() => setSelectedCompetition(competition)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Completed Competitions */}
          {completedCompetitions.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Competitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    onClick={() => setSelectedCompetition(competition)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!competitions?.length && (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first competition to get started with scoring.
              </p>
              {user && (
                <button
                  onClick={() => setShowCreateCompetition(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Competition
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <CreateCompetitionModal
        isOpen={showCreateCompetition}
        onClose={() => setShowCreateCompetition(false)}
      />
      <CreateAthleteModal
        isOpen={showCreateAthlete}
        onClose={() => setShowCreateAthlete(false)}
      />
      <ImportAthletesModal
        isOpen={showImportAthletes}
        onClose={() => setShowImportAthletes(false)}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;