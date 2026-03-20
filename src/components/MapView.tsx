import { useEffect, useRef, useState } from 'react';
import { Space } from '../lib/supabase';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { Loader2 } from 'lucide-react';

interface MapViewProps {
  spaces: Space[];
  onSpaceClick: (space: Space) => void;
  searchQuery: string;
}

export default function MapView({ spaces, onSpaceClick, searchQuery }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { isLoaded, loadError } = useGoogleMaps();
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 51.5074, lng: -0.1278 },
        zoom: 11,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    spaces.forEach(space => {
      const marker = new google.maps.Marker({
        position: { lat: Number(space.latitude), lng: Number(space.longitude) },
        map: mapInstanceRef.current!,
        title: space.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#16a34a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });

      marker.addListener('click', () => {
        onSpaceClick(space);
      });

      markersRef.current.push(marker);
    });

    if (spaces.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      spaces.forEach(space => {
        bounds.extend({ lat: Number(space.latitude), lng: Number(space.longitude) });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [spaces, isLoaded, onSpaceClick]);

  useEffect(() => {
    if (!searchQuery || !mapInstanceRef.current || !isLoaded) return;

    setIsSearching(true);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery + ', UK' }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results && results[0]) {
        mapInstanceRef.current!.setCenter(results[0].geometry.location);
        mapInstanceRef.current!.setZoom(13);
      }
    });
  }, [searchQuery, isLoaded]);

  if (loadError) {
    return (
      <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load map</p>
          <p className="text-gray-600 text-sm">Please check your Google Maps API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-gray-600">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isSearching && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10 flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
          <span className="text-sm text-gray-600">Searching...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-[600px] rounded-lg" />
    </div>
  );
}
