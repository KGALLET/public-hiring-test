import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { GreenlyDataSource, dataSource } from "../config/dataSource";
import { AppModule } from "../src/app.module";
import { FoodProductDto } from "../src/food-product-carbonfootprint/dto/food-product.dto";
import { FoodProductCarbonfootPrint } from "../src/food-product-carbonfootprint/entity/food-product-carbonfootprint.entity";

beforeAll(async () => {
    await dataSource.initialize();
    await GreenlyDataSource.cleanDatabase();
    await dataSource
            .getRepository(FoodProductCarbonfootPrint)
            .save([{ foodProductId: 1, carbonFootPrint: null }, { foodProductId: 2, carbonFootPrint: 0 }, { foodProductId: 3, carbonFootPrint: 0.254 }]);
});

afterAll(async () => {
  await dataSource.destroy();
});

describe('FoodProductCarbonFootprintController', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('GET - /carbon-footprint/:foodProductId', () => {
        it.each([{ foodProductId: 1, expectedCarbonFootPrint: null }, { foodProductId: 2, expectedCarbonFootPrint: 0 }, { foodProductId: 3, expectedCarbonFootPrint: 0.254 }])('should return %s for foodProductId %s', async ({ foodProductId, expectedCarbonFootPrint }) => {
            return request(app.getHttpServer())
                .get(`/carbon-footprint/${foodProductId}`)
                .expect(HttpStatus.OK)
                .expect(({ body }) => {
                    expect(body).toEqual({ foodProductId, carbonFootPrint: expectedCarbonFootPrint });
                });
        })

        it('Should return 404 when carbon-footprint is not found', async () => {
            return request(app.getHttpServer())
                .get(`/carbon-footprint/999`)
                .expect(HttpStatus.NOT_FOUND)
        })

        it('should return 400 bad request when foodProductId is not a number', async () => {
            return request(app.getHttpServer())
                .get(`/carbon-footprint/not-a-number`)
                .expect(HttpStatus.BAD_REQUEST).expect(({ body }) => {
                    const { error, statusCode, message } = body;
                    expect(error).toEqual('Bad Request');
                    expect(statusCode).toEqual(HttpStatus.BAD_REQUEST);
                    expect(message).toEqual('Validation failed. "not-a-number" is not a valid food product id.');
                })
        })
    })

    // describe('POST - /carbon-footprint', () => {
    //     it('should return 400 bad request when foodProductDto is not valid', async () => {
    //         return request(app.getHttpServer())
    //             .post("/carbon-footprint")
    //             .send({ ingredients: [{ name: 1, unit: 'kg', quantity: '2' }]})
    //             .expect(HttpStatus.BAD_REQUEST)
    //             .expect(({ body }) => {
    //                 const { error, statusCode, message } = body;
    //                 expect(error).toEqual('Bad Request');
    //                 expect(statusCode).toEqual(HttpStatus.BAD_REQUEST);
    //                 expect(message).toEqual(["ingredients.0.name: Expected string, received number", "ingredients.0.quantity: Expected number, received string"]);
    //             });
    //     })
        
    //     it('should calculate the carbonfootprint and save it in db, returning 201 and without response body', async () => {
    //         const foodProductDto: FoodProductDto = {
    //             ingredients: [
    //                 { name: 'flour', unit: 'kg', quantity: 2 },
    //                 { name: 'ham', unit: 'kg', quantity: 1 }
    //             ]
    //         }
    //         return request(app.getHttpServer())
    //             .post("/carbon-footprint")
    //             .send(foodProductDto)
    //             .expect(HttpStatus.CREATED)
    //             .expect(({ body }) => {
    //                 expect(body[0]).toBeUndefined();
    //             });
    //     });
    
    //     it('should calculate the carbonfootprint and save it in db, returning 201 and with response body', async () => {
    //         const foodProductDto: FoodProductDto = {
    //             ingredients: [
    //                 { name: 'flour', unit: 'kg', quantity: 2 },
    //                 { name: 'ham', unit: 'kg', quantity: 1 }
    //             ]
    //         }
    //         return request(app.getHttpServer())
    //             .post("/carbon-footprint?withResult=true")
    //             .send(foodProductDto)
    //             .expect(HttpStatus.CREATED)
    //             .expect(({ body }) => {
    //                 expect(body).not.toBeUndefined()
    //             });
    //     });
    // })
})