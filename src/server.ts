import fastify from "fastify";
import cookie from '@fastify/cookie'
import { User } from "./controllers/user";
import { Meal } from "./controllers/meal";

const app = fastify()

app.register(cookie)

app.register(User, {
    prefix: 'users'
})

app.register(Meal, {
    prefix: 'meals'
})

app.listen({
    port: 3333
}).then(() => {
    console.log("HTTP Server Running!")
})