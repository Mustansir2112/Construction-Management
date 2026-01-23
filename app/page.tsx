import Link from "next/link";

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900">
            BuildTrack
          </h1>
          <p className="text-lg text-stone-600">
            Construction Management Platform
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/loginAdmin" className="block">
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 px-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all">
              Login as Manager
            </button>
          </Link>
          
          <Link href="/auth/loginWorker" className="block">
            <button className="w-full border-2 border-stone-300 hover:bg-stone-50 py-6 px-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all">
              Login as Worker
            </button>
          </Link>
          
          <div className="pt-4 space-x-4 text-sm">
            <Link href="/test" className="text-blue-600 hover:underline">Test Page</Link>
            <Link href="/debug" className="text-blue-600 hover:underline">Debug Info</Link>
          </div>
        </div>
      </div>
    </div>
  );
}