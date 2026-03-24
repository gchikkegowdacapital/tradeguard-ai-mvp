import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-slate-400" />
          <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            The page you're looking for doesn't exist.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-block px-6 py-2">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
