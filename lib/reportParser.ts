/**
 * Report-text parsing algorithm.
 *
 * Ported from the C++ reference the user provided.
 * – Scans each line for keyword tags (fixed → bug fixes, added → feature …)
 * – Detects project names from a keyword map
 * – Extracts a date via regex (DD/MM/YYYY or YYYY-MM-DD)
 * – Routes lines to keyPoints (short) vs details (long / many sentences)
 */

/** keyword → tag mapping */
const KEYWORD_MAP: Record<string, string> = {
   fixed: "bug fixes",
   fix: "bug fixes",
   added: "feature",
   created: "feature",
   updated: "enhancement",
   improve: "enhancement",
   improved: "enhancement",
   tested: "SQA",
   tests: "SQA",
};

/** raw-text keyword → canonical project name */
const PROJECT_MAP: Record<string, string> = {
   schoolerp: "schoolerp",
   school: "schoolerp",
   wexnix: "wexnix portfolio",
   eduex: "schoolerp",
   hrm: "a&a shoes hrm",
   anashoes: "a&a shoes hrm",
   "a and a shoes": "a&a shoes hrm",
};

export interface ParsedReport {
   /** Auto-detected date in ISO format, or null */
   detectedDate: string | null;
   /** Detected project names (de-duped) */
   detectedProjects: string[];
   /** Short tagged lines */
   keyPoints: string[];
   /** Long / multi-sentence lines */
   details: string[];
}

/* ------------------------------------------------------------------ */

/**
 * Try to extract a date from a line.
 * Supports:
 *   DD/MM/YYYY  or  DD-MM-YYYY  →  YYYY-MM-DD
 *   YYYY-MM-DD  (already ISO)   →  YYYY-MM-DD
 */
function extractDate(line: string): string | null {
   // DD/MM/YYYY or DD-MM-YYYY
   const dmyMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
   if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
   }
   // YYYY-MM-DD
   const isoMatch = line.match(/(\d{4})-(\d{2})-(\d{2})/);
   if (isoMatch) return isoMatch[0];
   return null;
}

/**
 * Detect project names mentioned anywhere in a line.
 * Returns canonical names (de-duped).
 */
function detectProjects(line: string): string[] {
   const lower = line.toLowerCase();
   const found = new Set<string>();
   for (const [keyword, canonical] of Object.entries(PROJECT_MAP)) {
      if (lower.includes(keyword)) found.add(canonical);
   }
   return [...found];
}

/* ------------------------------------------------------------------ */

/**
 * Parse a raw work-report string into structured data.
 *
 * @param rawText  The free-form text the user typed or pasted.
 */
export function parseReport(rawText: string): ParsedReport {
   const lines = rawText.split("\n");

   let detectedDate: string | null = null;
   const allProjects = new Set<string>();
   const keyPoints: string[] = [];
   const details: string[] = [];

   for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.length === 0) continue;

      // Skip generic report header lines (e.g. "Daily work report")
      if (/^(daily\s+)?(work\s+)?report\s*[:\-]?$/i.test(line)) {
         continue;
      }

      // --- date detection (first match wins) ---
      if (!detectedDate) {
         const d = extractDate(line);
         if (d) {
            detectedDate = d;
            // If the line is *only* a date header (e.g. "Date: 12/10/2026"), skip it
            const stripped = line.replace(/date\s*[:;]\s*/i, "").trim();
            const dateOnly = stripped.replace(/[\d\/\-]+/, "").trim();
            if (dateOnly.length === 0) continue;
         }
      }

      // --- project detection ---
      for (const p of detectProjects(line)) allProjects.add(p);

      // --- sentence count & length ---
      const sentenceCount = (line.match(/\./g) || []).length;

      // --- keyword tagging ---
      let tagged = "";
      let alreadyTagged = false;
      let word = "";

      for (let i = 0; i < line.length; i++) {
         const ch = line[i];
         tagged += ch;

         if (ch === " " || ch === "." || ch === ",") {
            if (!alreadyTagged && word.length > 0) {
               const lower = word.toLowerCase();
               if (KEYWORD_MAP[lower]) {
                  const tag = `[${KEYWORD_MAP[lower]}]`;
                  // Prepend tag to what we've accumulated so far
                  tagged = tag + tagged;
                  alreadyTagged = true;
               }
            }
            word = "";
         } else {
            word += ch.toLowerCase();
         }
      }

      // Check the last word if we haven't tagged yet
      if (!alreadyTagged && word.length > 0) {
         const lower = word.toLowerCase();
         if (KEYWORD_MAP[lower]) {
            tagged = `[${KEYWORD_MAP[lower]}]` + tagged;
            alreadyTagged = true;
         }
      }

      // --- route to keyPoints vs details ---
      if (sentenceCount >= 6 || line.length >= 400) {
         details.push(line);
      } else {
         if (!alreadyTagged) {
            keyPoints.push("[others]" + tagged);
         } else {
            keyPoints.push(tagged);
         }
      }
   }

   return {
      detectedDate,
      detectedProjects: [...allProjects],
      keyPoints,
      details,
   };
}
