import React from 'hono/jsx';
import type { ResumeData } from './resume-data';
import { KanaBox } from '../../components/kana-box';
import { GenBox } from '../../components/gen-box';
import { TimelineBox } from '../../components/timeline-box';
import { TimelineSeparator } from '../../components/timeline-separator';
import ResumePhoto from '../../islands/resume-photo';

export function Resume(props: { data: ResumeData }) {
  const resume = props.data;
  const profile = resume.profile;
  const address = resume.address;
  const education = resume.education;
  const experience = resume.experience;
  const awards = resume.awards;
  const licenses = resume.licenses;
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <div
      data-resume-page-root
      id='resume-content'
      class='bg-white text-black serif-only w-3xl mx-auto mt-6'
      hidden
    >
      <div>
        <div class={'m-2'}>
          <div class={'grid grid-rows-[repeat(auto-fit,minmax(60px,1fr))] grid-cols-10'}>
            <div class={'col-span-7 flex justify-between items-end flex-wrap mb-1'}>
              <h1 class={'text-2xl font-bold'}>履　歴　書</h1>
              <p class={'text-xs leading-none h-4'}>{today}現在</p>
            </div>
            <div class={'w-32 h-42 aspect-auto mx-auto my-5 col-span-3 row-span-4'}>
              <ResumePhoto
                alt={profile.photo?.alt}
                name={profile.name}
                objectKey={profile.photo?.objectKey}
              />
            </div>
            <KanaBox
              additionalClass='col-span-7 row-span-2'
              kana={profile.nameKana}
              typeText='氏名'
              text={profile.name}
            />
            <div class={'col-span-7 grid grid-rows-1 grid-cols-10'}>
              <GenBox additionalClass='border-t-0 col-span-8' typeText='生年月日'>
                <p class={'text-md leading-10 pl-16'}>
                  {profile.birthDay + '  （満' + profile.age + '歳）'}
                </p>
              </GenBox>
              <GenBox additionalClass='col-span-2 border-t-0 border-l-0' typeText='性別'>
                <p class={'text-md leading-10 pl-10'}>{profile.gender} </p>
              </GenBox>
            </div>
            <KanaBox
              additionalClass='col-span-7 border-t-0'
              kana={address.kana}
              typeText='現住所'
              text={address.value}
            >
              <span class={'text-sm leading-none'}>{address.zip}</span>
            </KanaBox>
            <GenBox additionalClass='col-span-3 border-l-0' typeText='電話'>
              <p class={'text-sm pl-5'}>{profile.cellPhone}</p>
            </GenBox>
            <KanaBox additionalClass='col-span-7 border-t-0' typeText='連絡先' text='同上' />
            <GenBox additionalClass='col-span-3 border-l-0 border-t-0' typeText='E-mail'>
              <p class={'text-sm pl-5'}>{profile.email}</p>
            </GenBox>
          </div>
          <div class={'mt-3 grid grid-cols-12 border'}>
            <div class={'text-sm text-center col-span-1 border-r border-dashed'}>年</div>
            <div class={'text-sm text-center col-span-1 border-r'}>月</div>
            <div class={'text-sm text-center col-span-10'}>学歴・職歴など</div>
          </div>
          <TimelineSeparator value='学　歴' />
          {education &&
            education.map((item) => (
              <TimelineBox key={item.value} year={item.year} month={item.month} text={item.value} />
            ))}
          <TimelineSeparator value='職　歴' />
          {experience &&
            experience.map((item) => {
              return item.detail && item.detail !== '' ? (
                <>
                  <TimelineBox
                    key={item.value}
                    year={item.year}
                    month={item.month}
                    text={item.value}
                  />
                  <TimelineBox text={item.detail} />
                </>
              ) : (
                <TimelineBox
                  key={item.value}
                  year={item.year}
                  month={item.month}
                  text={item.value}
                />
              );
            })}
          <TimelineSeparator value='' />
        </div>

        <div class={'m-2 pt-24'}>
          <div class={'grid grid-cols-12 border'}>
            <div class={'text-sm text-center col-span-1 border-r border-dashed'}>年</div>
            <div class={'text-sm text-center col-span-1 border-r'}>月</div>
            <div class={'text-sm text-center col-span-10'}>学歴・職歴など</div>
          </div>
          <TimelineSeparator value='' />
          <TimelineSeparator value='賞　罰' />
          {awards.length > 0 && <TimelineBox text={awards[0].value} />}
          <TimelineSeparator value='' />
          <div class={'grid grid-cols-12 border border-t-0'}>
            <div class={'text-sm text-center col-span-1 border-r border-dashed'}>年</div>
            <div class={'text-sm text-center col-span-1 border-r'}>月</div>
            <div class={'text-sm text-center col-span-10'}>免許・資格など</div>
          </div>
          {licenses.length > 0 && (
            <TimelineBox
              year={licenses[0].year}
              month={licenses[0].month}
              text={licenses[0].value}
            />
          )}
          <TimelineSeparator value='' />
          <TimelineSeparator value='以　上' />
          <TimelineSeparator value='' />
        </div>

        <div class={'m-2 mt-8'}>
          <GenBox additionalClass='p-1 pb-10' typeText='その他スキル・アピールポイント'>
            {resume.extraSkills &&
              resume.extraSkills.map((item) => {
                return (
                  <p class={'pl-1'} key={item}>
                    {item}
                  </p>
                );
              })}
          </GenBox>
          <div class={'grid grid-cols-3'}>
            <GenBox additionalClass='p-1 pb-3 border-t-0' typeText='扶養家族(配偶者を除く）'>
              <p class={'text-center'}>{resume.supporting.dependents} 人</p>
            </GenBox>
            <GenBox additionalClass='p-1 pb-3 border-t-0 border-l-0' typeText='配偶者'>
              <p class={'text-center'}>{resume.supporting.spouse}</p>
            </GenBox>
            <GenBox additionalClass='p-1 pb-3 border-t-0 border-l-0' typeText='配偶者の扶養義務'>
              <p class={'text-center'}>{resume.supporting.supportingSpouse}</p>
            </GenBox>
          </div>
          <GenBox additionalClass='p-1 pb-10 border-t-0' typeText='本人希望欄・その他'>
            <p class={'pl-1'}>{resume.request}</p>
          </GenBox>
        </div>
      </div>
    </div>
  );
}
