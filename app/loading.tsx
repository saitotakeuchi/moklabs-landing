/**
 * Global loading UI
 * Shown while navigating between pages
 */

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-block relative w-20 h-20">
          <div className="absolute border-4 border-blue-200 rounded-full w-20 h-20"></div>
          <div className="absolute border-4 border-[#0013FF] border-t-transparent rounded-full w-20 h-20 animate-spin"></div>
        </div>

        {/* Loading text */}
        <p className="mt-4 text-gray-600 font-medium">Carregando...</p>
      </div>
    </div>
  );
}
