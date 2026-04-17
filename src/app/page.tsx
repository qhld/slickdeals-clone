import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { DealCard } from "@/components/deal-card";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function Home(props: {
  searchParams?: Promise<{ query?: string; sort?: string; page?: string }>
}) {
  const session = await auth();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const query = searchParams.query || "";
  const sort = searchParams.sort || "new"; // "new" or "hot"
  
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;

  const whereClause = query ? { title: { contains: query } } : undefined;

  const [deals, totalDeals] = await Promise.all([
    prisma.deal.findMany({
      where: whereClause,
      orderBy: sort === "hot" ? { upvotes: "desc" } : { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.deal.count({
      where: whereClause,
    })
  ]);

  const totalPages = Math.ceil(totalDeals / pageSize);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1 container mx-auto p-4 flex flex-col gap-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl font-bold font-sans tracking-tight">
              {query ? `Search results for "${query}"` : "Frontpage Deals"}
            </h1>
            <p className="text-muted-foreground">The community's best current deals, vetted and voted by users.</p>
          </div>
          
          {/* Sorting Tabs */}
          {!query && (
            <div className="flex bg-muted p-1 rounded-lg self-start md:self-auto">
              <Link 
                href="/?sort=new"
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  sort === "new" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Newest
              </Link>
              <Link 
                href="/?sort=hot"
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  sort === "hot" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Hot Deals
              </Link>
            </div>
          )}
        </div>
        
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 lg:p-24 border rounded-xl border-dashed bg-muted/20 text-center">
            <h2 className="text-xl font-semibold mb-2">No deals found!</h2>
            <p className="text-muted-foreground mb-6">
              {query ? "Try adjusting your search keywords." : "Be the first to share an amazing deal with the community."}
            </p>
            {query ? (
              <Link href="/" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center">
                Clear Search
              </Link>
            ) : (
              <Link href="/submit" className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center">
                Submit a Deal Now
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {deals.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                {page > 1 && (
                  <Link 
                    href={`/?${new URLSearchParams({ ...(query && {query}), ...(sort && {sort}), page: (page - 1).toString() }).toString()}`}
                    className="border px-4 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors bg-card"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-muted-foreground px-4 font-medium">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link 
                    href={`/?${new URLSearchParams({ ...(query && {query}), ...(sort && {sort}), page: (page + 1).toString() }).toString()}`}
                    className="border px-4 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors bg-card"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
