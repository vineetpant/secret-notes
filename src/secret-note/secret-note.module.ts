import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretNote } from './secret-note.entity';
import { SecretNoteService } from './secret-note.service';
import { SecretNoteController } from './secret-note.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SecretNote])],
  providers: [SecretNoteService],
  controllers: [SecretNoteController],
})
export class SecretNoteModule {}
