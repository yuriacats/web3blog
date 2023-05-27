import express from 'express'
const app: express.Express = express()
const port = process.env.PORT || 8000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*")
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

app.listen(port, () => {
    console.log(`start on port ${port}`)
})

type User = {
    id: number,
    name: string,
    email: string,
}

const users: User[] = [
    { id: 1, name: "John", email: "user1@test.local" },
    { id: 2, name: "John.J", email: "user2@test.local" },
    { id: 3, name: "John.M", email: "user3@test.local" },
]

app.get('/users', (req: express.Request, res: express.Response) => {
    res.json(users)
});
