import { GreenlyDataSource, dataSource } from "../../config/dataSource";
import { getTestEmissionFactor } from "../seed-dev-data";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "./carbonEmissionFactors.service";

let flourEmissionFactor = getTestEmissionFactor("flour");
let hamEmissionFactor = getTestEmissionFactor("ham");
let olivedOilEmissionFactor = getTestEmissionFactor("oliveOil");
let carbonEmissionFactorService: CarbonEmissionFactorsService;

beforeAll(async () => {
  await dataSource.initialize();
  carbonEmissionFactorService = new CarbonEmissionFactorsService(
    dataSource.getRepository(CarbonEmissionFactor)
  );
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
  await dataSource
    .getRepository(CarbonEmissionFactor)
    .save(olivedOilEmissionFactor);
});

describe("CarbonEmissionFactors.service", () => {
  it("should save new emissionFactors", async () => {
    await carbonEmissionFactorService.save([
      hamEmissionFactor,
      flourEmissionFactor,
    ]);
    const retrieveFlourEmissionFactor = await dataSource
      .getRepository(CarbonEmissionFactor)
      .findOne({ where: { name: "flour" } });
    expect(retrieveFlourEmissionFactor?.name).toBe("flour");
  });
  it("should retrieve emission Factors", async () => {
    const carbonEmissionFactors = await carbonEmissionFactorService.findAll();
    expect(carbonEmissionFactors).toHaveLength(1);
  });

  describe('findAllByNames', () => {
    beforeEach(async () => {
      await dataSource
          .getRepository(CarbonEmissionFactor)
          .save([flourEmissionFactor, hamEmissionFactor, olivedOilEmissionFactor])
    })

    it('should return all emission factors with the given names', async () => {
      const names = ['ham', 'flour', 'oliveOil', 'any-other-ingredient']
      const carbonEmissionFactors = await carbonEmissionFactorService.findAllByNames(names);
      expect(carbonEmissionFactors).toHaveLength(3);
      expect(carbonEmissionFactors.find((em) => em.name === 'any-other-ingredient')).toBeUndefined();
    })
  })
});

afterAll(async () => {
  await dataSource.destroy();
});

