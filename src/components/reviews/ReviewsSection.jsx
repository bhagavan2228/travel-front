import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Star, Flag, Reply } from 'lucide-react'
import { destinationApi, commentApi } from '@/api/endpoints'
import { CommentForm } from './CommentForm'
import { ReportDialog } from './ReportDialog'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export function ReviewsSection({ destinationId }) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  const [reportingReview, setReportingReview] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', destinationId],
    queryFn: () => destinationApi.getReviews(destinationId),
  })

  const reviewMutation = useMutation({
    mutationFn: (data) => 
      destinationApi.createReview(destinationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', destinationId] })
      setReplyingTo(null)
    }
  })

  // Simulated nested structure if body contains "@username"
  const processReviews = (rawReviews = []) => {
    return rawReviews
  }

  const processedReviews = processReviews(reviews)

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-brand-600" />
        <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
          Community Reviews
        </h2>
      </div>

      {isAuthenticated ? (
        <div className="mb-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            {replyingTo ? `Replying to ${replyingTo.username}` : 'Write a review'}
            {replyingTo && (
              <button 
                onClick={() => setReplyingTo(null)}
                className="ml-2 text-xs text-brand-600 hover:underline"
              >
                Cancel reply
              </button>
            )}
          </h3>
          <CommentForm 
            isSubmitting={reviewMutation.isPending}
            onSubmit={reviewMutation.mutate}
            placeholder={replyingTo ? `@${replyingTo.username} ` : "Share your experience..."}
          />
        </div>
      ) : (
        <div className="mb-8 p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-sm text-slate-500">
          Please log in to share your experience.
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : processedReviews && processedReviews.length > 0 ? (
        <div className="space-y-4">
          {processedReviews.map((r) => {
            const isReply = r.body?.startsWith('@')
            return (
              <article 
                key={r.id} 
                className={`group p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20 ${
                  isReply ? 'ml-8 bg-slate-50/30 dark:bg-slate-900/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {r.userName || 'Anonymous'}
                    </span>
                    {r.userCredibilityScore !== undefined && (
                      <span className="text-[10px] bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20 px-1.5 py-0.5 rounded-full font-medium">
                        Score: {r.userCredibilityScore}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-2">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  
                  {isAuthenticated && (
                    <button
                      onClick={() => setReportingReview(r.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                      title="Report review"
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {!isReply && (
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`} 
                      />
                    ))}
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white ml-2">{r.title}</h4>
                  </div>
                )}
                
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {r.body}
                </p>

                {isAuthenticated && !isReply && (
                  <div className="mt-3 flex">
                    <button
                      onClick={() => setReplyingTo({ id: r.id, username: r.userName || 'Anonymous' })}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reviews yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to share your experience!</p>
        </div>
      )}

      <ReportDialog 
        isOpen={reportingReview !== null}
        onClose={() => setReportingReview(null)}
        onSubmit={async (reason, description) => {
          if (reportingReview) {
            try {
              await commentApi.report(reportingReview, { reason, description })
            } catch (err) {
              console.error('Failed to report review', err)
            } finally {
              setReportingReview(null)
            }
          }
        }}
      />
    </section>
  )
}
