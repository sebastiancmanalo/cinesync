import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Film, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  searchParams: {
    error?: string
    description?: string
  }
}

export default function AuthCodeErrorPage({ searchParams }: Props) {
  const { error, description } = searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Film className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              WatchTogether
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-slate-300 hover:text-yellow-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          <Card className="bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mb-4 border border-red-400/30">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">Authentication Error</CardTitle>
              <CardDescription className="text-slate-300">
                There was an error signing you in. This could be due to an expired or invalid authentication code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <p className="text-sm font-medium text-red-300 mb-1">Error Code: {error}</p>
                  {description && <p className="text-sm text-red-300">{description}</p>}
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-slate-300 mb-6">
                  Please try signing in again. If the problem persists, contact support.
                </p>
                <div className="space-y-3">
                  <Link href="/login" className="block">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium">
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Debug Information */}
              <div className="text-xs text-slate-500 space-y-1 pt-4 border-t border-slate-600">
                <p>Debug Information:</p>
                <p>Timestamp: {new Date().toISOString()}</p>
                <p>Environment: {process.env.NODE_ENV}</p>
                {error && <p>Error: {error}</p>}
                {description && <p>Description: {description}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
