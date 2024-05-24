import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("food_product_carbonfootprint")
export class FoodProductCarbonfootPrint extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: "food_product_id",
    })
    foodProductId: number;

    @Column({
        nullable: true,
        name: "carbon_footprint",
        type: 'float'
    })
    carbonFootPrint: number | null;
}
