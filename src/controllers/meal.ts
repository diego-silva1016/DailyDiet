import { FastifyInstance } from 'fastify'
import { UUID, randomUUID } from 'node:crypto'
import { knex } from '../database/connect';

interface IBody {
    name: string;
    description: string;
    inDiet: boolean;
    date: string;
}

interface IEditParams {
    mealId: UUID;
}

interface Meal {
    id: UUID,
    name: string;
    description: string;
    inDiet: boolean;
    date: string;
    userId: UUID,
}

export async function Meal(app: FastifyInstance) {
    app.post<{
        Body: IBody
    }>('/', async (request, reply) => {
        const { name, description, inDiet, date } = request.body;

        const userId = request.cookies.userId;

        if(!userId)
            throw new Error("Não é possível criar uma refeição sem estar logado.")

        await knex('meals').insert({
            id: randomUUID(),
            name,
            description,
            inDiet,
            date:  new Date(date),
            userId
        })

        reply.status(201).send()
    })

    app.get('/', async (request, reply) => {
        const userId = request.cookies.userId;

        if(!userId)
            throw new Error("Não é possível listar as refeições sem estar logado.")

        const meals = await knex('meals').where('userId', userId).select();

        reply.status(200).send(meals)
    })

    app.get<{
        Params: IEditParams
    }>('/:mealId', async (request, reply) => {
        const { mealId } = request.params;
        const userId = request.cookies.userId;

        if(!userId)
            throw new Error("Não é possível listar as refeições sem estar logado.")

        const meal = await knex('meals').where({
            id: mealId,
            userId
        }).select().first();

        reply.status(200).send(meal)
    })

    app.get('/metrics', async (request, reply) => {
        const userId = request.cookies.userId;

        if(!userId)
            throw new Error("Não é possível listar as metricas sem estar logado.")

        const meals = await knex('meals').where({
            userId
        }).select();

        const totalRegisters = meals.length;
        const totalRegistersInDiet = meals.filter(m => m.inDiet).length
        const totalRegistersOffDiet = meals.filter(m => !m.inDiet).length

        const mealsGroups: Meal[][] = []
        let group: Meal[] = []

        meals.sort((a, b) => b.date - a.date).forEach(element => {
            if(element.inDiet)
                group.push(element)
            else{
                mealsGroups.push(group)
                group = []
            }
        });

        mealsGroups.push(group)

        const bestSequence = mealsGroups.sort((a, b) => b.length - a.length)[0].length

        reply.status(200).send({
            totalRegisters,
            totalRegistersInDiet,
            totalRegistersOffDiet,
            bestSequence
        })
    })

    app.patch<{
        Params: IEditParams,
        Body: IBody
    }>('/:mealId', async (request, reply) => {
        const { mealId } = request.params;
        const { name, description, inDiet, date } = request.body;

        const userId = request.cookies.userId;

        if(!userId)
            throw new Error("Não é possível editar uma refeição sem estar logado.")

        const meal = await knex('meals').where({
            id: mealId,
            userId
        }).select().first();

        if(!meal)
            throw new Error("Refeição não encontrada.")

        meal.name = name;
        meal.description = description;
        meal.inDiet = inDiet;
        meal.date = new Date(date);

        await knex('meals').where({
            id: mealId,
            userId
        }).update(meal);

        reply.status(200)
    })

    app.delete<{
        Params: IEditParams
    }>('/:mealId', async (request, reply) => {
        const { mealId } = request.params;

        const userId = request.cookies.userId;

        if(!userId)
            throw new Error("Não é possível deletar uma refeição sem estar logado.")

        await knex('meals').where({
            id: mealId,
            userId
        }).delete();

        reply.status(200)
    })
}