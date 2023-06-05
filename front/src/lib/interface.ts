import { z } from "zod";

export const slug = z.string().length(20);
export type Slug = z.infer<typeof slug>;
