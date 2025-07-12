import { Trophy, Medal, Award } from 'lucide-react';
import { useRoutines } from '../hooks/useRoutines';
import { useEvents } from '../hooks/useEvents';
import { useMemo, useEffect } from 'react';

interface LeaderboardProps {
  competitionId: string;
}

export function Leaderboard({ competitionId }: LeaderboardProps) {
  const { data: routines } = useRoutines(competitionId);
  const { data: events } = useEvents();

  const leaderboardData = useMemo(() => {
    if (!routines || !events) return [];

    console.log('Raw routines data:', routines);
    console.log('Events data:', events);

    // Group routines by athlete, gender, level, and age group, then calculate totals
    const athleteScores = routines.reduce((acc: any, routine: any) => {
      const athleteId = routine.athlete_id;
      const athlete = routine.athletes; // Updated to match the correct relation name
      const event = routine.events; // Updated to match the correct relation name
      const athleteName = `${athlete?.first_name} ${athlete?.last_name}`;
      
      console.log('Processing routine:', {
        athleteId,
        athleteName,
        athlete,
        event,
        finalScore: routine.final_score
      });
      
      if (!acc[athleteId]) {
        acc[athleteId] = {
          id: athleteId,
          name: athleteName,
          gender: athlete?.gender,
          age: athlete?.age,
          level: athlete?.level,
          scores: {},
          totalScore: 0,
          eventCount: 0,
        };
      }

      if (event?.code) {
        acc[athleteId].scores[event.code] = routine.final_score;
      }
      acc[athleteId].totalScore += routine.final_score;
      acc[athleteId].eventCount += 1;

      return acc;
    }, {});

    console.log('Athlete scores:', athleteScores);

    // Group by gender, level, and age, then sort by total score
    const groupedData: Record<string, Record<string, Record<string, any[]>>> = {};
    
    Object.values(athleteScores).forEach((athlete: any) => {
      const gender = athlete.gender || 'unknown';
      const level = athlete.level || 'No Level';
      const ageGroup = athlete.age || 'No Age Group';
      
      if (!groupedData[gender]) {
        groupedData[gender] = {};
      }
      
      if (!groupedData[gender][level]) {
        groupedData[gender][level] = {};
      }
      
      if (!groupedData[gender][level][ageGroup]) {
        groupedData[gender][level][ageGroup] = [];
      }
      
      groupedData[gender][level][ageGroup].push(athlete);
    });
    
    // Sort athletes within each level/age group by total score
    Object.keys(groupedData).forEach(gender => {
      Object.keys(groupedData[gender]).forEach(level => {
        Object.keys(groupedData[gender][level]).forEach(ageGroup => {
          groupedData[gender][level][ageGroup].sort((a: any, b: any) => b.totalScore - a.totalScore);
        });
      });
    });
    
    console.log('Final grouped data:', groupedData);
    return groupedData;
  }, [routines, events]);

  // Debug effect to log data
  useEffect(() => {
    console.log('Leaderboard data updated:', leaderboardData);
  }, [leaderboardData]);

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
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results available</h3>
        <p className="text-gray-500">
          {routines?.length ? 
            `Found ${routines.length} routines but no valid athlete data. Check that athletes and events are properly linked.` :
            'Scores will appear here as routines are completed.'
          }
        </p>
        {routines?.length > 0 && (
          <div className="mt-4 text-sm text-gray-400">
            <p>Debug info: {routines.length} routines, {events?.length || 0} events</p>
          </div>
        )}
      </div>
    );
  }

  const renderLeaderboard = (athletes: any[], title: string, level: string, ageGroup: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {level} • {ageGroup} • {athletes.length} athletes
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
                    {athlete.level && <span>{athlete.level}</span>}
                    {athlete.level && athlete.age && <span> • </span>}
                    {athlete.age && <span>{athlete.age}</span>}
                    <span> • {athlete.eventCount} events</span>
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

  // Define level and age group order for consistent display
  const levelOrder = [
    'Level 1',
    'Level 2', 
    'Level 3',
    'Level 4',
    'Level 5',
    'Level 6',
    'Level 7',
    'Level 8',
    'Level 9',
    'Level 10',
    'Elite',
    'No Level'
  ];

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
      {/* Female Athletes by Level and Age Group */}
      {leaderboardData.female && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Women's Divisions
          </h2>
          {levelOrder.map(level => {
            const levelData = leaderboardData.female[level];
            if (!levelData) return null;

            return (
              <div key={`female-${level}`} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-pink-500 pl-3">
                  {level}
                </h3>
                {ageGroupOrder.map(ageGroup => {
                  const athletes = levelData[ageGroup];
                  if (!athletes || athletes.length === 0) return null;
                  
                  return (
                    <div key={`female-${level}-${ageGroup}`}>
                      {renderLeaderboard(athletes, "Women's All-Around", level, ageGroup)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Male Athletes by Level and Age Group */}
      {leaderboardData.male && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Men's Divisions
          </h2>
          {levelOrder.map(level => {
            const levelData = leaderboardData.male[level];
            if (!levelData) return null;

            return (
              <div key={`male-${level}`} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
                  {level}
                </h3>
                {ageGroupOrder.map(ageGroup => {
                  const athletes = levelData[ageGroup];
                  if (!athletes || athletes.length === 0) return null;
                  
                  return (
                    <div key={`male-${level}-${ageGroup}`}>
                      {renderLeaderboard(athletes, "Men's All-Around", level, ageGroup)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}