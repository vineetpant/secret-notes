import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecretNote } from './secret-note.entity';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class SecretNoteService {
  constructor(
    @InjectRepository(SecretNote)
    private secretNoteRepository: Repository<SecretNote>,
  ) {}

  /**
   * Encrypts the given text.
   * @param text - The text to encrypt.
   * @returns The encrypted text.
   */
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, 'secret_key').toString();
  }

  /**
   * Decrypts the given text.
   * @param text - The text to decrypt.
   * @returns The decrypted text.
   */
  private decrypt(text: string): string {
    const bytes = CryptoJS.AES.decrypt(text, 'secret_key');
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Creates a new secret note.
   * @param note - The content of the note.
   * @returns The created secret note.
   * @throws BadRequestException if the note content is not provided.
   * @throws InternalServerErrorException if there is an error saving the note.
   */
  async create(note: string): Promise<SecretNote> {
    if (!note) {
      throw new BadRequestException('Note content must be provided');
    }

    const encryptedNote = this.encrypt(note);
    const newNote = this.secretNoteRepository.create({ note: encryptedNote });

    try {
      return await this.secretNoteRepository.save(newNote);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create the note');
    }
  }

  /**
   * Retrieves all secret notes.
   * @returns An array of secret notes.
   * @throws InternalServerErrorException if there is an error retrieving the notes.
   */
  async findAll(): Promise<Partial<SecretNote>[]> {
    try {
      const notes = await this.secretNoteRepository.find();
      return notes.map((note) => ({ id: note.id, createdAt: note.createdAt }));
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve notes');
    }
  }

  /**
   * Retrieves a secret note by its ID.
   * @param id - The ID of the note.
   * @param decrypt - Whether to decrypt the note.
   * @returns The secret note.
   * @throws NotFoundException if the note with the specified ID is not found.
   * @throws InternalServerErrorException if there is an error retrieving the note.
   */
  async findOne(id: number, decrypt = true): Promise<SecretNote> {
    try {
      const note = await this.secretNoteRepository.findOneBy({ id });
      if (!note) {
        throw new NotFoundException(`Note with id ${id} not found`);
      }
      if (decrypt) {
        note.note = this.decrypt(note.note);
      }
      return note;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve the note');
    }
  }

  /**
   * Updates a secret note by its ID.
   * @param id - The ID of the note.
   * @param newNote - The new content of the note.
   * @returns The updated secret note.
   * @throws BadRequestException if the new note content is not provided.
   * @throws NotFoundException if the note with the specified ID is not found.
   * @throws InternalServerErrorException if there is an error updating the note.
   */
  async update(id: number, newNote: string): Promise<SecretNote> {
    if (!newNote) {
      throw new BadRequestException('Note content must be provided');
    }

    try {
      const encryptedNote = this.encrypt(newNote);
      const updateResult = await this.secretNoteRepository.update(id, {
        note: encryptedNote,
      });

      if (updateResult.affected === 0) {
        throw new NotFoundException(`Note with id ${id} not found`);
      }

      return this.findOne(id, false);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update the note');
    }
  }

  /**
   * Deletes a secret note by its ID.
   * @param id - The ID of the note.
   * @throws NotFoundException if the note with the specified ID is not found.
   * @throws InternalServerErrorException if there is an error deleting the note.
   */
  async remove(id: number): Promise<void> {
    try {
      const deleteResult = await this.secretNoteRepository.delete(id);
      if (deleteResult.affected === 0) {
        throw new NotFoundException(`Note with id ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete the note');
    }
  }
}
