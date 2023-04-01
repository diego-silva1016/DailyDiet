import { knex as setupKenex } from 'knex'

export const config = {
    client: 'sqlite',
    connection: {
        filename: './src/database/app.db'
    },
    useNullAsDefault: true
}

export const knex = setupKenex(config)