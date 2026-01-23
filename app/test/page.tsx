export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-stone-900">Test Page</h1>
        <p className="text-stone-600">This page loads without any auth context</p>
        <div className="space-y-2">
          <div>Current time: {new Date().toLocaleString()}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
        </div>
        <div className="space-x-4">
          <a href="/" className="text-blue-600 hover:underline">Home</a>
          <a href="/debug" className="text-blue-600 hover:underline">Debug</a>
        </div>
      </div>
    </div>
  );
}