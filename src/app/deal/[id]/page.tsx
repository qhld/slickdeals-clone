import { Navbar } from "@/components/navbar";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { postComment, upvoteDeal } from "@/app/actions";
import { ArrowUpIcon, ExternalLinkIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default async function DealDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!deal) {
    notFound();
  }

  // We need a server action wrapper to bind dealId
  const submitCommentWithId = postComment.bind(null, deal.id)
  const upvoteWithId = upvoteDeal.bind(null, deal.id)

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1 container mx-auto p-4 flex flex-col gap-8 pt-8 max-w-4xl">
        {/* Deal Header */}
        <div className="grid md:grid-cols-2 gap-8 bg-card rounded-xl border overflow-hidden">
          <div className="aspect-square bg-muted relative flex items-center justify-center p-4">
            {deal.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={deal.imageUrl} alt={deal.title} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-muted-foreground">No image provided</span>
            )}
          </div>
          
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">{deal.title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-red-500">${deal.price.toFixed(2)}</span>
                {deal.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">${deal.originalPrice.toFixed(2)}</span>
                )}
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg mb-6">
                <p className="whitespace-pre-wrap text-sm md:text-base">{deal.description || "No specific description provided."}</p>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Posted by {deal.author.name} on {new Date(deal.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a 
                href={deal.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center py-3 rounded-lg font-bold text-lg"
              >
                Go to Deal <ExternalLinkIcon className="w-5 h-5 ml-2" />
              </a>
              
              <form action={upvoteWithId}>
                <button type="submit" className="flex items-center bg-muted hover:bg-muted/80 hover:text-primary transition-colors py-3 px-6 rounded-lg font-bold text-lg">
                  <ArrowUpIcon className="w-5 h-5 mr-2" />
                  {deal.upvotes}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight">Discussion ({deal.comments.length})</h2>
          
          <div className="bg-card rounded-xl border p-4 md:p-6 flex flex-col gap-6">
            {/* List */}
            {deal.comments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {deal.comments.map(c => (
                  <div key={c.id} className="flex gap-4 border-b border-muted pb-4 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="font-bold text-primary">{c.author.name.charAt(0)}</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm">{c.author.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm md:text-base leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}

            {/* Form */}
            {session?.user ? (
              <form action={submitCommentWithId} className="flex flex-col gap-2 pt-4 border-t border-muted">
                <Textarea 
                  name="content" 
                  placeholder="Leave a comment..." 
                  className="min-h-[100px] resize-y" 
                  required 
                />
                <div className="flex justify-end">
                  <Button type="submit">Post Comment</Button>
                </div>
              </form>
            ) : (
              <div className="pt-4 border-t border-muted flex flex-col items-center justify-center py-6 text-center">
                <p className="text-muted-foreground mb-4">You must be logged in to join the discussion.</p>
                <a href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors">
                  Log in to Comment
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
