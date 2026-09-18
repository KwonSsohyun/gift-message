import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { createItem, deleteItem } from "./actions";

const inputClass =
  "rounded-xl border border-border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-brand";

export default async function DashboardPage() {
  // Intentionally does not join/select reservation data here — the owner
  // shouldn't be able to see who reserved what, so it stays a surprise.
  const items = await prisma.wishlistItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const shareToken = process.env.WISHLIST_SHARE_TOKEN;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">내 위시리스트</h1>

        {shareToken ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-alt px-4 py-3 text-[15px]">
            <span className="text-muted">친구에게 공유할 링크</span>
            <code className="ml-auto text-brand">/w/{shareToken}</code>
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-surface-alt px-4 py-3 text-[15px] text-red-600">
            WISHLIST_SHARE_TOKEN이 설정되어 있지 않아요. .env.local에 추가해주세요.
          </p>
        )}

        <form
          action={createItem}
          className="flex flex-col gap-3 rounded-2xl border border-border p-6"
        >
          <p className="mb-1 text-[17px] font-semibold">선물 추가하기</p>
          <input name="title" placeholder="선물 이름" required className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" placeholder="가격 (선택)" className={inputClass} />
            <input name="url" placeholder="구매 링크 (선택)" className={inputClass} />
          </div>
          <input name="imageUrl" placeholder="이미지 URL (선택)" className={inputClass} />
          <textarea
            name="description"
            placeholder="설명 (선택)"
            rows={2}
            className={inputClass}
          />
          <button
            type="submit"
            className="mt-1 self-start rounded-full bg-brand px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark"
          >
            추가하기
          </button>
        </form>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-[15px] text-muted">
            아직 등록된 선물이 없어요.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-surface-alt">
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
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="line-clamp-2 text-[15px] font-medium">{item.title}</p>
                  {item.price && (
                    <p className="text-[15px] font-semibold">{item.price}</p>
                  )}
                  <form action={deleteItem.bind(null, item.id)} className="mt-auto pt-2">
                    <button
                      type="submit"
                      className="text-[13px] text-muted hover:text-red-600"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-[13px] text-muted">
          예약 현황은 일부러 보여드리지 않아요 — 서프라이즈를 위해서요.
        </p>
      </main>
    </>
  );
}
