import { z } from 'zod';

export const ProductShowcaseCrossRefSchema = z.object({
  brand: z.string().min(1).max(60),
  codes: z.string().min(1).max(240),
});

export const ProductShowcaseItemSchema = z.object({
  productId: z.string().min(1),
  description: z.string().max(280).nullable().optional(),
  applicationText: z.string().max(200).nullable().optional(),
  crossRefs: z.array(ProductShowcaseCrossRefSchema).max(6).optional(),
  moq: z.string().max(40).nullable().optional(),
  cont: z.string().max(40).nullable().optional(),
  priceText: z.string().max(60).nullable().optional(),
  pricePerCaseText: z.string().max(60).nullable().optional(),
  specialBadge: z.string().max(20).nullable().optional(),
});

export const ProductShowcaseConfigSchema = z.object({
  overlayHeadlineAccent: z.string().max(60).nullable().optional(),
  overlayHeadlineRest: z.string().max(120).nullable().optional(),
  overlaySubtitle: z.string().max(160).nullable().optional(),
  products: z.array(ProductShowcaseItemSchema).max(2).default([]),
  showImage: z.boolean().default(true),
  showApplication: z.boolean().default(true),
  showCrossRefs: z.boolean().default(true),
  showMoqCont: z.boolean().default(true),
  showPrice: z.boolean().default(true),
  footerStockText: z.string().max(120).nullable().optional(),
  footerBrandsText: z.string().max(200).nullable().optional(),
});

export type ProductShowcaseCrossRef = z.infer<typeof ProductShowcaseCrossRefSchema>;
export type ProductShowcaseItem = z.infer<typeof ProductShowcaseItemSchema>;
export type ProductShowcaseConfig = z.infer<typeof ProductShowcaseConfigSchema>;

export interface ProductShowcaseProductData {
  id: string;
  code: string;
  imageUrl: string | null;
}

export interface ProductShowcaseEnrichedConfig extends ProductShowcaseConfig {
  productsData?: Record<string, ProductShowcaseProductData>;
}
