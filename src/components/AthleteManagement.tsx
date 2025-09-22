import { useState } from 'react';
import { ArrowLeft, Users, Search, Trash2, Edit, Plus, Check, X, User, Hash } from 'lucide-react';
import { useAthletes, useDeleteAthlete, useUpdateAthlete } from '../hooks/useAthletes';
import { Athlete } from '../lib/supabase';

interface AthleteManagementProps {
  onBack: () => void;
  onCreateAthlete: () => void;
}

export function AthleteManagement({ onBack, onCreateAthlete }: AthleteManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Athlete>>({});
  
  const { data: athletes } = useAthletes();
  const deleteAthlete = useDeleteAthlete();
  const updateAthlete = useUpdateAthlete();

  const ageGroups = [
    '7-9 years',
    '7-10 years',
    '7-11 years',
    '7-13 years',
    '9 years',
	'10 years',
    '11 years',
    '12 years',
    '13 years',
    '14+ years',
    '12-13 years'
	'7-8 years',
	'9-10 years',
	'10-11 years',
  ];

  // Filter athletes based on search and gender
  const filteredAthletes = athletes?.filter(athlete => {
    const matchesSearch = searchTerm === '' || 
      `${athlete.first_name} ${athlete.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.level?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = selectedGender === 'all' || athlete.gender === selectedGender;
    
    return matchesSearch && matchesGender;
  }) || [];

  const handleDelete = async (athleteId: string) => {
    try {
      await deleteAthlete.mutateAsync(athleteId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting athlete:', error);
    }
  };

  const startEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete.id);
    setEditForm({
      first_name: athlete.first_name,
      last_name: athlete.last_name,
      gender: athlete.gender,
      age: athlete.age,
      club: athlete.club,
      level: athlete.level,
    });
  };

  const cancelEdit = () => {
    setEditingAthlete(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingAthlete) return;

    try {
      await updateAthlete.mutateAsync({
        id: editingAthlete,
        ...editForm,
      });
      setEditingAthlete(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating athlete:', error);
    }
  };

  const maleCount = athletes?.filter(a => a.gender === 'male').length || 0;
  const femaleCount = athletes?.filter(a => a.gender === 'female').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <button
          onClick={onCreateAthlete}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Athlete</span>
        </button>
      </div>

      {/* Title and Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Athlete Management</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>{athletes?.length || 0} total athletes</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{athletes?.length || 0}</div>
            <div className="text-sm text-blue-700">Total Athletes</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{maleCount}</div>
            <div className="text-sm text-green-700">Male Athletes</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{femaleCount}</div>
            <div className="text-sm text-purple-700">Female Athletes</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search athletes by name, club, or level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Gender Filter */}
          <div className="sm:w-48">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as 'all' | 'male' | 'female')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      {filteredAthletes.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Athlete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAthletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingAthlete === athlete.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.first_name || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="First name"
                          />
                          <input
                            type="text"
                            value={editForm.last_name || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Last name"
                          />
                        </div>
                      ) : (
                        <div className="font-medium text-gray-900">
                          {athlete.first_name} {athlete.last_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingAthlete === athlete.id ? (
                        <select
                          value={editForm.gender || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          athlete.gender === 'male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {athlete.gender.charAt(0).toUpperCase() + athlete.gender.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingAthlete === athlete.id ? (
                        <select
                          value={editForm.age || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value || undefined }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select age group</option>
                          {ageGroups.map((ageGroup) => (
                            <option key={ageGroup} value={ageGroup}>
                              {ageGroup}
                            </option>
                          ))}
                        </select>
                      ) : (
                        athlete.age || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingAthlete === athlete.id ? (
                        <input
                          type="text"
                          value={editForm.club || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, club: e.target.value || undefined }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Club name"
                        />
                      ) : (
                        athlete.club || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingAthlete === athlete.id ? (
                        <input
                          type="text"
                          value={editForm.level || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value || undefined }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Level"
                        />
                      ) : (
                        athlete.level || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {editingAthlete === athlete.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              disabled={updateAthlete.isPending}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Save changes"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                              title="Cancel editing"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(athlete)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Edit athlete"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(athlete.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete athlete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedGender !== 'all' ? 'No athletes found' : 'No athletes yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedGender !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Add your first athlete to get started.'
            }
          </p>
          {(!searchTerm && selectedGender === 'all') && (
            <button
              onClick={onCreateAthlete}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Athlete
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Athlete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this athlete? This action cannot be undone and will also remove all associated scores and routines.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteAthlete.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteAthlete.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}