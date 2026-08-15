import { Module, forwardRef } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SimpleVectorStoreService } from './simple-vector-store.service';
import { RagService } from './rag.service';
import { CaseIndexerService } from './case-indexer.service';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [forwardRef(() => CasesModule)],
  controllers: [AiController],
  providers: [
    AiService,
    SimpleVectorStoreService,
    RagService,
    CaseIndexerService,
  ],
  exports: [AiService, SimpleVectorStoreService, RagService, CaseIndexerService],
})
export class AiModule {}
