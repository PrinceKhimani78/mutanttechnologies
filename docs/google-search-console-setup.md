# Google Search Console setup

This enables the "Google Indexing" panel at `/admin/seo/indexing`: sitemap
resubmission on publish, and real index-status checks per URL.

Google does not offer a public API to force-index an arbitrary page - the
Indexing API is restricted by policy to Job Posting and Livestream pages.
What's below is the legitimate substitute: nudge Google to recrawl the
sitemap sooner, and read real status via the URL Inspection API. The final
"Request Indexing" click for a specific URL still has to happen by hand in
Search Console - the dashboard gives you a one-click deep link straight to
that page's inspection view so you don't have to hunt for it.

## 1. Create a Google Cloud service account

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create a project (or reuse an existing one).
2. **APIs & Services → Library** - search for **Search Console API** and
   click **Enable**.
3. **APIs & Services → Credentials → Create Credentials → Service account**.
   Give it any name (e.g. `search-console-bot`). No special roles needed on
   the Google Cloud side.
4. Open the new service account → **Keys → Add Key → Create new key → JSON**.
   This downloads a `.json` file - keep it private, don't commit it.

## 2. Grant that service account access in Search Console

1. Open [Search Console](https://search.google.com/search-console) for
   `mutanttechnologies.com`.
2. **Settings → Users and permissions → Add user**.
3. Paste the service account's email (the `client_email` field in the JSON
   file, looks like `search-console-bot@your-project.iam.gserviceaccount.com`).
4. Set permission to **Full** (Owner works too, Full is enough).

## 3. Set environment variables

From the downloaded JSON file:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from the JSON>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<private_key from the JSON>
GOOGLE_SEARCH_CONSOLE_SITE_URL=<exactly as shown in the Search Console property switcher>
```

Notes:
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` contains real newlines in the JSON
  file. Most env var UIs (Vercel included) handle multi-line values fine if
  you paste it as-is with the `-----BEGIN PRIVATE KEY-----` / `-----END
  PRIVATE KEY-----` lines intact. If your environment only accepts a single
  line, replace newlines with literal `\n` - the code already un-escapes
  `\n` back into real newlines.
- `GOOGLE_SEARCH_CONSOLE_SITE_URL` depends on which property type is
  verified: a **URL-prefix** property uses the full URL with trailing slash
  (e.g. `https://www.mutanttechnologies.com/`); a **Domain** property uses
  `sc-domain:mutanttechnologies.com`. Copy it exactly from the property
  dropdown in Search Console - don't guess.

Add all three to `.env.local` for local testing and to your hosting
provider's environment variables (Vercel → Project → Settings →
Environment Variables) for production, then redeploy.

## 4. Verify it worked

Once deployed, open `/admin/seo/indexing` and click **Resubmit Sitemap**. A
green confirmation means it's wired up correctly. If you see "Not connected
to Google Search Console yet," double check all three env vars are set and
the service account was added with Full/Owner access to the exact property
in step 2.
