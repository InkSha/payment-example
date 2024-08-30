import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { PaypalModule } from './modules/paypal/paypal.module'
import { AsiabillModule } from '@/modules/asiabill/asiabill.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    ScheduleModule.forRoot(),
    PaypalModule,
    AsiabillModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE, useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
