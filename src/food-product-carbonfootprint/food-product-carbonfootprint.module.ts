import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonEmissionFactorsModule } from '../carbonEmissionFactor/carbonEmissionFactors.module';
import { FoodProductCarbonfootPrint } from './entity/food-product-carbonfootprint.entity';
import { FoodProductCarbonfootprintController } from './food-product-carbonfootprint.controller';
import { FoodProductCarbonfootprintService } from './food-product-carbonfootprint.service';

@Module({
  providers: [FoodProductCarbonfootprintService],
  controllers: [FoodProductCarbonfootprintController],
  imports: [TypeOrmModule.forFeature([FoodProductCarbonfootPrint]), CarbonEmissionFactorsModule],

})
export class FoodProductCarbonfootprintModule {}
