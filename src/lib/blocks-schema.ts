import { z } from 'zod';

export const HeroBlockSchema = z.object({
  type: z.literal('hero'),
  title: z.string(),
  subtitle: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  image_url: z.string().url().optional(),
});

export const FeaturesBlockSchema = z.object({
  type: z.literal('features'),
  title: z.string(),
  items: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })),
});

export const PageConfigSchema = z.array(z.union([
  HeroBlockSchema,
  FeaturesBlockSchema,
]));

export type HeroBlock = z.infer<typeof HeroBlockSchema>;
export type FeaturesBlock = z.infer<typeof FeaturesBlockSchema>;
export type PageConfig = z.infer<typeof PageConfigSchema>;
