import { auth } from "@/auth"
import { createDeal } from "@/app/actions"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { redirect } from "next/navigation"

export default async function SubmitDealPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1 container mx-auto p-4 flex flex-col gap-6 pt-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Deal</CardTitle>
            <CardDescription>
              Share a great deal you found with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createDeal} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">Deal Link (URL)</Label>
                <Input id="url" name="url" type="url" placeholder="https://..." required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Deal Title</Label>
                <Input id="title" name="title" placeholder="Apple MacBook Pro M3..." required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Current Price ($)</Label>
                  <Input id="price" name="price" type="number" step="0.01" placeholder="99.99" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price ($) (Optional)</Label>
                  <Input id="originalPrice" name="originalPrice" type="number" step="0.01" placeholder="149.99" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://.../image.jpg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Tell us more about this deal, valid dates, coupon codes, etc." 
                  className="min-h-[100px]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit">Submit Deal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
