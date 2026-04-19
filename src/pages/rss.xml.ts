import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: '봉동이.blog',
    description: '서버와 앱 사이, 그 틈에서 배운 것들',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((p) => ({
        title: p.data.title,
        description: p.data.description ?? '',
        pubDate: p.data.pubDate,
        link: `/blog/${p.id}/`,
      })),
  });
}
