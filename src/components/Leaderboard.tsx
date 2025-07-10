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

    // Group routines by athlete and calculate totals
    const athleteScores = routines.reduce((acc: any, routine: any) => {
      const athleteId = routine.athlete_id;
      const athleteName = `${routine.athlete?.first_name} ${routine.athlete?.last_name}`;
      
      if (!acc[athleteId]) {
        acc[athleteId] = {
          id: athleteId,
          name: athleteName,
          gender: routine.athlete?.gender,
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

    // Convert to array and sort by total score
    return Object.values(athleteScores).sort((a: any, b: any) => b.totalScore - a.totalScore);
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

  if (!leaderboardData.length) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
        <p className="text-gray-500">Scores will appear here as routines are completed.</p>
      </div>
    );
  }

  // Separate leaderboards by gender
  const maleAthletes = leaderboardData.filter((athlete: any) => athlete.gender === 'male');
  const femaleAthletes = leaderboardData.filter((athlete: any) => athlete.gender === 'female');

  const renderLeaderboard = (athletes: any[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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
                  <p className="text-sm text-gray-600">{athlete.eventCount} events</p>
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

  return (
    <div className="space-y-8">
      {maleAthletes.length > 0 && renderLeaderboard(maleAthletes, "Men's All-Around")}
      {femaleAthletes.length > 0 && renderLeaderboard(femaleAthletes, "Women's All-Around")}
    </div>
  );
}