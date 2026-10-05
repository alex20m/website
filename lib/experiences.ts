import latexResume from '@/data/latexResume';
import { parseLatexExperience, type Experience } from '@/lib/parseLatexExperience';
import { truncateDescription } from '@/lib/truncateDescription';

/** How much of an entry's description a phone shows before "Show more". */
export const MOBILE_CHAR_LIMIT = 100;

/** An experience entry with what the phone layout needs already worked out. */
export interface ExperienceEntry extends Experience {
  /** The description cut down to MOBILE_CHAR_LIMIT characters. */
  preview: string[];
  /** Whether the preview is shorter than the full description, so "Show more" has something to show. */
  truncatable: boolean;
}

/**
 * The resume's experience entries, ready to render. Worked out on the server
 * from the LaTeX resume, so the parsing and truncation never ship to the
 * browser, and is passed down as plain data.
 */
export function loadExperiences(resume: string = latexResume): ExperienceEntry[] {
  return parseLatexExperience(resume).map((exp) => ({
    ...exp,
    preview: truncateDescription(exp.description, MOBILE_CHAR_LIMIT),
    truncatable: exp.description.join(' ').length > MOBILE_CHAR_LIMIT,
  }));
}
