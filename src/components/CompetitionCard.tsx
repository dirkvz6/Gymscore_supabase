import { Calendar, MapPin, Users, Medal, Settings } from 'lucide-react';
import { Competition } from '../lib/supabase';
import { format } from 'date-fns';

interface CompetitionCardProps {
  competition: Competition;
  onClick: () => void;
  onManage?: () => void;
}

export function CompetitionCard({ competition, onClick, onManage }: CompetitionCardProps) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    upcoming: Calendar,
    ongoing: Users,
    completed: Medal,
    cancelled: Medal,
  };

  const StatusIcon = statusIcons[competition.status];

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 
          onClick={onClick}
          className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex-1"
        >
          {competition.name}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[competition.status]}`}>
            <StatusIcon className="inline w-4 h-4 mr-1" />
            {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
          </span>
          {onManage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManage();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Manage competition"
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>

      <div 
        onClick={onClick}
        className="space-y-3 cursor-pointer"
      >
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
              <span> - {format(new Date(competition.end_date || competition.start_date), 'MMM d, yyyy')}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}