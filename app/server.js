const main = require("./app");

(async () => {
    const app = await main();
    const SERVER_PORT = process.env.PORT || 3000;
    app.listen(SERVER_PORT, () => console.log(`Azure VM self-service app listening on port ${SERVER_PORT}!`));
})();
