import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '../../utils/types';
import { parseResumeDocument } from './resume-data';

const RESUME_FIXTURE = {
  profile: {
    date: '2026-04-01',
    nameKana: 'テスト タロウ',
    name: 'テスト 太郎',
    birthDay: '1990-01-01',
    age: '36',
    gender: '男',
    cellPhone: '000-0000-0000',
    email: 't@example.com',
  },
  address: {
    zip: '810-0001',
    kana: 'フクオカケン',
    value: '福岡県福岡市',
    tel: '092-000-0000',
    fax: '',
  },
  education: [{ year: '2009', month: '3', value: '高校卒業' }],
  experience: [{ year: '2010', month: '4', value: '入社', detail: '業務担当' }],
  licenses: [],
  awards: [],
  supporting: {
    dependents: '0',
    spouse: '無',
    supportingSpouse: '無',
  },
  extraSkills: [],
  motivation: '志望動機',
  request: '本人希望',
};

const MINIMAL_VALID = JSON.stringify({
  profile: {
    date: '2026-04-01',
    nameKana: 'テスト タロウ',
    name: 'テスト 太郎',
    birthDay: '1990-01-01',
    age: '36',
    gender: '男',
    cellPhone: '000-0000-0000',
    email: 't@example.com',
  },
  address: {
    zip: '810-0001',
    kana: 'フクオカケン',
    value: '福岡県福岡市',
    tel: '092-000-0000',
    fax: '',
  },
  education: [],
  experience: [],
  licenses: [],
  awards: [],
  supporting: {
    dependents: '0',
    spouse: '無',
    supportingSpouse: '無',
  },
  extraSkills: [],
  motivation: '志望動機',
  request: '本人希望',
});

describe('parseResumeDocument', () => {
  it('returns an error when the content is not valid JSON', () => {
    const result = parseResumeDocument('{');
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('returns an error when the root value is not an object', () => {
    const result = parseResumeDocument('[]');
    expect(isErr(result)).toBe(true);
  });

  it('accepts a minimal valid document per ADR-0009', () => {
    const result = parseResumeDocument(MINIMAL_VALID);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.profile.name).toBe('テスト 太郎');
      expect(result.value.motivation).toBe('志望動機');
      expect(result.value.request).toBe('本人希望');
    }
  });

  it('rejects a document that omits a required profile field', () => {
    const bad = JSON.stringify({
      profile: {
        date: '2026-04-01',
        nameKana: 'テスト タロウ',
        name: 'テスト 太郎',
        birthDay: '1990-01-01',
        age: '36',
        gender: '男',
        cellPhone: '000',
        // email omitted
      },
      address: {
        zip: '',
        kana: '',
        value: '',
        tel: '',
        fax: '',
      },
      education: [],
      experience: [],
      licenses: [],
      awards: [],
      supporting: {
        dependents: '0',
        spouse: '無',
        supportingSpouse: '無',
      },
      extraSkills: [],
      motivation: '',
      request: '',
    });
    const result = parseResumeDocument(bad);
    expect(isErr(result)).toBe(true);
  });

  it('accepts a complete resume fixture', () => {
    const result = parseResumeDocument(JSON.stringify(RESUME_FIXTURE));
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.profile.name).toBe(RESUME_FIXTURE.profile.name);
      expect(result.value.experience.length).toBeGreaterThan(0);
      const firstExp = result.value.experience[0];
      expect(firstExp?.detail?.length).toBeGreaterThan(0);
    }
  });

  it('rejects a timeline entry missing month', () => {
    const bad = JSON.stringify({
      profile: {
        date: '',
        nameKana: '',
        name: '',
        birthDay: '',
        age: '',
        gender: '',
        cellPhone: '',
        email: '',
      },
      address: { zip: '', kana: '', value: '', tel: '', fax: '' },
      education: [{ year: '2001', value: '卒業' }],
      experience: [],
      licenses: [],
      awards: [],
      supporting: {
        dependents: '0',
        spouse: '無',
        supportingSpouse: '無',
      },
      extraSkills: [],
      motivation: '',
      request: '',
    });
    const result = parseResumeDocument(bad);
    expect(isErr(result)).toBe(true);
  });

  it('rejects profile.photo when objectKey is not a string', () => {
    const bad = JSON.stringify({
      profile: {
        date: '',
        nameKana: '',
        name: '',
        birthDay: '',
        age: '',
        gender: '',
        cellPhone: '',
        email: '',
        photo: { objectKey: 1, alt: 'x' },
      },
      address: { zip: '', kana: '', value: '', tel: '', fax: '' },
      education: [],
      experience: [],
      licenses: [],
      awards: [],
      supporting: {
        dependents: '0',
        spouse: '無',
        supportingSpouse: '無',
      },
      extraSkills: [],
      motivation: '',
      request: '',
    });
    const result = parseResumeDocument(bad);
    expect(isErr(result)).toBe(true);
  });
});
