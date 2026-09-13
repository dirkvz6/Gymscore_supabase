import { Trophy } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              GymnasticsScore
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
