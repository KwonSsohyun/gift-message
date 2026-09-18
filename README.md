# 생일 선물 위시리스트

내가 받고 싶은 선물을 등록해두면, 친구들이 공유 링크로 들어와서 겹치지 않게
예약할 수 있는 사이트. 예약 현황은 나(주인)에게는 보이지 않아서 서프라이즈가
유지돼요.

## Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **DB**: SQLite + [Prisma](https://www.prisma.io) (`prisma@7.10.0`으로 고정 — 8.x는 이 프로젝트 작성 시점에 클라우드 플랫폼 중심으로 바뀐 RC라 로컬 SQLite 워크플로우에는 적합하지 않아 이전 stable로 고정함)

로그인은 없습니다. `/dashboard`(관리 페이지)는 누구나 URL을 알면 접근할 수 있어요
— 개인용 소규모 프로젝트라 의도적으로 단순하게 둔 것. 필요해지면 나중에
인증을 다시 붙일 수 있어요.

## Getting Started

1. 의존성 설치:

   ```bash
   npm install
   ```

2. 환경 변수 설정:

   ```bash
   cp .env.example .env.local
   ```

   - `WISHLIST_SHARE_TOKEN`: 친구에게 보낼 공유 링크(`/w/<token>`)용 랜덤 문자열.
     `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`로 생성

   (`.env.local`은 이미 랜덤 `WISHLIST_SHARE_TOKEN`이 채워진 상태로 생성돼 있어요.)

3. DB 마이그레이션 (스키마 변경 시에만 필요, 최초 1회는 이미 적용됨):

   ```bash
   npx prisma migrate dev
   ```

4. 개발 서버 실행:

   ```bash
   npm run dev
   ```

5. [http://localhost:3000](http://localhost:3000) 접속 → 선물 등록 →
   `/dashboard`에 표시되는 공유 링크를 친구에게 전달.

## Project layout

- `src/app/page.tsx` – 랜딩 페이지
- `src/app/dashboard/` – 위시리스트 관리 (로그인 없음). 예약 현황은 절대 조회하지 않음
- `src/app/w/[token]/` – 친구용 공개 페이지. 항목을 보고 이름/메모와 함께 예약 가능
- `prisma/schema.prisma` – `WishlistItem`, `Reservation` 모델 (1:1, `Reservation.itemId`가
  unique라서 같은 항목을 동시에 예약해도 DB 레벨에서 하나만 성공)
- `src/lib/prisma.ts` – PrismaClient 싱글턴

## Notes

- `/dashboard`는 보호되어 있지 않아요. URL을 아무한테나 공유하지 마세요.
- 공유 링크(`/w/<token>`)의 보안도 토큰의 예측 불가능성에만 의존해요. 신뢰하는
  친구에게만 링크를 보내세요.
- 예약 취소/수정 기능은 아직 없어요 (MVP 범위 밖). 필요하면 `Reservation`에 취소용
  토큰을 추가해서 확장할 수 있어요.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
