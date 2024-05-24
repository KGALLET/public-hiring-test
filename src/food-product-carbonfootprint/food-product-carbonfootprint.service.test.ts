import { createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarbonEmissionFactor } from '../carbonEmissionFactor/carbonEmissionFactor.entity';
import { CarbonEmissionFactorsService } from '../carbonEmissionFactor/carbonEmissionFactors.service';
import { FoodProductCarbonfootPrint } from './entity/food-product-carbonfootprint.entity';
import { FoodProductCarbonfootprintService } from './food-product-carbonfootprint.service';


describe('FoodProductCarbonfootprintService', () => {
  let service: FoodProductCarbonfootprintService;
  const mockCarbonEmissionFactorsService = createMock<CarbonEmissionFactorsService>()
  const mockCarbonEmissionFactorsProvider = { provide: CarbonEmissionFactorsService, useValue: mockCarbonEmissionFactorsService }
  const mockFoodProductCarbonfootPrintRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodProductCarbonfootprintService, mockCarbonEmissionFactorsProvider, { provide: getRepositoryToken(FoodProductCarbonfootPrint), useValue: mockFoodProductCarbonfootPrintRepository }]
    }).compile();

    service = module.get<FoodProductCarbonfootprintService>(FoodProductCarbonfootprintService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFoodProductCarbonFootprint', () => { 
    it('should save food product carbon footprint', async () => {
      const foodProductCarbonfootprint = { foodProductId: 1, carbonFootPrint: 1 }
      mockFoodProductCarbonfootPrintRepository.create.mockReturnValue(foodProductCarbonfootprint)
      mockFoodProductCarbonfootPrintRepository.save.mockResolvedValue(foodProductCarbonfootprint)

      expect(service.saveFoodProductCarbonFootprint(foodProductCarbonfootprint)).resolves.toEqual(foodProductCarbonfootprint)
    })
  })

  describe('getFoodProductCarbonFootprint', () => {
    const foodProductId = 1
    it('should throw not found exception when food product is not found', () => { 
      mockFoodProductCarbonfootPrintRepository.findOne.mockResolvedValue(null)

      expect(service.getFoodProductCarbonFootprint(foodProductId)).rejects.toThrow(new NotFoundException(`Food product with id 1 not found`))
    })

    it('should return the food product carbon footprint', async () => {
      const expectedResult = { foodProductId, carbonFootPrint: 0.254 }
      mockFoodProductCarbonfootPrintRepository.findOne.mockResolvedValue(expectedResult)
      expect(service.getFoodProductCarbonFootprint(foodProductId)).resolves.toEqual(expectedResult)
    })
  })

  describe('calculateFoodCarbonFootprint', () => {
    it('should return null carbon footprint when ingredient does not have CO2 emission', async () => {
      const foodProductDto = { ingredients: [{ name: 'flour', quantity: 1, unit: 'kg' }, { name: 'ham', quantity: 1, unit: 'kg' }] }
      mockCarbonEmissionFactorsService.findAllByNames.mockResolvedValue([{ name: 'ham', emissionCO2eInKgPerUnit: 0.254 }] as CarbonEmissionFactor[])
      mockFoodProductCarbonfootPrintRepository.save.mockResolvedValue({ foodProductId: 1, carbonFootPrint: null })

      expect(service.calculateFoodCarbonFootprint(foodProductDto)).resolves.toEqual({ foodProductId: 1, carbonFootPrint: null })
    })

    it('should return the food product carbon footprint', async () => {
      const foodProductDto = { ingredients: [{ name: 'flour', quantity: 1, unit:'kg' }, { name: 'ham', quantity: 1, unit:'kg' }] }
      mockCarbonEmissionFactorsService.findAllByNames.mockResolvedValue([{ name: 'flour', emissionCO2eInKgPerUnit: 0.254 }, { name: 'ham', emissionCO2eInKgPerUnit: 0.254 }] as CarbonEmissionFactor[])
      mockFoodProductCarbonfootPrintRepository.save.mockResolvedValue({ foodProductId: 1, carbonFootPrint: 0.508 })

      expect(service.calculateFoodCarbonFootprint(foodProductDto)).resolves.toEqual({ foodProductId: 1, carbonFootPrint: 0.508 })
    })
  })
});