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
  age: string;
  gender: string;
  cellPhone: string;
  email: string;
  photo?: ResumeProfilePhoto;
};

export type ResumeAddressBlock = {
  zip: string;
  kana: string;
  value: string;
  tel: string;
  fax: string;
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
  dependents: string;
  spouse: string;
  supportingSpouse: string;
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPhoto(value: unknown): value is ResumeProfilePhoto {
  return (
    isObjectRecord(value) && typeof value.objectKey === 'string' && typeof value.alt === 'string'
  );
}

function isSupporting(value: unknown): value is ResumeSupporting {
  return (
    isObjectRecord(value) &&
    typeof value.dependents === 'string' &&
    typeof value.spouse === 'string' &&
    typeof value.supportingSpouse === 'string'
  );
}

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
    isObjectRecord(data.profile) &&
    typeof data.profile.date === 'string' &&
    typeof data.profile.nameKana === 'string' &&
    typeof data.profile.name === 'string' &&
    typeof data.profile.birthDay === 'string' &&
    typeof data.profile.age === 'string' &&
    typeof data.profile.gender === 'string' &&
    typeof data.profile.cellPhone === 'string' &&
    typeof data.profile.email === 'string' &&
    (data.profile.photo === undefined || isPhoto(data.profile.photo));

  const isAdress =
    isObjectRecord(data.address) &&
    typeof data.address.zip === 'string' &&
    typeof data.address.kana === 'string' &&
    typeof data.address.value === 'string' &&
    typeof data.address.tel === 'string' &&
    typeof data.address.fax === 'string';

  const isContactAddress =
    data.contactAddress === undefined ||
    (isObjectRecord(data.contactAddress) &&
      typeof data.contactAddress.zip === 'string' &&
      typeof data.contactAddress.kana === 'string' &&
      typeof data.contactAddress.value === 'string' &&
      typeof data.contactAddress.tel === 'string' &&
      typeof data.contactAddress.fax === 'string');

  const isAcademicBackground =
    data.academicBackground === undefined ||
    (isObjectRecord(data.academicBackground) &&
      typeof data.academicBackground.degree === 'string' &&
      typeof data.academicBackground.degreeYear === 'string' &&
      typeof data.academicBackground.degreeAffiliation === 'string' &&
      typeof data.academicBackground.thesisTitle === 'string');

  return (
    isProfile &&
    isAdress &&
    isContactAddress &&
    isAcademicBackground &&
    isTimeline(data.education) &&
    isTimeline(data.experience) &&
    isTimeline(data.licenses) &&
    isTimeline(data.awards) &&
    isSupporting(data.supporting) &&
    (data.teaching === undefined || typeof data.teaching === 'string') &&
    (data.affiliatedSociety === undefined || typeof data.affiliatedSociety === 'string') &&
    (data.commutingTime === undefined || typeof data.commutingTime === 'string') &&
    (data.hobby === undefined || typeof data.hobby === 'string') &&
    (data.extraSkills === undefined || isStringArray(data.extraSkills)) &&
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

  if (isResumeData(parsed)) {
    return ok(parsed as ResumeData);
  }

  return err('Resume document validation not implemented');
}
