<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions

- Home reference matching is scoped under `.bl-home-reference`; photos are extracted from the owner's reference and served through asset pointers. Featured slots retain honest unavailable states until matching catalogue records exist. Why: preserve the supplied design without changing other screens or fabricating course data.

- BridgeLIB runs on Lovable Cloud. `src/lib/supabase.ts` re-exports the generated client and the Cloud URL/publishable key; server functions validate the caller through `src/lib/bridge-auth.ts`. Why: one backend for data and accounts after the migration off the old external project.
- `src/start.ts` registers `attachBridgeAuth` as the bearer-token function middleware; do not add a second attacher. Why: it already sends the Cloud session token.
- Database schema lives in the Cloud migrations (the base tables were reconstructed from app usage because the old project kept them outside the repo). Why: the repo is now the schema source of truth.
- Backend e2e tests in `src/test/e2e/` use the Cloud publishable key and `E2E_*` test accounts, skip without credentials, and write only with `E2E_ALLOW_WRITES=1`. Why: verify access rules without secret keys.
- BridgeLIB uses TanStack Start with thin `src/routes/` wrappers. `src/components/BridgeApp.tsx` owns `BridgeHome` (`/`, `/admin`) and `PracticePage` (`/practice`); use TanStack Link/navigation/state, never wouter. Why: TanStack Router is fixed in this stack.
- The source repo's Express `api-server` was intentionally not ported: its only route is a health check and no app logic depends on it. Why: all data/auth flows run browser-to-Supabase.
- Keep only used UI primitives; AI Elements chat primitives use the shared Button's compatible variants/sizes. Why: preserve BridgeLIB styling while supporting the stricter TypeScript settings.
- Shared site chrome (header, footer, subject icons, empty/skeleton states) lives in `src/components/site/SiteChrome.tsx`; redesign styles use `bl-*` classes at the end of `src/styles.css`. Header Login/Sign Up links use `/?auth=login|signup`, which `BridgeHome` reads to open the existing auth form. Why: one design system reused by every page without touching auth logic.
- Admin CSV import/export: pure parsing/validation in `src/lib/admin-csv.ts`, UI in `src/components/admin/CsvTools.tsx`, database writes in `importRows` in the admin page using the signed-in admin session. Imports are insert-only, row by row, skipping duplicates. Why: no schema changes, existing access rules decide what each user can save.
- New learning and management pages call `src/lib/learning.functions.ts`; database access stays user-scoped and role authorization uses protected user_roles. Why: page visibility is not the permission boundary.
- Admin-editable website content (video link, contact details, socials, FAQ, Terms, Privacy) is stored as `site.*` rows in `feature_settings` (value in `label`), edited at `/site-content`, read via `src/lib/site-content.ts`. Why: existing admin-only write and public read rules apply.
- Practice test UI lives in `src/components/practice/PracticeView.tsx`; loading, grading, and learning-mode feedback state stay in `PracticePage` in BridgeApp.tsx. Why: preserve server grading while supporting the reference's immediate practice explanations.
- Practice tests accept published database question IDs only; material pages separate published school records from labeled original revision content. Student contact metadata is self-reported and photos use private owner-scoped storage. Why: avoid fabricated exam provenance, client grading and verification claims.
- Reference student navigation is shared in `StudentSidebar.tsx`; learner pages live in `LearnerPages.tsx` behind thin leaf routes. Why: keep all reference menu destinations consistent without duplicating navigation.
- Student dashboard presentation lives in `StudentDashboard.tsx`, reusing workspace/course reads; study goals use auth user metadata, never authorization decisions. Why: personal targets are not authorization data.
- Dashboard record availability uses `dashboard-records.functions.ts`: exact issued-certificate counts scoped to the authenticated owner; schedules and verification remain unavailable until confirmed authoritative sources exist. Why: goals, roles and email confirmation are not official exam dates or student verification.
- Study Guide uses route-owned threads, owner-scoped history, and server-read learning records; AI Gateway Responses streams through `/api/study-chat`. Why: prevent cross-account history and fabricated personalized data.
- Study Guide steps and individual lessons use published lessons and owner-scoped progress; recommendations receive exact allowlisted destinations, with completion using the existing learning action and shared cache invalidation. Why: students can follow real recommendations without new storage or fabricated learning content.
- Reference bookmarks, ratings, certificates, aggregate metrics and practice feedback use `reference.functions.ts`. Why: never invent live statistics.
- Certificate PDFs use issued record fields only and identify BridgeLIB course completion, never official exam certification; Ministry links stay separate until documents and alignment are verified. Why: downloads and source links must not fabricate credentials or curriculum coverage.
- Teacher messages and course lessons/quizzes/resources live in class_messages and class_content (teacher/member scoped by is_class_teacher/is_class_member); resource files go in the private class-resources bucket under <class_id>/, opened via short-lived signed links. Teacher profile photos reuse the owner-scoped student-photos path. Why: reuse class access rules for every new teacher feature.

- Student class learning uses StudentClasses and student-class.functions; quiz keys are teacher-only and extracted by a database trigger, grading persists through a membership-checked RPC, and announcement reads are per learner. Why: class learning cannot expose answers, fabricate progress or share read state.
