/**
 * Tourist-facing profile fields must be English (Latin script).
 * Blocks Thai, CJK, Hangul, Arabic, Hebrew, etc. Latin Extended (accents) is allowed.
 */
const DISALLOWED_IN_ENGLISH_ONLY =
  /[\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0F00-\u0FFF\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function textHasDisallowedNonLatinScript(text: string): boolean {
  return DISALLOWED_IN_ENGLISH_ONLY.test(text);
}

/** emptyOk: trim-empty is valid */
export function validateEnglishOnlyField(value: string, emptyOk: boolean): string | null {
  const t = value.trim();
  if (t.length === 0) return emptyOk ? null : "This field is required.";
  if (textHasDisallowedNonLatinScript(t)) {
    return "Use English only (Latin letters). Do not use Thai, Chinese, Japanese, Korean, Arabic, Hebrew, or similar scripts.";
  }
  return null;
}

export function validateLanguagesEnglishOnly(languages: string[]): string | null {
  for (const lang of languages) {
    const t = lang.trim();
    if (t.length === 0) continue;
    if (textHasDisallowedNonLatinScript(t)) {
      return "List each language in English (e.g. Thai, English, Japanese), not in another script.";
    }
  }
  return null;
}

export function validateProfileEnglishOnlyPayload(body: Record<string, unknown>): string | null {
  if (typeof body.bio === "string") {
    const e = validateEnglishOnlyField(body.bio, true);
    if (e) return e;
  }
  if (typeof body.bioEn === "string") {
    const e = validateEnglishOnlyField(body.bioEn, true);
    if (e) return e;
  }
  if (Array.isArray(body.languages)) {
    const err = validateLanguagesEnglishOnly(
      body.languages.filter((x): x is string => typeof x === "string")
    );
    if (err) return err;
  }
  return null;
}
