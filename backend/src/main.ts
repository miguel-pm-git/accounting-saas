import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  //app.useGlobalInterceptors(app.get(TenantInterceptor));
}
await bootstrap();
