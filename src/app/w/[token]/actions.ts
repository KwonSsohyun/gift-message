"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ReserveState = {
  error?: string;
};

export async function reserveItem(
  token: string,
  itemId: string,
  _prevState: ReserveState,
  formData: FormData,
): Promise<ReserveState> {
  if (!process.env.WISHLIST_SHARE_TOKEN || token !== process.env.WISHLIST_SHARE_TOKEN) {
    return { error: "잘못된 링크예요." };
  }

  const reserverName = String(formData.get("name") ?? "").trim();
  if (!reserverName) {
    return { error: "이름을 입력해주세요." };
  }
  const note = String(formData.get("note") ?? "").trim() || null;

  try {
    await prisma.reservation.create({
      data: { itemId, reserverName, note },
    });
  } catch {
    return { error: "앗, 방금 다른 친구가 먼저 예약했어요!" };
  }

  revalidatePath(`/w/${token}`);
  return {};
}
