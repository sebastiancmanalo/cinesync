"use client"

import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [rehydrated, setRehydrated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let unsubscribed = false
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!unsubscribed) {
      setUser(session?.user ?? null)
        setRehydrated(true)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!unsubscribed) {
      setUser(session?.user ?? null)
        setRehydrated(true)
      }
      if (event === "SIGNED_IN") {
        if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "/login")) {
        router.push("/dashboard")
        }
      } else if (event === "SIGNED_OUT") {
        router.push("/")
      }
    })

    return () => {
      unsubscribed = true
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  useEffect(() => {
    if (rehydrated) setLoading(false)
  }, [rehydrated])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signOut,
  }
}
