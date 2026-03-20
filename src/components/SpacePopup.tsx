import { X, Navigation, CheckCircle } from 'lucide-react';
import { Space } from '../lib/supabase';

interface SpacePopupProps {
  space: Space;
  onClose: () => void;
  onCheckIn: (spaceId: string) => void;
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'Outdoor Space':
      return 'bg-green-100 text-green-800';
    case 'Multi-faith Room':
      return 'bg-blue-100 text-blue-800';
    case 'Friendly Business':
      return 'bg-purple-100 text-purple-800';
    case 'Community Home':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getDaysAgo(dateString: string | null): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export default function SpacePopup({ space, onClose, onCheckIn }: SpacePopupProps) {
  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {space.photo_url && (
          <div className="relative h-64">
            <img
              src={space.photo_url}
              alt={space.name}
              className="w-full h-full object-cover rounded-t-xl"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{space.name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(space.type)}`}>
                {space.type}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Address</p>
              <p className="text-gray-900">{space.address}</p>
            </div>

            {space.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">{space.description}</p>
              </div>
            )}

            {space.best_times && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Best Times to Visit</p>
                <p className="text-gray-900">{space.best_times}</p>
              </div>
            )}

            {space.qibla_notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Qibla Direction</p>
                <p className="text-gray-900">{space.qibla_notes}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-1">Last Visited</p>
              <p className="text-gray-900">{getDaysAgo(space.last_checkin)}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDirections}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Navigation className="h-5 w-5" />
              <span>Get Directions</span>
            </button>

            <button
              onClick={() => {
                onCheckIn(space.id);
                onClose();
              }}
              className="flex-1 bg-white hover:bg-gray-50 text-green-600 px-4 py-3 rounded-lg font-medium transition-colors border-2 border-green-600 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Check In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
