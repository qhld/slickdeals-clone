"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "./ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar({ user }: { user?: { name?: string | null } | null }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?query=${encodeURIComponent(query)}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-primary">SlickClone</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <form className="w-full flex-1 md:w-auto md:flex-none" onSubmit={handleSearch}>
            <input 
              type="search" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deals..." 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </form>
          <nav className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Link href="/submit" className={buttonVariants({ variant: "default", size: "sm", className: "hidden sm:inline-flex" })}>
                  + Post Deal
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 outline-none px-2 py-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer select-none">
                    <span className="truncate max-w-[100px] md:max-w-[150px] text-foreground font-semibold">Hi, {user.name}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onSelect={() => router.push('/profile')} className="cursor-pointer">
                      My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push('/submit')} className="sm:hidden cursor-pointer font-medium text-primary">
                      Post Deal
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Link href="/login" className="text-muted-foreground hover:text-foreground">Log In</Link>
                <Link href="/register" className={buttonVariants({ variant: "default", size: "sm" })}>Sign up</Link>
              </div>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
