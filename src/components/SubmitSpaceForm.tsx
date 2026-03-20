import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { submitSpace } from '../lib/supabase';
import { useGoogleMaps } from '../hooks/useGoogleMaps';

interface SubmitSpaceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LOCATION_TYPES = [
  'Outdoor Space',
  'Multi-faith Room',
  'Friendly Business',
  'Community Home',
  'Other'
];

export default function SubmitSpaceForm({ onClose, onSuccess }: SubmitSpaceFormProps) {
  const { isLoaded } = useGoogleMaps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: LOCATION_TYPES[0],
    description: '',
    best_times: '',
    qibla_notes: '',
    photo_url: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!isLoaded) {
      setError('Google Maps is still loading. Please wait.');
      setIsSubmitting(false);
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode({ address: formData.address + ', UK' }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Unable to find location. Please check the address.'));
          }
        });
      });

      const location = result.geometry.location;

      const success = await submitSpace({
        name: formData.name,
        address: formData.address,
        latitude: location.lat(),
        longitude: location.lng(),
        type: formData.type,
        description: formData.description,
        best_times: formData.best_times,
        qibla_notes: formData.qibla_notes,
        photo_url: formData.photo_url || undefined
      });

      if (success) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to submit space. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Add a Prayer Space</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-green-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Location Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Hyde Park Corner"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Full address or postcode"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Location Type *
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {LOCATION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tell people what to expect..."
            />
          </div>

          <div>
            <label htmlFor="best_times" className="block text-sm font-medium text-gray-700 mb-1">
              Best Times to Visit
            </label>
            <input
              type="text"
              id="best_times"
              value={formData.best_times}
              onChange={(e) => setFormData({ ...formData, best_times: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Early morning or after sunset"
            />
          </div>

          <div>
            <label htmlFor="qibla_notes" className="block text-sm font-medium text-gray-700 mb-1">
              Qibla Notes
            </label>
            <input
              type="text"
              id="qibla_notes"
              value={formData.qibla_notes}
              onChange={(e) => setFormData({ ...formData, qibla_notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Which direction roughly faces Qibla?"
            />
          </div>

          <div>
            <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL
            </label>
            <input
              type="url"
              id="photo_url"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Your submission will be reviewed before appearing on the map. Thank you for contributing to the community!
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
