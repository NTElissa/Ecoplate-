import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { ensureSuperAdmin } from './config/bootstrap.js';
import { getSettings } from './controllers/settingController.js';

async function start() {
  await connectDB();
  await ensureSuperAdmin();
  await getSettings();
  app.listen(env.port, () => {
    console.log(`Ecoplate API running on http://localhost:${env.port}`);
    console.log(`Staff sign-in page: /${env.adminLoginPath}`);
  });
}

start().catch((err) => {
  console.error('Could not start the server:', err.message);
  process.exit(1);
});
