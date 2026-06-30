/// <reference path="./basehub-types.d.ts" />
import { log } from "@repo/observability/log";
import type { QueryGenqlSelection } from "basehub";
import { basehub as basehubClient, fragmentOn } from "basehub";
import { keys } from "./keys";
import "./basehub.config";

const { BASEHUB_TOKEN } = keys();

const basehub = BASEHUB_TOKEN
  ? basehubClient({ token: BASEHUB_TOKEN })
  : undefined;

if (!basehub) {
  log.info("Skipping CMS: set BASEHUB_TOKEN to enable");
}

const imageFragment = fragmentOn("BlockImage", {
  url: true,
  width: true,
  height: true,
  alt: true,
  blurDataURL: true,
});

const postMetaFragment = fragmentOn("PostsItem", {
  _slug: true,
  _title: true,
  authors: {
    _title: true,
    avatar: imageFragment,
    xUrl: true,
  },
  categories: {
    _title: true,
  },
  date: true,
  description: true,
  image: imageFragment,
});

const postFragment = fragmentOn("PostsItem", {
  ...postMetaFragment,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
});

export type PostMeta = fragmentOn.infer<typeof postMetaFragment>;
export type Post = fragmentOn.infer<typeof postFragment>;

export const blog = {
  postsQuery: {
    blog: {
      posts: {
        items: postMetaFragment,
      },
    },
  } satisfies QueryGenqlSelection,

  latestPostQuery: {
    blog: {
      posts: {
        __args: {
          orderBy: "_sys_createdAt__DESC" as const,
        },
        item: postFragment,
      },
    },
  } satisfies QueryGenqlSelection,

  postQuery: (slug: string) => ({
    blog: {
      posts: {
        __args: {
          filter: {
            _sys_slug: { eq: slug },
          },
        },
        item: postFragment,
      },
    },
  }),

  getPosts: async (): Promise<PostMeta[]> => {
    if (!basehub) {
      return [];
    }

    try {
      const data = await basehub.query(blog.postsQuery);
      return data.blog.posts.items;
    } catch (error) {
      log.error(`Failed to fetch blog posts from BaseHub: ${error}`);
      return [];
    }
  },

  getLatestPost: async (): Promise<Post | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const data = await basehub.query(blog.latestPostQuery);
      return data.blog.posts.item;
    } catch (error) {
      log.error(`Failed to fetch latest blog post from BaseHub: ${error}`);
      return null;
    }
  },

  getPost: async (slug: string): Promise<Post | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const query = blog.postQuery(slug);
      const data = await basehub.query(query);
      return data.blog.posts.item;
    } catch (error) {
      log.error(`Failed to fetch blog post from BaseHub: ${error}`);
      return null;
    }
  },
};

const legalPostMetaFragment = fragmentOn("LegalPagesItem", {
  _slug: true,
  _title: true,
  description: true,
});

const legalPostFragment = fragmentOn("LegalPagesItem", {
  ...legalPostMetaFragment,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
});

export type LegalPostMeta = fragmentOn.infer<typeof legalPostMetaFragment>;
export type LegalPost = fragmentOn.infer<typeof legalPostFragment>;

export const legal = {
  postsMetaQuery: {
    legalPages: {
      items: legalPostMetaFragment,
    },
  } satisfies QueryGenqlSelection,

  postsQuery: {
    legalPages: {
      items: legalPostFragment,
    },
  } satisfies QueryGenqlSelection,

  latestPostQuery: {
    legalPages: {
      __args: {
        orderBy: "_sys_createdAt__DESC" as const,
      },
      item: legalPostFragment,
    },
  } satisfies QueryGenqlSelection,

  postQuery: (slug: string) => ({
    legalPages: {
      __args: {
        filter: {
          _sys_slug: { eq: slug },
        },
      },
      item: legalPostFragment,
    },
  }),

  getPostsMeta: async (): Promise<LegalPostMeta[]> => {
    if (!basehub) {
      return [];
    }

    try {
      const data = await basehub.query(legal.postsMetaQuery);
      return data.legalPages.items;
    } catch (error) {
      log.error(`Failed to fetch legal page metadata from BaseHub: ${error}`);
      return [];
    }
  },

  getPosts: async (): Promise<LegalPost[]> => {
    if (!basehub) {
      return [];
    }

    try {
      const data = await basehub.query(legal.postsQuery);
      return data.legalPages.items;
    } catch (error) {
      log.error(`Failed to fetch legal pages from BaseHub: ${error}`);
      return [];
    }
  },

  getLatestPost: async (): Promise<LegalPost | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const data = await basehub.query(legal.latestPostQuery);
      return data.legalPages.item;
    } catch (error) {
      log.error(`Failed to fetch latest legal page from BaseHub: ${error}`);
      return null;
    }
  },

  getPost: async (slug: string): Promise<LegalPost | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const query = legal.postQuery(slug);
      const data = await basehub.query(query);
      return data.legalPages.item;
    } catch (error) {
      log.error(`Failed to fetch legal page from BaseHub: ${error}`);
      return null;
    }
  },
};
