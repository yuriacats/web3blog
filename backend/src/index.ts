import express from 'express'
import * as mysql from 'promise-mysql'
const app: express.Express = express()
const port = process.env.PORT || 8000;
const sql_user = process.env.SQL_USER;
const sql_password = process.env.SQL_PASSWORD;
const sql_host = process.env.SQL_HOST;
// dev-containerで接続する際に、docker-composeのdbを使うのでそれ用の値をデフォルト値にしています。

async function connection() {
    const connection = await mysql.createConnection({
        host: sql_host,
        user: sql_user,
        password: sql_password,
        database: 'webblog',
        multipleStatements: true
    });
    return connection
}

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


app.get('/users', (req: express.Request, res: express.Response) => {
    connection().then(connection => {
        const result = connection.query('SELECT * FROM author')
        connection.end();
        console.log(result)
        return result
    }).then((rows) => res.json(rows));
});
