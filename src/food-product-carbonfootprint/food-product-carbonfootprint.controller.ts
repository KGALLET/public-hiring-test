import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { BadRequestException, Body, Controller, Get, HttpStatus, Logger, Param, Post, Query, Res, UsePipes } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { FoodProductCarbonfootPrintDto, FoodProductDto } from './dto/food-product.dto';
import { FoodProductCarbonfootprintService } from './food-product-carbonfootprint.service';

@Controller('carbon-footprint')
@UsePipes(ZodValidationPipe)
export class FoodProductCarbonfootprintController {
    private readonly logger = new Logger(FoodProductCarbonfootprintController.name);

    constructor(private readonly foodProductCarbonfootprintService: FoodProductCarbonfootprintService) { }

    @Get(':foodProductId')
    @ApiOkResponse({
        type: FoodProductCarbonfootPrintDto
    })
    @ApiOperation({ summary: 'Get the food product carbon footprint' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Food product id malformed.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error occured on the server.' })
    getFoodProductCarbonFootprint(@Param('foodProductId') foodProductId: string) {
        this.logger.log(`[carbon-footprint/:foodProductId] - [GET] Getting carbon footprint for food product with id ${foodProductId}`);
        const foodProductIdNumber = parseInt(foodProductId, 10);
        
        // Only to keep the same logic as the carbonEmissionFactor data structure, I set the foodProductId to be a number, 
        // but most of the times, in real application, it should be a string corresponding to an uuid or something similar
        // so this check is done only for the sake of the exercise
        if (isNaN(foodProductIdNumber)) {
            throw new BadRequestException(`Validation failed. "${foodProductId}" is not a valid food product id.`);
        }

        return this.foodProductCarbonfootprintService.getFoodProductCarbonFootprint(+foodProductId)
    }
    
    @Post()
    @ApiCreatedResponse({
        type: FoodProductCarbonfootPrintDto,
        description: 'The food product carbon footprint was calculated successfully.',
    })
    @ApiNoContentResponse({
        description: 'The calculation was performed, but the result is not included in the response.',
    })
    @ApiQuery({ name: 'withResult', type: Boolean, required: false, description: 'If true, the result will be included in the response body.' })
    @ApiOperation({ summary: 'Calculate the food product carbon footprint' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Request body is not valid.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error occured on the server.' })
    async calculateFoodCarbonFootprint(@Body() foodProductDto: FoodProductDto, @Query('withResult') withResult: boolean = false, @Res() res: Response) {
        this.logger.log('[carbon-footprint] - [POST] Calculating the foot print of a food product');
        const carbonFootprint = await this.foodProductCarbonfootprintService.calculateFoodCarbonFootprint(foodProductDto);
        if (!withResult) {
            return res.status(HttpStatus.NO_CONTENT).send();
        }

        return res.status(HttpStatus.CREATED).send(carbonFootprint);
    }
}
