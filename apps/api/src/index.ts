import './env';
import { createApp } from './app';
import { env } from './env';

createApp().listen(env.port, () => {
  console.log(`ShopStack API listening on http://localhost:${env.port}`);
});
