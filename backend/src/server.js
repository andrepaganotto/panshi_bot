import app from "./app.js";
import database from './db.js'

(async () => {
    try {
        await database.sync();
        console.log(`Running database: ${process.env.DB_NAME}`);

        const port = parseInt(process.env.PORT);
        const server = app.listen(port, () => console.log(`Running on port: ${port}`));

        
    }
    catch (err) {
        console.error(err);
    }

})();
