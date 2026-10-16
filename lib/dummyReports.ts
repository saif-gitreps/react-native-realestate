import { toISO } from "../lib/format";
import { Report } from "../types/shared";

const projects = [
   "schoolerp",
   "wexnix portfolio",
   "a&a shoes hrm",
   "Billing Portal",
   "Mobile App",
   "Admin Dashboard",
   "Data Migration",
];

const keyPool = [
   "[bug fixes]Fixed the invoice rounding bug on the checkout summary",
   "[others]Reviewed two pull requests from the backend team",
   "[SQA]Wrote unit tests for the payment retry service",
   "[feature]Migrated the user table to the new schema",
   "[others]Paired on the search filter performance issue",
   "[enhancement]Updated API docs for the reports endpoint",
   "[bug fixes]Investigated a crash on the Android login screen",
   "[others]Cleaned up unused environment variables",
   "[others]Demoed the new dashboard to the product owner",
   "[feature]Set up the staging deployment pipeline",
   "[enhancement]Refactored the notification preferences form",
   "[others]Triaged open bugs and moved four to next sprint",
];

const detailPool = [
   "Spent most of the morning tracing why totals were off by a cent on certain orders. The cause was rounding applied per line item instead of once on the subtotal. Changed the calculation, added regression tests for three edge cases, and confirmed the fix against last month's sample data.",
   "Went through the pull requests queued since Friday and left comments on error handling and naming. One of them touched the retry logic, so I ran it locally with the network throttled to make sure failed payments are not charged twice.",
   "Started the schema migration for the users table. Wrote the migration script, ran it on a copy of staging, and noted two columns that need a backfill before the old ones can be dropped. Rollback steps are written down in the ticket.",
   "Had a long debugging session on the login crash that only appears on older Android versions. It turned out to be a null value coming back from secure storage after an app update. Added a guard and a fallback to the sign-in screen.",
   "Met with the product owner to walk through the new dashboard. They asked for a date filter on the summary cards and a clearer empty state. Both are small, so I added them to this week's list instead of the backlog.",
   "Cleaned up the deployment configuration for staging. Removed variables that nothing reads anymore, documented the ones that remain, and confirmed that a fresh deploy from scratch works end to end.",
];

export const dummyReports: Report[] = Array.from({ length: 42 }, (_, i) => {
   const d = new Date();
   d.setDate(d.getDate() - i);
   const keyCount = 2 + (i % 4);
   const detailCount = 1 + (i % 3);
   return {
      id: `r${i + 1}`,
      date: toISO(d),
      projectName: [projects[(i + Math.floor(i / 3)) % projects.length]],
      rawInput: undefined,
      keyPoints: Array.from(
         { length: keyCount },
         (_, k) => keyPool[(i * 3 + k) % keyPool.length],
      ),
      details: Array.from(
         { length: detailCount },
         (_, k) => detailPool[(i + k * 2) % detailPool.length],
      ),
      isStarred: i % 7 === 0, // every 7th report starred for demo
   };
});

export function getReportById(id?: string): Report | undefined {
   return dummyReports.find((r) => r.id === id);
}

export const projectNames = projects;
