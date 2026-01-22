import Link from "next/link";
import { Button } from "@/components/ui/button";

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
            <Button
              size="lg"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Login as Manager
            </Button>
          </Link>
          
          <Link href="/auth/loginWorker" className="block">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-stone-300 hover:bg-stone-50 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Login as Worker
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}