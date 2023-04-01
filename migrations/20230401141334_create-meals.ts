import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary()
        table.string('name').notNullable()
        table.string('description').notNullable()
        table.boolean('inDiet').notNullable()
        table.date('date').notNullable()
        table.uuid('userId').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}

