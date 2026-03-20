import { MapPin } from 'lucide-react';

interface HeaderProps {
  onAddSpace: () => void;
}

export default function Header({ onAddSpace }: HeaderProps) {
  return (
    <header className="bg-white shadow-md relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0 L60 10 L50 20 L40 10 Z M50 30 L60 40 L50 50 L40 40 Z M50 60 L60 70 L50 80 L40 70 Z M20 15 L30 25 L20 35 L10 25 Z M80 15 L90 25 L80 35 L70 25 Z M20 45 L30 55 L20 65 L10 55 Z M80 45 L90 55 L80 65 L70 55 Z M20 75 L30 85 L20 95 L10 85 Z M80 75 L90 85 L80 95 L70 85 Z"
                    fill="currentColor" className="text-green-600"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-600">Fassah</h1>
              <p className="text-sm text-gray-600">Find your space to pray.</p>
            </div>
          </div>

          <button
            onClick={onAddSpace}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md"
          >
            Add a Prayer Space
          </button>
        </div>

        <div className="mt-6 bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
          <p className="text-green-800 text-sm font-medium">
            Fassah is community powered — if you know a spot, add it.
          </p>
        </div>
      </div>
    </header>
  );
}
