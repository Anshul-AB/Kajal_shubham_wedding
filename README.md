# Kajal & Shubham Wedding Invitation

## Couple photographs

The five original couple photographs are imported from
`src/assets/images/KS_1.jpeg` through `KS_5.jpeg`; preserve their exact
capitalization and `.jpeg` extensions. Their section mapping is in
`src/config/weddingDetails.ts`:

- Introduction: KS_1 and KS_4
- Palace opening: KS_2
- Family portrait placeholder: KS_3
- Cocktail: KS_5
- Haldi: KS_3
- Mehendi: KS_2
- Wedding: KS_4

The family portrait currently uses a couple photo until a family photograph is
available. Portrait frames use `object-fit: cover` and responsive positioning.

## Family details and event schedule

Enter the parents' names in the `families` fields in
`src/config/weddingDetails.ts`; they are intentionally blank.

- Cocktail — 23 November 2026 at 8:00 PM; Celebration Rooms and
  Banquet, Pathankot.
- Haldi — 24 November 2026 at 11:00 AM; Celebration Rooms and Banquet,
  Pathankot.
- Mehendi — 24 November 2026 at 7:00 PM; Celebration Rooms and Banquet,
  Pathankot.
- Wedding — 25 November 2026 at 8:00 PM; Jashan, Pathankot, Punjab, India.

Cocktail, Haldi and Mehendi details are visible in their event sections. The
Wedding date and venue stay secret until the final Wedding reveal.

## Supabase RSVP setup

The RSVP form and private `/admin` dashboard are implemented, but this
workspace has no Supabase project URL or public key configured. Real online
submissions and dashboard access will remain unavailable until the steps below
are completed. No service-role key is used in the website.

1. Create a project at [supabase.com](https://supabase.com/) and wait for it to
   finish provisioning.

2. In the Supabase project, open **Connect** or **Settings → API Keys**. Copy
   the **Project URL** and the **public anon/publishable key**. In the project
   root, create a local `.env` file using `.env.example` as a template:

   ```text
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
   ```

   These browser settings are public by design. Never put a `service_role`
   key or any other secret in a `VITE_` variable or frontend code. Keep `.env`
   out of source control.

3. Open **SQL Editor → New query**, copy the complete contents of
   [`supabase/rsvp_schema.sql`](./supabase/rsvp_schema.sql), and run it. The
   script creates/migrates `public.wedding_rsvps`, validates the required
   fields and event names, enables Row Level Security, and permits public
   inserts only. Anonymous visitors receive no read access. It also creates a
   private `public.rsvp_admins` allowlist and administrator-only read/manage
   policies.

4. Create the administrator account in **Authentication → Users → Add user**.
   Set an email and password that only the administrator controls; public
   sign-ups are not needed. Copy the new user's UUID from the Users list. In
   **SQL Editor**, authorize that exact account:

   ```sql
   insert into public.rsvp_admins (user_id)
   values ('PASTE_THE_AUTH_USER_UUID_HERE');
   ```

   To remove dashboard access later, delete that user's row from
   `public.rsvp_admins`. Signing in at `/admin` is not sufficient by itself;
   the UUID must be on this allowlist.

5. Restart the local Vite server after saving `.env`. Test a valid RSVP and
   verify its row in **Table Editor → wedding_rsvps**. The success message is
   shown only when Supabase confirms the insert. Test a decline too: it is
   stored as `not_attending`, with no guest count or selected events. Invalid
   input must not create a row. Then sign in at `/admin` with the authorized
   account and verify the counts, filters, search and CSV export. An account
   not on the allowlist must not see the responses.

6. For Vercel, add these same two variables under **Project → Settings →
   Environment Variables** for every environment where the site will run:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The included
   `vercel.json` sends `/admin` to the Vite app. Redeploy after adding or
   changing environment variables; Vite embeds them at build time.

The public RSVP endpoint should be protected against spam (for example with
rate limiting or CAPTCHA) before broadly sharing the invitation.

## Palace video and music

The palace-opening video stays at `public/videos/palace-opening.mp4` and
continues to play its embedded audio at the existing playback speed.
Background music starts once the palace video has ended and the couple's names
have finished appearing. It fades in over approximately three seconds and
continues across the invitation with Play/Pause and Mute controls. Place the
track at `public/assets/audio/wedding audio.mp3`; it is served to the browser
from `/assets/audio/wedding%20audio.mp3`. If autoplay is blocked, use the
floating Play control to start playback.

## Local development

```sh
npm install
npm run dev
npm run build
npm run lint
```
