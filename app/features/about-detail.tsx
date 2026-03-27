import React from 'hono/jsx';
import { Section } from '../components/section';

type AboutDetailProps = {
  resumeTitle: string;
  html: string;
};

export const AboutDetail = ({ resumeTitle, html }: AboutDetailProps) => {
  return (
    <Section heading='About'>
      <p class='mb-6 text-sm text-text-secondary'>{resumeTitle}</p>
      <article class='prose max-w-none' dangerouslySetInnerHTML={{ __html: html }} />
    </Section>
  );
};
