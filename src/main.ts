import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import pkg from 'package.json'
import { NestExpressApplication } from '@nestjs/platform-express'
import path from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix(process.env.API_PREFIX, {
    exclude: ['']
  })

  app.enableCors({
    allowedHeaders: '*',
    origin: '*'
  })

  app.useStaticAssets(path.join(__dirname, 'public'))
  app.setBaseViewsDir(path.join(__dirname, 'views'))
  app.setViewEngine('hbs')

  app.useLogger(['log', 'debug', 'error', 'fatal', 'verbose', 'warn'])

  const config = new DocumentBuilder()
    .setTitle(pkg.name)
    .setDescription(pkg.description)
    .setVersion(pkg.version)
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    // operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    ignoreGlobalPrefix: false
  })

  SwaggerModule.setup('docs', app, document)

  await app.listen(process.env.PORT)
}

bootstrap()
