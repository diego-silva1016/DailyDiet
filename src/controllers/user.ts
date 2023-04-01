import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database/connect';

interface IBody {
    name: string;
    email: string;
}

export async function User(app: FastifyInstance) {
    app.post<{
        Body: IBody
    }>('/', async (request, reply) => {
        const { name, email } = request.body;

        const userId = randomUUID()

        const user = await knex('users').insert({
            id: userId,
            name,
            email
        })

        reply.cookie('userId', userId, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7 //7 days
        })

        reply.status(201).send(user)
    })

    app.get('/', async (request, reply) => {
        const users = await knex('users').select();

        reply.status(200).send(users)
    })
}