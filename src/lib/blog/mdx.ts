import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxOptions: any = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: 'wrap', properties: { className: ['anchor'] } },
      ],
      [
        rehypePrettyCode,
        { theme: 'github-dark', keepBackground: false },
      ],
    ],
  },
};
