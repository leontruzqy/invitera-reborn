import { migrate } from 'drizzle-orm/libsql/migrator';
import { fileURLToPath } from 'node:url';
import { client, db } from './client';

const migrationsFolder = fileURLToPath(new URL('../migrations', import.meta.url));

console.log(`Applying migrations from ${migrationsFolder} ...`);
await migrate(db, { migrationsFolder });
console.log('✔ migrations applied');
client.close();
