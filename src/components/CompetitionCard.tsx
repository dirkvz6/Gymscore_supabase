import { Calendar, MapPin, Users, Medal } from 'lucide-react';
import { Competition } from '../lib/supabase';
import { format } from 'date-fns';

interface CompetitionCardProps {
  competition: Competition;
  onClick: () => void;
}

export function CompetitionCard({ competition, onClick }: CompetitionCardProps) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const statusIcons = {
    upcoming: Calendar,
    active: Users,
    completed: Medal,
  };

  const StatusIcon = statusIcons[competition.status];

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {competition.name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[competition.status]}`}>
          <StatusIcon className="inline w-4 h-4 mr-1" />
          {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        {competition.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{competition.location}</span>
          </div>
        )}
        
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {format(new Date(competition.start_date), 'MMM d, yyyy')}
            {competition.start_date !== competition.end_date && (
              <span> - {format(new Date(competition.end_date), 'MMM d, yyyy')}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}