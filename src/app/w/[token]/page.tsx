import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReserveForm } from "./reserve-form";

export default async function PublicWishlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!process.env.WISHLIST_SHARE_TOKEN || token !== process.env.WISHLIST_SHARE_TOKEN) {
    notFound();
  }

  const items = await prisma.wishlistItem.findMany({
    include: { reservation: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-5 py-3.5">
          <span className="text-[15px] font-semibold tracking-tight">
            생일 선물 위시리스트
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-10">
        <p className="rounded-xl border border-border bg-surface-alt px-4 py-3 text-[15px] text-muted">
          마음에 드는 선물을 예약해서 겹치지 않게 해주세요. 예약 내역은
          저한테는 안 보여요.
        </p>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-[15px] text-muted">
            아직 등록된 항목이 없어요.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-alt">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-muted">이미지 없음</span>
                  )}
                  {item.reservation && (
                    <span className="absolute left-3 top-3 rounded-full bg-foreground px-3 py-1 text-[13px] font-medium text-white">
                      예약완료
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div>
                    <h2 className="text-[17px] font-semibold">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-border underline-offset-2 hover:decoration-foreground"
                        >
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </h2>
                    {item.price && (
                      <p className="text-[15px] font-semibold">{item.price}</p>
                    )}
                    {item.description && (
                      <p className="mt-1 text-[14px] text-muted">{item.description}</p>
                    )}
                  </div>

                  <div className="mt-auto pt-2">
                    {item.reservation ? (
                      <p className="rounded-xl bg-surface-alt px-3.5 py-2.5 text-[14px] text-muted">
                        {item.reservation.reserverName}님이 예약했어요
                        {item.reservation.note ? ` · ${item.reservation.note}` : ""}
                      </p>
                    ) : (
                      <ReserveForm token={token} itemId={item.id} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
