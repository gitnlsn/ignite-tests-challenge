import { createConnection, getConnectionOptions } from 'typeorm';

(async () => {
    const defaultOptions = await getConnectionOptions();

    await createConnection(
        Object.assign(defaultOptions, {
            database: process.env.NODE_ENV === 'test'
                ? "tests_challenge"
                : defaultOptions.database,
        })
    );
})();


