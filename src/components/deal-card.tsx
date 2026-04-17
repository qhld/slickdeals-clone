"use client"

import { useState, useTransition } from "react"
import { ArrowUpIcon, ExternalLinkIcon, MessageSquareIcon } from "lucide-react"
import { upvoteDeal } from "@/app/actions"
import Link from "next/link"
import { Deal } from "@prisma/client"

export function DealCard({ deal }: { deal: Deal }) {
  const [isPending, startTransition] = useTransition()
  const [upvotes, setUpvotes] = useState(deal.upvotes)
  const [hasVoted, setHasVoted] = useState(false)

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating if wrapped in a link later
    if (hasVoted || isPending) return

    setHasVoted(true)
    setUpvotes((prev) => prev + 1)
    
    startTransition(async () => {
      const newCount = await upvoteDeal(deal.id)
      setUpvotes(newCount)
    })
  }

  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition-all overflow-hidden hover:-translate-y-1">
      <Link href={`/deal/${deal.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View Deal Details</span>
      </Link>
      
      {/* Image Section */}
      <div className="aspect-video w-full bg-muted overflow-hidden relative z-10 pointer-events-none">
        {deal.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={deal.imageUrl} alt={deal.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 pointer-events-auto" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex flex-col gap-2 h-full z-10 pointer-events-none">
        <h3 className="font-semibold line-clamp-2 leading-tight pointer-events-auto" title={deal.title}>
          <Link href={`/deal/${deal.id}`} className="hover:underline hover:text-primary">
            {deal.title}
          </Link>
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-red-500 dark:text-red-400">${deal.price.toFixed(2)}</span>
          {deal.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${deal.originalPrice.toFixed(2)}</span>
          )}
        </div>
        
        {/* Action Section */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t pointer-events-auto">
          <div className="flex gap-2">
            <button 
              onClick={handleUpvote}
              disabled={hasVoted || isPending}
              className={`flex items-center transition-colors cursor-pointer rounded-full px-3 py-1 font-medium text-sm
                ${hasVoted 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-primary'}`}
            >
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              <span>{upvotes}</span>
            </button>
            <Link href={`/deal/${deal.id}`} className="flex items-center bg-muted/50 text-muted-foreground hover:bg-muted hover:text-primary transition-colors rounded-full px-3 py-1 font-medium text-sm">
              <MessageSquareIcon className="w-4 h-4 mr-1" />
              Discuss
            </Link>
          </div>
          <a href={deal.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-primary hover:underline">
            Get Deal <ExternalLinkIcon className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  )
}
