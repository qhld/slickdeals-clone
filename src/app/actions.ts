"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"

// ----------------------------------------
// AUTH ACTIONS
// ----------------------------------------

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    throw new Error("Missing credentials")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  })

  redirect("/login")
}

// ----------------------------------------
// INTERACTION ACTIONS
// ----------------------------------------

export async function createDeal(formData: FormData) {
  const session = await auth()
  // @ts-ignore
  if (!session?.user?.id) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const url = formData.get("url") as string
  const price = parseFloat(formData.get("price") as string)
  const originalPriceStr = formData.get("originalPrice") as string
  const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : null
  const imageUrl = formData.get("imageUrl") as string
  const description = formData.get("description") as string

  if (!title || !url || isNaN(price)) throw new Error("Missing required fields")

  await prisma.deal.create({
    data: {
      title, url, originalPrice, price, imageUrl, description,
      // @ts-ignore
      authorId: session.user.id
    }
  })

  revalidatePath("/")
  redirect("/")
}

export async function upvoteDeal(dealId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("You must be logged in to vote")

  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: { upvotes: { increment: 1 } },
  })
  
  revalidatePath("/")
  revalidatePath(`/deal/${dealId}`)
  return deal.upvotes
}

export async function postComment(dealId: string, formData: FormData) {
  const session = await auth()
  // @ts-ignore
  if (!session?.user?.id) throw new Error("You must be logged in to comment")

  const content = formData.get("content") as string
  if (!content) return

  await prisma.comment.create({
    data: {
      content,
      dealId,
      // @ts-ignore
      authorId: session.user.id
    }
  })

  revalidatePath(`/deal/${dealId}`)
}
