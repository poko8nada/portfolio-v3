import { err, ok, type Result } from '../../utils/types';

export const RESUME_JSON_OBJECT_KEY = 'resume/resume.json';

export type ResumeProfilePhoto = {
  objectKey: string;
  alt: string;
};

export type ResumeProfile = {
  date: string;
  nameKana: string;
  name: string;
  birthDay: string;
  gender: string;
  cellPhone: string;
  email: string;
  photo?: ResumeProfilePhoto;
  age?: string;
};

export type ResumeAddressBlock = {
  zip: string;
  kana: string;
  value: string;
  tel: string;
  fax?: string;
};

export type ResumeAcademicBackground = {
  degree: string;
  degreeYear: string;
  degreeAffiliation: string;
  thesisTitle: string;
};

export type ResumeTimelineEntry = {
  year: string;
  month: string;
  value: string;
  detail?: string;
};

export type ResumeSupporting = {
  dependents?: string;
  spouse?: string;
  supportingSpouse?: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type ResumeData = {
  profile: ResumeProfile;
  address: ResumeAddressBlock;
  contactAddress?: ResumeAddressBlock;
  academicBackground?: ResumeAcademicBackground;
  education: ResumeTimelineEntry[];
  experience: ResumeTimelineEntry[];
  licenses: ResumeTimelineEntry[];
  awards: ResumeTimelineEntry[];
  teaching?: string;
  affiliatedSociety?: string;
  commutingTime?: string;
  supporting: ResumeSupporting;
  extraSkills?: string[];
  hobby?: string;
  motivation: string;
  request: string;
};

export function isTimeline(arr: ResumeTimelineEntry[]) {
  for (const item of arr) {
    if (
      typeof item.year !== 'string' ||
      typeof item.month !== 'string' ||
      typeof item.value !== 'string'
    ) {
      return false;
    }
  }
  return true;
}

export function isResumeData(obj: Record<string, unknown>) {
  const data = obj as ResumeData;
  const isProfile =
    typeof data.profile === 'object' &&
    typeof data.profile.date === 'string' &&
    typeof data.profile.nameKana === 'string' &&
    typeof data.profile.name === 'string' &&
    typeof data.profile.birthDay === 'string' &&
    typeof data.profile.gender === 'string' &&
    typeof data.profile.cellPhone === 'string' &&
    typeof data.profile.email === 'string' &&
    typeof data.profile.photo?.objectKey === 'string' &&
    typeof data.profile.photo?.alt === 'string';

  const isAdress =
    typeof data.address === 'object' &&
    typeof data.address.zip === 'string' &&
    typeof data.address.kana === 'string' &&
    typeof data.address.value === 'string' &&
    typeof data.address.tel === 'string';

  return (
    isProfile &&
    isAdress &&
    isTimeline(data.education) &&
    isTimeline(data.experience) &&
    isTimeline(data.licenses) &&
    isTimeline(data.awards) &&
    typeof data.supporting === 'object' &&
    typeof data.motivation === 'string' &&
    typeof data.request === 'string'
  );
}

export function parseResumeDocument(content: string): Result<ResumeData, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Invalid JSON');
  }

  if (!isObjectRecord(parsed)) {
    return err('Invalid resume document');
  }

  // TODO(human):
  // Validate `parsed` against the Runtime Contract in ADR-0008 (`docs/adr/0008-resume-page-from-r2-json-with-cloudflare-access.md`):
  // required top-level keys, required `profile` and `address` fields, timeline arrays whose items each have `year`, `month`, `value`, optional `details` on `experience`, optional `photo` with `objectKey` + `alt`, and string fields for free-text sections.
  // Hint: Reuse narrowing patterns from `app/features/about-detail-data.ts` (`parseAboutStackDocument`, lines 24–62). For arrays, validate each index and return `err(\`… at index ${index}\`)` on failure.
  // Reference seed: `seeds/resume-assets/resume/resume.json`

  if (isResumeData(parsed)) {
    return ok(parsed as ResumeData);
  }

  return err('Resume document validation not implemented');
}
