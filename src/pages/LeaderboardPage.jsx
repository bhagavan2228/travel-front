import { useQuery } from '@tanstack/react-query'
import { Trophy, Award, CheckCircle, ThumbsUp, Star, ShieldCheck, Zap, Sparkles } from 'lucide-react'
import { credibilityApi } from '@/api/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'

export function LeaderboardPage() {
  const { user: currentUser } = useAuth()

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => credibilityApi.leaderboard(),
  })

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-full" />
        <div className="space-y-3 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold shadow-lg shadow-yellow-500/35 border-2 border-white dark:border-slate-900 animate-bounce">
            <Trophy className="h-5 w-5" />
          </span>
        )
      case 2:
        return (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-slate-300 to-slate-400 text-white font-bold shadow-lg shadow-slate-400/35 border-2 border-white dark:border-slate-900">
            <Award className="h-4.5 w-4.5" />
          </span>
        )
      case 3:
        return (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-lg shadow-amber-700/35 border-2 border-white dark:border-slate-900">
            <Award className="h-4.5 w-4.5" />
          </span>
        )
      case 4:
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold shadow-md shadow-amber-500/25 border-2 border-white dark:border-slate-900">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
        )
      case 5:
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold shadow-md shadow-pink-500/25 border-2 border-white dark:border-slate-900">
            <Zap className="h-3.5 w-3.5" />
          </span>
        )
      default:
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs border border-slate-200 dark:border-slate-700">
            {rank}
          </span>
        )
    }
  }

  // Top 5 users extraction
  const topFive = leaderboard ? leaderboard.slice(0, 5) : []

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-pink-500/10 text-pink-700 dark:text-pink-300 text-xs font-semibold mb-3 border border-pink-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Community Trust Rankings
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
            Credibility Leaderboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Recognizing our community's most helpful explorers. Write high-quality, non-toxic reviews
            and resolve reported issues to boost your score and unlock features.
          </p>
        </div>

        {/* Podium and Spotlight for Top 5 */}
        {topFive.length > 0 && (
          <div className="space-y-6 mb-12">
            {/* Top 3 Podium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Rank 2 (Silver) */}
              {topFive[1] && (
                <div className="order-2 md:order-1 glass-strong rounded-3xl p-6 text-center relative border border-slate-100 dark:border-white/5 pt-12 shadow-md">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    {getRankBadge(2)}
                  </div>
                  <p className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                    {topFive[1].userName}
                  </p>
                  <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <Star className="h-3.5 w-3.5 text-slate-400 fill-slate-400" />
                    Score: <span className="font-semibold text-slate-700 dark:text-slate-300">{topFive[1].score}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-white/5 pt-4">
                    <div>
                      <p className="text-slate-400">Reviews</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{topFive[1].totalReviews}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Helpful</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{topFive[1].helpfulReviews}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold) */}
              {topFive[0] && (
                <div className="order-1 md:order-2 glass-strong rounded-3xl p-8 text-center relative border-2 border-yellow-500/25 dark:border-yellow-400/20 pt-16 md:pb-10 shadow-xl shadow-yellow-500/5">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 scale-110">
                    {getRankBadge(1)}
                  </div>
                  <p className="font-bold text-xl text-slate-900 dark:text-white mb-1">
                    {topFive[0].userName}
                  </p>
                  <div className="flex justify-center items-center gap-1.5 text-sm text-yellow-600 dark:text-yellow-400 mb-5 font-bold">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    Score: <span className="text-lg">{topFive[0].score}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 dark:border-white/5 pt-5">
                    <div>
                      <p className="text-slate-400">Reviews</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{topFive[0].totalReviews}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Helpful</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{topFive[0].helpfulReviews}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Resolved</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{topFive[0].reportsResolved}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {topFive[2] && (
                <div className="order-3 glass-strong rounded-3xl p-6 text-center relative border border-slate-100 dark:border-white/5 pt-12 shadow-md">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    {getRankBadge(3)}
                  </div>
                  <p className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                    {topFive[2].userName}
                  </p>
                  <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <Star className="h-3.5 w-3.5 text-amber-700 fill-amber-700" />
                    Score: <span className="font-semibold text-slate-700 dark:text-slate-300">{topFive[2].score}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-white/5 pt-4">
                    <div>
                      <p className="text-slate-400">Reviews</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{topFive[2].totalReviews}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Helpful</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{topFive[2].helpfulReviews}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rank 4 & 5 Row */}
            {(topFive[3] || topFive[4]) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Rank 4 */}
                {topFive[3] && (
                  <div className="glass-strong rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-white/5 relative pl-14 shadow-sm">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      {getRankBadge(4)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {topFive[3].userName}
                      </p>
                      <p className="text-xs text-slate-400">
                        Reviews: {topFive[3].totalReviews} • Helpful: {topFive[3].helpfulReviews}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Score</span>
                      <p className="font-bold text-slate-900 dark:text-white">{topFive[3].score}</p>
                    </div>
                  </div>
                )}

                {/* Rank 5 */}
                {topFive[4] && (
                  <div className="glass-strong rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-white/5 relative pl-14 shadow-sm">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      {getRankBadge(5)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {topFive[4].userName}
                      </p>
                      <p className="text-xs text-slate-400">
                        Reviews: {topFive[4].totalReviews} • Helpful: {topFive[4].helpfulReviews}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-pink-600 dark:text-pink-400">Score</span>
                      <p className="font-bold text-slate-900 dark:text-white">{topFive[4].score}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Full Rankings List */}
        <div className="glass-strong rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/35">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Explorer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                    Score
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                    Total Reviews
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                    Helpful Votes
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                    Resolved Reports
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {leaderboard?.map((item) => {
                  const isSelf = currentUser && item.userId === currentUser.userId
                  return (
                    <tr
                      key={item.userId}
                      className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02] ${
                        isSelf ? 'bg-pink-500/[0.04] font-medium' : ''
                      }`}
                    >
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex justify-center">{getRankBadge(item.rank)}</div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-950 dark:text-slate-50">
                            {item.userName}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] bg-gradient-to-r from-pink-500 to-rose-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm shadow-rose-500/20">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-center text-sm font-semibold text-pink-600 dark:text-pink-400">
                        {item.score}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-400">
                        {item.totalReviews}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center justify-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-slate-400" />
                          {item.helpfulReviews}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          {item.reportsResolved}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
