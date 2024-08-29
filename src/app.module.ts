import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { PaymentModule } from './modules/payments/payment.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    ScheduleModule.forRoot(),
    PaymentModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE, useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
