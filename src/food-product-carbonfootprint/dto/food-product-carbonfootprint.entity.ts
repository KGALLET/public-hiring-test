import { createZodDto } from "@anatine/zod-nestjs";
import { z } from "zod";

const FoodProductCarbonFootprintSchema = z.object({
    carbonFootPrint: z.number().nullable(),
    foodProductId: z.number(),
});

const CreateFoodProductCarbonFootprintSchema = FoodProductCarbonFootprintSchema.omit({ foodProductId: true });

export class CreateFoodProductCarbonFootprintDto extends createZodDto(CreateFoodProductCarbonFootprintSchema) {}