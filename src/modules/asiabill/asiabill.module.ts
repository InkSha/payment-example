import { AsiabillController } from '@/modules/asiabill/asiabill.controller'
import { AsiabillService } from '@/modules/asiabill/asiabill.service'
import { Module } from '@nestjs/common'

@Module({
  controllers: [AsiabillController],
  providers: [AsiabillService]
})
export class AsiabillModule {}
