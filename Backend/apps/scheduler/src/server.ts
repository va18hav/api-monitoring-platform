import app from "./app.js";
import { logger } from 'shared';
import { syncDatabaseEndpointsWithQueue } from "./services/job.service.js";

const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
    logger.info(`The server up and running on port ${PORT}`);
    try {
        logger.info("Synchronizing database monitors with Redis queue...");
        await syncDatabaseEndpointsWithQueue();
        logger.info("Database monitor synchronization complete.");
    } catch (err) {
        logger.error(err, "Failed to synchronize database monitors");
    }
});