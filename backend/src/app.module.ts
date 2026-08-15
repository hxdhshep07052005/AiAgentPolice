import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    UsersModule,
    CasesModule,
    // TasksModule - Removed (sử dụng task system từ CasesModule)
    ChatModule,
    AiModule,
  ],
})
export class AppModule {}
