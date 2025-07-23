
export function LoadingSpinner() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-quantum-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-quantum-600">Loading...</p>
    </div>
  );
}
