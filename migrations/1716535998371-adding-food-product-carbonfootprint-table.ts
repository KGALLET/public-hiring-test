import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingFoodProductCarbonfootprintTable1716535998371 implements MigrationInterface {
    name = 'AddingFoodProductCarbonfootprintTable1716535998371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "food_product_carbonfootprint" ("food_product_id" SERIAL NOT NULL, "carbon_footprint" double precision, CONSTRAINT "PK_2f5329e5663a57115ce9a5fa03f" PRIMARY KEY ("food_product_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "food_product_carbonfootprint"`);
    }

}
