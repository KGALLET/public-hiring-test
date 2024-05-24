import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarbonEmissionFactorsService } from '../carbonEmissionFactor/carbonEmissionFactors.service';
import { CreateFoodProductCarbonFootprintDto } from './dto/food-product-carbonfootprint.entity';
import { FoodProductDto, FoodProductIngredientDto } from './dto/food-product.dto';
import { FoodProductCarbonfootPrint } from './entity/food-product-carbonfootprint.entity';

@Injectable()
export class FoodProductCarbonfootprintService {
    private readonly logger = new Logger(FoodProductCarbonfootprintService.name);

    constructor(@InjectRepository(FoodProductCarbonfootPrint)
        private readonly foodProductCarbonfootPrintRepository: Repository<FoodProductCarbonfootPrint>,
        private readonly carbonEmissionFactorsService: CarbonEmissionFactorsService) { }
    

    saveFoodProductCarbonFootprint(foodProductCarbonfootprint: CreateFoodProductCarbonFootprintDto): Promise<FoodProductCarbonfootPrint> { 
        const foodProductFootprint = this.foodProductCarbonfootPrintRepository.create(foodProductCarbonfootprint)

        return this.foodProductCarbonfootPrintRepository.save(foodProductFootprint);
    }

    async getFoodProductCarbonFootprint(foodProductId: number) {
        const foodProductCarbonfootprint = await this.foodProductCarbonfootPrintRepository.findOne({ where: { foodProductId } });

        if (!foodProductCarbonfootprint) {
            this.logger.log(`Food product with id ${foodProductId} not found`);
            throw new NotFoundException(`Food product with id ${foodProductId} not found`);
        }

        return foodProductCarbonfootprint;        
    }

    async calculateFoodCarbonFootprint(foodProductDto: FoodProductDto) {
        // First, we retrieve all the ingredients carbon emission factor for the food product from the database
        const foodProductIngredientsNames = foodProductDto.ingredients.map((i) => i.name);
        const carbonEmissionFactors = await this.carbonEmissionFactorsService.findAllByNames(foodProductIngredientsNames);

        // Than we check if all ingredient names have a corresponding CarbonEmissionFactor
        // If it's not the case footprint is set to null and saved in the db with generated id
        const missingCO2EmissionNames = foodProductIngredientsNames.filter(name =>
            !carbonEmissionFactors.some(cef => cef.name === name)
        );
        if (missingCO2EmissionNames.length > 0) {
            const createdFoodProductFootprint = await this.saveFoodProductCarbonFootprint({ carbonFootPrint: null })
            
            this.logger.log(`Ingredient(s) ${missingCO2EmissionNames.join(', ')} does not have CO2 emission, carbonfootprint is null for newly created food product footprint ${createdFoodProductFootprint.foodProductId}`);
            return createdFoodProductFootprint;
        }

        // Else we calculate the carbon footprint of the food product
        const carbonFootPrint = carbonEmissionFactors.reduce((acc, cef) => {
            // in case we should deal with unit, I would have done the conversion to fit with db unit before the reduce to iterate directly within,
            // but here we assume that the unit is the same for the ingredient and the carbon emission factor to keep things simple
            const ingredient = foodProductDto.ingredients.find(i => i.name === cef.name);
            return acc + (cef.emissionCO2eInKgPerUnit * (ingredient as FoodProductIngredientDto).quantity);
        }, 0);

        // we round the result to 3 decimals
        const createdFoodProductFootprint = await this.saveFoodProductCarbonFootprint({ carbonFootPrint: Number(carbonFootPrint.toFixed(3)) })

        this.logger.log(`Saved calculated carbonfootprint ${createdFoodProductFootprint.carbonFootPrint} for newly created footprint ${createdFoodProductFootprint.foodProductId}`);
        return createdFoodProductFootprint;
    }
}
