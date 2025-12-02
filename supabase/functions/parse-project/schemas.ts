import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Core Estimate Schema - ensures AI always returns structured, valid data
export const EstimateSchema = z.object({
  project_header: z.object({
    client_name: z.string().nullable().optional(),
    project_type: z.enum(["Kitchen", "Bathroom", "Combination", "Other"]),
    overall_size_sqft: z.number().nullable().optional(),
  }),
  
  dimensions: z.object({
    ceiling_height_ft: z.number().default(8),
    room_length_ft: z.number().nullable().optional(),
    room_width_ft: z.number().nullable().optional(),
    shower_length_ft: z.number().nullable().optional(),
    shower_width_ft: z.number().nullable().optional(),
    shower_floor_sqft: z.number().nullable().optional(),
    shower_wall_sqft: z.number().nullable().optional(),
    main_floor_sqft: z.number().nullable().optional(),
    countertop_sqft: z.number().nullable().optional(),
  }),
  
  trade_buckets: z.array(
    z.object({
      category: z.string(), // e.g., "Demolition", "Plumbing", "Tile"
      task_description: z.string(), // e.g., "Remove shower fixture and tile to studs"
      quantity: z.number(),
      unit: z.enum(["sqft", "ea", "lf"]),
      margin_override: z.string().nullable().optional(),
    })
  ),
  
  allowances: z.array(
    z.object({
      item: z.string(),
      quantity: z.number(),
      notes: z.string().optional(),
    })
  ).optional().default([]),
  
  exclusions: z.array(z.string()).optional().default([]),
  
  warnings: z.array(z.string()).optional().default([]),
});

export type EstimateData = z.infer<typeof EstimateSchema>;
