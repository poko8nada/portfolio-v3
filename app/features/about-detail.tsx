import React from 'hono/jsx';
import { Section } from '../components/section';

type AboutDetailProps = {
  html: string;
};

export const AboutDetail = ({ html }: AboutDetailProps) => {
  return (
    <Section>
      <h2 class='mb-6 text-2xl text-text-primary'>Stacks</h2>
      <article class='prose max-w-none' dangerouslySetInnerHTML={{ __html: html }} />
    </Section>
  );
};
