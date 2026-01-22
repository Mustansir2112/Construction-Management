import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-stone-50">
      <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-stone-900 mb-6 leading-tight">
            Construction Management
            <br />
            <span className="bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              Made Transparent & Secure
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your construction operations with digital work logs,
            real-time attendance tracking, material management, theft prevention
            systems, and integrated GST billing—all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/loginAdmin">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg"
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
            <Link href="/auth/loginWorker">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-stone-300 hover:bg-stone-50 px-8 py-6 text-lg"
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
      </main>
    </div>
  );
}
