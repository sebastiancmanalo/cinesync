import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")

  console.log("Auth callback received:", { code: !!code, error, error_description })

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, error_description)
    const errorUrl = new URL("/auth/auth-code-error", origin)
    errorUrl.searchParams.set("error", error)
    if (error_description) {
      errorUrl.searchParams.set("description", error_description)
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  let next = searchParams.get("next") ?? "/dashboard"
  if (!next.startsWith("/")) {
    next = "/dashboard"
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Session exchange error:", exchangeError)
        const errorUrl = new URL("/auth/auth-code-error", origin)
        errorUrl.searchParams.set("error", "session_exchange_failed")
        errorUrl.searchParams.set("description", exchangeError.message)
        return NextResponse.redirect(errorUrl.toString())
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.id)

        // Check if user exists in auth.users table
        const { data: authUser, error: authError } = await supabase.auth.getUser()
        console.log("Auth user check:", { user: !!authUser.user, error: authError })

        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      const errorUrl = new URL("/auth/auth-code-error", origin)
      errorUrl.searchParams.set("error", "unexpected_error")
      errorUrl.searchParams.set("description", err instanceof Error ? err.message : "Unknown error")
      return NextResponse.redirect(errorUrl.toString())
    }
  }

  console.log("No code provided, redirecting to error page")
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
