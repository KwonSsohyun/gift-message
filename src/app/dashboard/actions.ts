"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createItem(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await prisma.wishlistItem.create({
    data: {
      title,
      url: String(formData.get("url") ?? "").trim() || null,
      price: String(formData.get("price") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteItem(id: string) {
  await prisma.wishlistItem.delete({ where: { id } });
  revalidatePath("/dashboard");
}
