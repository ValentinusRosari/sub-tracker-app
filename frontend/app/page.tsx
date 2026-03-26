import Link from "next/link";
import { Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <Activity className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
          Take Control of Your <span className="text-blue-600">Subscriptions</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Track your monthly expenses, get notified before due dates, and never pay for unwanted
          services again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Get Started for Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
