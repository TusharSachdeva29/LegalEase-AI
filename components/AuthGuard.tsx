"use client"

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import firebaseApp from "@/lib/firebase"
import { usePathname, useRouter } from "next/navigation"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(firebaseApp)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      if (!user && pathname !== "/") {
        router.replace("/")
      }
    })
    return () => unsubscribe()
  }, [pathname, router])

  if (loading) return null
  if (!user && pathname !== "/") return null
  return <>{children}</>
}
