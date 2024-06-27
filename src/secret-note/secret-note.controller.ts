import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SecretNoteService } from './secret-note.service';
import { SecretNote } from './secret-note.entity';

@ApiTags('secret-notes')
@Controller('secret-notes')
export class SecretNoteController {
  private readonly logger = new Logger(SecretNoteController.name);
  constructor(private readonly secretNoteService: SecretNoteService) {}

  @ApiOperation({ summary: 'Create a new secret note' })
  @ApiBody({
    description: 'The note',
    schema: { example: { note: 'The note content' } },
  })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully created.',
    type: SecretNote,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post()
  async create(@Body('note') note: string): Promise<SecretNote> {
    if (!note) {
      this.logger.warn('Create Note - Note content must be provided');
      throw new BadRequestException('Note content must be provided');
    }
    const createdNote = await this.secretNoteService.create(note);
    this.logger.log(`Create Note - Note created with ID: ${createdNote.id}`);
    return createdNote;
  }

  @ApiOperation({ summary: 'Retrieve all secret notes' })
  @ApiResponse({
    status: 200,
    description: 'List of secret notes',
    type: [SecretNote],
  })
  @Get()
  async findAll(): Promise<Partial<SecretNote>[]> {
    this.logger.log('Find All Notes - Request received');
    const notes = await this.secretNoteService.findAll();
    this.logger.log(`Find All Notes - ${notes.length} notes found`);
    return notes;
  }

  @ApiOperation({ summary: 'Retrieve a single secret note' })
  @ApiParam({ name: 'id', description: 'ID of the note' })
  @ApiQuery({
    name: 'decrypt',
    description: 'Whether to decrypt the note',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'The secret note',
    type: SecretNote,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Query('decrypt') decrypt: string,
  ): Promise<SecretNote> {
    this.logger.log(`Find Note - Request received for ID: ${id}`);
    const shouldDecrypt = decrypt === 'true';
    const note = await this.secretNoteService.findOne(id, shouldDecrypt);
    this.logger.log(`Find Note - Note found with ID: ${id}`);
    return note;
  }

  @ApiOperation({ summary: 'Update a secret note' })
  @ApiParam({ name: 'id', description: 'ID of the note' })
  @ApiBody({
    description: 'The updated note content',
    schema: { example: { note: 'Updated note content' } },
  })
  @ApiResponse({
    status: 200,
    description: 'The updated note',
    type: SecretNote,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body('note') note: string,
  ): Promise<SecretNote> {
    if (!note) {
      this.logger.warn(
        `Update Note - Note content must be provided for ID: ${id}`,
      );
      throw new BadRequestException('Note content must be provided');
    }
    this.logger.log(`Update Note - Request received for ID: ${id}`);
    const updatedNote = await this.secretNoteService.update(id, note);
    this.logger.log(`Update Note - Note updated with ID: ${id}`);
    return updatedNote;
  }

  @ApiOperation({ summary: 'Delete a secret note' })
  @ApiParam({ name: 'id', description: 'ID of the note' })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    this.logger.log(`Delete Note - Request received for ID: ${id}`);
    await this.secretNoteService.remove(id);
    this.logger.log(`Delete Note - Note deleted with ID: ${id}`);
  }
}
