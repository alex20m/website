export interface Experience {
  title: string;
  company: string;
  location: string;
  description: string[];
  period: string;
}

/** Undoes the LaTeX escaping used in the raw resume string (`\&`, `\%`, …). */
export function decodeLatex(str: string): string {
  return str
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\#/g, '#')
    .replace(/\\\$/g, '$')
    .replace(/\\~/g, '~')
    .replace(/\\\^/g, '^');
}

/**
 * Extracts work-experience entries out of the `\resumeSubheading` /
 * `\resumeItem` macros in the raw LaTeX resume text, so the Experience
 * section never has to duplicate the CV by hand.
 */
export function parseLatexExperience(latexString: string): Experience[] {
  const experiences: Experience[] = [];
  const lines = latexString.split('\n').filter((line) => !line.trim().startsWith('%'));
  const cleanedLatex = lines.join('\n');
  const subheadingRegex = /\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\s*\{([^}]*)\}\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = subheadingRegex.exec(cleanedLatex)) !== null) {
    const title = decodeLatex(match[1]?.trim() ?? '');
    const period = (match[2]?.trim() ?? '').replace(/--/g, '-');
    const company = decodeLatex(match[3]?.trim() ?? '');
    const location = decodeLatex(match[4]?.trim() ?? '');
    const startPos = match.index + match[0].length;
    const remainingText = cleanedLatex.substring(startPos);
    const itemsMatch = remainingText.match(/\\resumeItemListStart([\s\S]*?)\\resumeItemListEnd/);
    const description: string[] = [];
    if (itemsMatch?.[1]) {
      const itemsText = itemsMatch[1];
      const itemRegex = /\\resumeItem\{([^}]*)\}/g;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = itemRegex.exec(itemsText)) !== null) {
        description.push(decodeLatex(itemMatch[1]?.trim() ?? ''));
      }
    }
    experiences.push({ title, company, location, description, period });
  }
  return experiences;
}
