import { useState } from 'react';
import { X, Download, FileText, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useRoutines } from '../hooks/useRoutines';
import { useEvents } from '../hooks/useEvents';
import { Competition } from '../lib/supabase';
import { format } from 'date-fns';

interface ExportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: Competition;
}

export function ExportResultsModal({ isOpen, onClose, competition }: ExportResultsModalProps) {
  const [exportType, setExportType] = useState<'detailed' | 'summary' | 'leaderboard'>('detailed');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  
  const { data: routines } = useRoutines(competition.id);
  const { data: events } = useEvents();

  const generateDetailedResults = () => {
    if (!routines || !events) return [];

    return routines.map((routine: any) => ({
      competition_name: competition.name,
      competition_date: format(new Date(competition.start_date), 'yyyy-MM-dd'),
      athlete_name: `${routine.athlete?.first_name} ${routine.athlete?.last_name}`,
      athlete_gender: routine.athlete?.gender,
      athlete_club: routine.athlete?.club || '',
      athlete_level: routine.athlete?.level || '',
      event_name: routine.event?.name,
      event_code: routine.event?.code,
      difficulty_score: routine.difficulty_score.toFixed(3),
      execution_score: routine.execution_score.toFixed(3),
      neutral_deductions: routine.neutral_deductions.toFixed(3),
      final_score: routine.final_score.toFixed(3),
      status: routine.status,
      performed_at: format(new Date(routine.performed_at), 'yyyy-MM-dd HH:mm:ss'),
      notes: routine.notes || ''
    }));
  };

  const generateSummaryResults = () => {
    if (!routines || !events) return [];

    // Group by athlete and calculate totals
    const athleteScores = routines.reduce((acc: any, routine: any) => {
      const athleteId = routine.athlete_id;
      const athleteName = `${routine.athlete?.first_name} ${routine.athlete?.last_name}`;
      
      if (!acc[athleteId]) {
        acc[athleteId] = {
          competition_name: competition.name,
          competition_date: format(new Date(competition.start_date), 'yyyy-MM-dd'),
          athlete_name: athleteName,
          athlete_gender: routine.athlete?.gender,
          athlete_club: routine.athlete?.club || '',
          athlete_level: routine.athlete?.level || '',
          total_score: 0,
          event_count: 0,
          events: {}
        };
      }

      acc[athleteId].events[routine.event?.code] = routine.final_score.toFixed(3);
      acc[athleteId].total_score += routine.final_score;
      acc[athleteId].event_count += 1;

      return acc;
    }, {});

    // Convert to array and add event scores as columns
    return Object.values(athleteScores).map((athlete: any) => {
      const result: any = {
        competition_name: athlete.competition_name,
        competition_date: athlete.competition_date,
        athlete_name: athlete.athlete_name,
        athlete_gender: athlete.athlete_gender,
        athlete_club: athlete.athlete_club,
        athlete_level: athlete.athlete_level,
        total_score: athlete.total_score.toFixed(3),
        event_count: athlete.event_count
      };

      // Add event scores as separate columns
      events?.forEach(event => {
        result[`${event.code}_score`] = athlete.events[event.code] || '';
      });

      return result;
    });
  };

  const generateLeaderboard = () => {
    if (!routines || !events) return [];

    // Group by athlete and gender, calculate totals
    const athleteScores = routines.reduce((acc: any, routine: any) => {
      const athleteId = routine.athlete_id;
      const athleteName = `${routine.athlete?.first_name} ${routine.athlete?.last_name}`;
      const gender = routine.athlete?.gender;
      
      if (!acc[gender]) {
        acc[gender] = {};
      }

      if (!acc[gender][athleteId]) {
        acc[gender][athleteId] = {
          athlete_name: athleteName,
          athlete_gender: gender,
          athlete_club: routine.athlete?.club || '',
          athlete_level: routine.athlete?.level || '',
          total_score: 0,
          event_count: 0
        };
      }

      acc[gender][athleteId].total_score += routine.final_score;
      acc[gender][athleteId].event_count += 1;

      return acc;
    }, {});

    // Convert to array and add rankings
    const results: any[] = [];
    
    Object.keys(athleteScores).forEach(gender => {
      const athletes = Object.values(athleteScores[gender])
        .sort((a: any, b: any) => b.total_score - a.total_score);

      athletes.forEach((athlete: any, index) => {
        results.push({
          competition_name: competition.name,
          competition_date: format(new Date(competition.start_date), 'yyyy-MM-dd'),
          division: `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s All-Around`,
          rank: index + 1,
          athlete_name: athlete.athlete_name,
          athlete_club: athlete.athlete_club,
          athlete_level: athlete.athlete_level,
          total_score: athlete.total_score.toFixed(3),
          event_count: athlete.event_count
        });
      });
    });

    return results;
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      let data: any[] = [];
      let filename = '';

      switch (exportType) {
        case 'detailed':
          data = generateDetailedResults();
          filename = `${competition.name.replace(/\s+/g, '_')}_detailed_results.csv`;
          break;
        case 'summary':
          data = generateSummaryResults();
          filename = `${competition.name.replace(/\s+/g, '_')}_summary_results.csv`;
          break;
        case 'leaderboard':
          data = generateLeaderboard();
          filename = `${competition.name.replace(/\s+/g, '_')}_leaderboard.csv`;
          break;
      }

      if (data.length === 0) {
        throw new Error('No data to export');
      }

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      setExported(true);
    } catch (error) {
      console.error('Error exporting results:', error);
    } finally {
      setExporting(false);
    }
  };

  const resetModal = () => {
    setExportType('detailed');
    setExporting(false);
    setExported(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Export Results</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {!exported ? (
          <div className="space-y-6">
            {/* Competition Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{competition.name}</h3>
              <p className="text-sm text-gray-600">
                {format(new Date(competition.start_date), 'MMMM d, yyyy')}
                {competition.location && ` • ${competition.location}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {routines?.length || 0} routines recorded
              </p>
            </div>

            {/* Export Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="detailed"
                    checked={exportType === 'detailed'}
                    onChange={(e) => setExportType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Detailed Results</div>
                    <div className="text-sm text-gray-600">
                      Complete routine-by-routine breakdown with all scores and details
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="summary"
                    checked={exportType === 'summary'}
                    onChange={(e) => setExportType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Summary by Athlete</div>
                    <div className="text-sm text-gray-600">
                      Athlete totals with individual event scores in columns
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="leaderboard"
                    checked={exportType === 'leaderboard'}
                    onChange={(e) => setExportType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Leaderboard Rankings</div>
                    <div className="text-sm text-gray-600">
                      Final rankings by division with total scores
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Export Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Export Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Results will be exported as a CSV file that can be opened in Excel, 
                    Google Sheets, or any spreadsheet application.
                  </p>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!routines?.length || exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={18} />
                <span>{exporting ? 'Exporting...' : 'Export Results'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Export Success */
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Complete</h3>
              <p className="text-gray-600">
                Your competition results have been downloaded successfully.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}