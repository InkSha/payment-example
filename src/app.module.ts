import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { PaypalModule } from './modules/paypal/paypal.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    ScheduleModule.forRoot(),
    PaypalModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE, useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
