import { CATEGORY_STYLE, DEFAULT_CATEGORY_STYLE } from '../data/content';
// content lives at the project root `content/` folder — from `src/lib` we need to go up two levels
const modules = import.meta.glob('../../content/blog/**/*.mdx', { eager: true });

const posts = Object.entries(modules).map(([path, module]) => {
  const parts = path.split('/');
  const categorySlug = parts[parts.length - 2];
  const filename = parts[parts.length - 1];
  const slug = filename.replace(/\.mdx$/, '');
  const frontmatter = module.frontmatter || {};
  const category = frontmatter.category || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  const date = frontmatter.date ? new Date(frontmatter.date) : new Date(0);

  return {
    ...frontmatter,
    slug,
    categorySlug,
    category,
    date,
    Component: module.default,
  };
});

const allPosts = posts
  .sort((a, b) => b.date - a.date)
  .map((post) => ({
    ...post,
    summary: post.summary || '',
    tags: post.tags || [],
  }));

const categories = Array.from(
  allPosts.reduce((map, post) => {
    if (!map.has(post.categorySlug)) {
      map.set(post.categorySlug, {
        categorySlug: post.categorySlug,
        category: post.category,
        count: 0,
      });
    }
    map.get(post.categorySlug).count += 1;
    return map;
  }, new Map()).values()
);

export function getAllPosts() {
  return allPosts;
}

export function getPostsByCategory(categorySlug) {
  if (!categorySlug) return allPosts;
  return allPosts.filter((post) => post.categorySlug === categorySlug);
}

export function getPost(categorySlug, slug) {
  return allPosts.find((post) => post.categorySlug === categorySlug && post.slug === slug);
}

export function getCategories() {
  return categories;
}

export function getAdjacentPosts(categorySlug, slug) {
  const index = allPosts.findIndex((post) => post.categorySlug === categorySlug && post.slug === slug);
  return {
    newer: index > 0 ? allPosts[index - 1] : null,
    older: index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null,
  };
}

export function categoryStyle(categorySlug) {
  return CATEGORY_STYLE[categorySlug] || DEFAULT_CATEGORY_STYLE;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}
