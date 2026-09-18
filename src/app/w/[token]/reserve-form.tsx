"use client";

import { useActionState } from "react";
import { reserveItem, type ReserveState } from "./actions";

const initialState: ReserveState = {};

const inputClass =
  "min-w-0 flex-1 rounded-full border border-border bg-white px-3.5 py-2 text-[14px] outline-none transition-colors focus:border-brand";

export function ReserveForm({ token, itemId }: { token: string; itemId: string }) {
  const action = reserveItem.bind(null, token, itemId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input name="name" placeholder="너의 이름" required className={inputClass} />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "예약 중..." : "예약하기"}
        </button>
      </div>
      <input name="note" placeholder="메모 (선택)" className={inputClass} />
      {state.error && <p className="text-[13px] text-red-600">{state.error}</p>}
    </form>
  );
}
