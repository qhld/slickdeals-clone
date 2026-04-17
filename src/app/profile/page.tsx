import { auth } from "@/auth"
import { Navbar } from "@/components/navbar"
import { DealCard } from "@/components/deal-card"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, ActivityIcon, ThumbsUpIcon, MessageSquareIcon } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    include: {
      deals: {
        orderBy: { createdAt: 'desc' }
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: { deal: true }
      }
    }
  })

  if (!user) {
    return <div>User not found</div>
  }

  // Calculate total upvotes received
  const totalUpvotes = user.deals.reduce((sum: number, deal: { upvotes: number }) => sum + deal.upvotes, 0)

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1 container mx-auto p-4 flex flex-col gap-8 pt-8">
        
        {/* Profile Header Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-1 bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{user.name}</div>
              <p className="text-xs text-muted-foreground">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deals Posted</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.deals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments Made</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.comments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upvotes Received</CardTitle>
              <ThumbsUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{totalUpvotes}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Deals Render */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Deals</h2>
          {user.deals.length === 0 ? (
            <p className="text-muted-foreground">You haven't posted any deals yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {user.deals.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>

        {/* User Recent Comments */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          {user.comments.length === 0 ? (
            <p className="text-muted-foreground">No recent comments.</p>
          ) : (
            <div className="bg-card border rounded-xl divide-y">
              {user.comments.slice(0, 5).map((comment: any) => (
                <div key={comment.id} className="p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between line-clamp-1">
                    <span className="text-sm font-medium text-primary line-clamp-1">On: {comment.deal.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
