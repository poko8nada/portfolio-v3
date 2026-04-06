import React from 'hono/jsx';
import { createRoute } from 'honox/factory';
import { Button } from '../../components/button';
import { PostContent } from '../../components/post-content';
import { Section } from '../../components/section';
import { PostList } from '../../features/post-list';
import { parseMarkdown } from '../../lib/markdown';
import { getPost } from '../../lib/r2';
import { isErr } from '../../utils/types';

const isPostNotFoundError = (error: string) => error.startsWith('Post not found:');

export default createRoute(async (c) => {
  const slug = c.req.param('slug');
  if (!slug) {
    return c.notFound();
  }

  const bucket = c.env.POSTS_BUCKET;
  const getResult = await getPost(bucket, slug, {
    ctx: c.executionCtx,
    request: c.req.raw,
  });

  if (isErr(getResult)) {
    if (isPostNotFoundError(getResult.error)) {
      return c.notFound();
    }

    c.status(500);
    return c.render(
      <div>
        <title>Error | Poko Hanada</title>
        Error: {getResult.error}
      </div>,
    );
  }

  const { content, fromCache } = getResult.value;
  c.header('X-Cache', fromCache ? 'HIT' : 'MISS');

  const parseResult = await parseMarkdown(content);
  if (isErr(parseResult)) {
    return c.notFound();
  }

  const postData = parseResult.value;

  if (!postData.isPublished) {
    return c.notFound();
  }

  const title = `${postData.title} | Poko Hanada`;
  const description = (() => {
    const cleaned = postData.content.replace(/<[^>]*>?/gm, '');
    const maxLen = 120;
    let desc = cleaned.substring(0, maxLen);
    const lastPeriod = desc.lastIndexOf('。');
    if (lastPeriod !== -1) {
      desc = desc.substring(0, lastPeriod + 1);
    }
    return desc;
  })();

  const ogImageURL = `https://image.pokohanada.com/ogp?title=${encodeURIComponent(postData.title)}&slug=${encodeURIComponent(slug)}`;

  const shareUrl = encodeURIComponent(c.req.url);
  const shareText = encodeURIComponent(postData.title);
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;

  return c.render(
    <div>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:type' content='article' />
      <meta property='og:image' content={ogImageURL} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:image' content={ogImageURL} />

      <section class='prose'>
        <PostContent postData={postData} />
        <div class='mt-24 flex justify-center'>
          <Button href={twitterShareUrl} target='_blank' variant='secondary' size='lg'>
            Xでシェアする
          </Button>
        </div>
      </section>
      <hr class='text-text-secondary mt-8 mb-8' />
      <Section heading='Recent Posts'>
        <PostList bucket={bucket} displayCount={3} title={postData.title} />
      </Section>
    </div>,
  );
});
