export default function SectionDivider() {
  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          {/* Main bold border line */}
          <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 shadow-lg rounded-full" />

          {/* Decorative center dot */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg border-3 border-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
}