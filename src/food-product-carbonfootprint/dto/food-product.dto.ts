import { createZodDto } from "@anatine/zod-nestjs";
import { extendApi } from "@anatine/zod-openapi";
import { z } from "zod";

const FoodProductIngredientSchema = z.object({
  name: z.string(),
  unit: z.string(),
  emissionCO2eInKgPerUnit: z.number().optional(),
  quantity: z.number(),
})

const FoodProductSchema = z.object({
    ingredients: z.array(FoodProductIngredientSchema),
})

export class FoodProductIngredientDto extends createZodDto(FoodProductIngredientSchema) {}
export class FoodProductDto extends createZodDto(FoodProductSchema) {}

const FoodProductCarbonfootPrintSchema = extendApi(z.object({
    foodProductId: z.number(),
    carbonFootPrint: z.number()
  })
)

export class FoodProductCarbonfootPrintDto extends createZodDto(FoodProductCarbonfootPrintSchema) {}