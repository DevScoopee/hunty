"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { getHuntById } from "@/lib/huntStore"

export default function CreatorStatsPage() {
  const params = useParams()
  const router = useRouter()
  const huntId = typeof params.id === "string" ? parseInt(params.id, 10) : NaN
  const [title, setTitle] = useState<string>("")
  const [viewCount, setViewCount] = useState<number | null>(null)

  const loadHunt = useCallback(() => {
    if (Number.isNaN(huntId)) return
    const hunt = getHuntById(huntId)
    if (hunt) {
      setTitle(hunt.title)
    } else {
      setTitle("Unknown Hunt")
    }
  }, [huntId])

  useEffect(() => {
    if (Number.isNaN(huntId)) return

    void (async () => {
      try {
        const res = await fetch(`/api/analytics/hunt-view?huntId=${huntId}`)
        if (!res.ok) return
        const data = await res.json()
        setViewCount(typeof data.views === "number" ? data.views : 0)
      } catch {
        setViewCount(null)
      }
    })()
  }, [huntId])

  useEffect(() => {
    loadHunt()
  }, [loadHunt])

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-[#f9f9ff] pb-12">
      <Header balance="24.2453" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/creator")}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Hunts
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-[#3737A4]" />
          <h1 className="text-3xl font-bold bg-gradient-to-br from-[#3737A4] to-[#0C0C4F] text-transparent bg-clip-text">
            Live Statistics
          </h1>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{title || "Loading…"}</CardTitle>
            <p className="text-sm text-slate-500">Hunt ID: {params.id}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600">
              Live stats (players, completions, leaderboard) will be wired to the contract or indexer here.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Players</p>
                <p className="text-2xl font-bold text-slate-800">—</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Completions</p>
                <p className="text-2xl font-bold text-slate-800">—</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Hunt Views</p>
                <p className="text-2xl font-bold text-slate-800">
                  {viewCount !== null ? viewCount : "—"}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/creator">Back to My Hunts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
