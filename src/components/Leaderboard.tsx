import { Trophy, Medal, Award } from 'lucide-react';
import { useRoutines } from '../hooks/useRoutines';
import { useEvents } from '../hooks/useEvents';
import { useMemo } from 'react';

interface LeaderboardProps {
  competitionId: string;
}

export function Leaderboard({ competitionId }: LeaderboardProps) {
  const { data: routines } = useRoutines(competitionId);
  const { data: events } = useEvents();

  const leaderboardData = useMemo(() => {
    if (!routines || !events) return [];

    // Group routines by athlete, gender, and age group, then calculate totals
    const athleteScores = routines.reduce((acc: any, routine: any) => {
      const athleteId = routine.athlete_id;
      const athleteName = `${routine.athlete?.first_name} ${routine.athlete?.last_name}`;
      
      if (!acc[athleteId]) {
        acc[athleteId] = {
          id: athleteId,
          name: athleteName,
          gender: routine.athlete?.gender,
          age: routine.athlete?.age,
          scores: {},
          totalScore: 0,
          eventCount: 0,
        };
      }

      acc[athleteId].scores[routine.event?.code] = routine.final_score;
      acc[athleteId].totalScore += routine.final_score;
      acc[athleteId].eventCount += 1;

      return acc;
    }, {});

    // Group by gender and age, then sort by total score
    const groupedData: Record<string, Record<string, any[]>> = {};
    
    Object.values(athleteScores).forEach((athlete: any) => {
      const gender = athlete.gender || 'unknown';
      const ageGroup = athlete.age || 'No Age Group';
      
      if (!groupedData[gender]) {
        groupedData[gender] = {};
      }
      
      if (!groupedData[gender][ageGroup]) {
        groupedData[gender][ageGroup] = [];
      }
      
      groupedData[gender][ageGroup].push(athlete);
    });
    
    // Sort athletes within each age group by total score
    Object.keys(groupedData).forEach(gender => {
      Object.keys(groupedData[gender]).forEach(ageGroup => {
        groupedData[gender][ageGroup].sort((a: any, b: any) => b.totalScore - a.totalScore);
      });
    });
    
    return groupedData;
  }, [routines, events]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-yellow-600" />;
      default:
        return <span className="text-gray-500 font-medium">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-yellow-50 border-yellow-100';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (!Object.keys(leaderboardData).length) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
        <p className="text-gray-500">Scores will appear here as routines are completed.</p>
      </div>
    );
  }

  const renderLeaderboard = (athletes: any[], title: string, ageGroup: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {ageGroup} • {athletes.length} athletes
        </span>
      </div>
      <div className="space-y-3">
        {athletes.map((athlete, index) => (
          <div
            key={athlete.id}
            className={`border rounded-lg p-4 ${getRankColor(index + 1)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index + 1)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{athlete.name}</h4>
                  <p className="text-sm text-gray-600">
                    {athlete.eventCount} events
                    {athlete.age && <span> • {athlete.age}</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {athlete.totalScore.toFixed(3)}
                </div>
                <div className="text-sm text-gray-500">Total Score</div>
              </div>
            </div>
            
            {Object.keys(athlete.scores).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {Object.entries(athlete.scores).map(([eventCode, score]) => (
                    <div key={eventCode} className="text-center">
                      <div className="text-sm font-medium text-gray-600">{eventCode}</div>
                      <div className="text-sm text-gray-900">{(score as number).toFixed(3)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Define age group order for consistent display
  const ageGroupOrder = [
    '7-9 years',
    '7-10 years',
    '7-11 years',
    '10 years',
    '11 years',
    '12 years',
    '12-13 years',
    '7-13 years',
    '13 years',
    '14+ years',
    'No Age Group'
  ];

  return (
    <div className="space-y-8">
      {/* Female Athletes by Age Group */}
      {leaderboardData.female && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Women's Divisions
          </h2>
          {ageGroupOrder.map(ageGroup => {
            const athletes = leaderboardData.female[ageGroup];
            if (!athletes || athletes.length === 0) return null;
            
            return (
              <div key={`female-${ageGroup}`}>
                {renderLeaderboard(athletes, "Women's All-Around", ageGroup)}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Male Athletes by Age Group */}
      {leaderboardData.male && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Men's Divisions
          </h2>
          {ageGroupOrder.map(ageGroup => {
            const athletes = leaderboardData.male[ageGroup];
            if (!athletes || athletes.length === 0) return null;
            
            return (
              <div key={`male-${ageGroup}`}>
                {renderLeaderboard(athletes, "Men's All-Around", ageGroup)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}