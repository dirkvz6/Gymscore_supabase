import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useCreateAthlete } from '../hooks/useAthletes';

interface ImportAthletesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AthleteCSVRow {
  first_name: string;
  last_name: string;
  gender: 'male' | 'female';
  age?: string;
  club?: string;
  level?: string;
}

export function ImportAthletesModal({ isOpen, onClose }: ImportAthletesModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<AthleteCSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const createAthlete = useCreateAthlete();

  const validAgeGroups = [
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
    '12-13 years',
    '7-8 years',
    '9-10 years',
    '10-11 years'
  ];
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      setErrors(['Please select a valid CSV file']);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [];
        const validData: AthleteCSVRow[] = [];

        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because index starts at 0 and we have a header row

          // Validate required fields
          if (!row.first_name?.trim()) {
            validationErrors.push(`Row ${rowNumber}: First name is required`);
          }
          if (!row.last_name?.trim()) {
            validationErrors.push(`Row ${rowNumber}: Last name is required`);
          }
          if (!row.gender?.trim() || !['male', 'female'].includes(row.gender.toLowerCase())) {
            validationErrors.push(`Row ${rowNumber}: Gender must be 'male' or 'female'`);
          }

          // Validate age format if provided
          if (row.age && row.age.trim()) {
            if (!validAgeGroups.includes(row.age.trim())) {
              validationErrors.push(`Row ${rowNumber}: Age must be one of: ${validAgeGroups.join(', ')}`);
            }
          }

          if (row.first_name?.trim() && row.last_name?.trim() && ['male', 'female'].includes(row.gender?.toLowerCase())) {
            validData.push({
              first_name: row.first_name.trim(),
              last_name: row.last_name.trim(),
              gender: row.gender.toLowerCase() as 'male' | 'female',
              age: row.age?.trim() || undefined,
              club: row.club?.trim() || undefined,
              level: row.level?.trim() || undefined,
            });
          }
        });

        setErrors(validationErrors);
        setCsvData(validData);
      },
      error: (error) => {
        setErrors([`Error parsing CSV: ${error.message}`]);
      }
    });
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;

    setImporting(true);
    let successCount = 0;
    let failedCount = 0;

    for (const athlete of csvData) {
      try {
        await createAthlete.mutateAsync(athlete);
        successCount++;
      } catch (error) {
        failedCount++;
        console.error('Error importing athlete:', error);
      }
    }

    setImportResults({ success: successCount, failed: failedCount });
    setImporting(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
        age: '14+ years',
        club: 'City Gymnastics',
        level: 'Level 10'
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        gender: 'female',
        age: '12 years',
        club: 'Elite Gymnastics',
        level: 'Level 9'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'athletes_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setFile(null);
    setCsvData([]);
    setErrors([]);
    setImportResults(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import Athletes from CSV</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {!importResults ? (
          <div className="space-y-6">
            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900">Download Template</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Download a CSV template with the correct format and example data.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop your CSV file
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* CSV Format Requirements */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Format Requirements</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>first_name</strong> (required): Athlete's first name</li>
                <li>• <strong>last_name</strong> (required): Athlete's last name</li>
                <li>• <strong>gender</strong> (required): 'male' or 'female'</li>
                <li>• <strong>age</strong> (optional): Age group (e.g., '12 years', '7-9 years', '14+ years')</li>
                <li>• <strong>club</strong> (optional): Club or team name</li>
                <li>• <strong>level</strong> (optional): Competition level</li>
              </ul>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Valid age groups:</p>
                <p className="text-xs text-gray-600">
                  {validAgeGroups.join(', ')}
                </p>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-900">Validation Errors</h3>
                    <ul className="mt-2 text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {csvData.length > 0 && errors.length === 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Preview ({csvData.length} athletes ready to import)
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvData.slice(0, 10).map((athlete, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {athlete.first_name} {athlete.last_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 capitalize">{athlete.gender}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{athlete.age || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{athlete.club || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{athlete.level || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvData.length > 10 && (
                    <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500">
                      ... and {csvData.length - 10} more athletes
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Import Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={csvData.length === 0 || errors.length > 0 || importing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {importing ? 'Importing...' : `Import ${csvData.length} Athletes`}
              </button>
            </div>
          </div>
        ) : (
          /* Import Results */
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Complete</h3>
              <div className="space-y-2">
                <p className="text-green-600">
                  ✓ {importResults.success} athletes imported successfully
                </p>
                {importResults.failed > 0 && (
                  <p className="text-red-600">
                    ✗ {importResults.failed} athletes failed to import
                  </p>
                )}
              </div>
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