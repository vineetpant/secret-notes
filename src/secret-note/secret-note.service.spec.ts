import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SecretNote } from './secret-note.entity';
import { SecretNoteService } from './secret-note.service';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('SecretNoteService', () => {
  let service: SecretNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretNoteService,
        {
          provide: getRepositoryToken(SecretNote),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SecretNoteService>(SecretNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new secret note', async () => {
      const note = 'This is a secret note';
      const encryptedNote = CryptoJS.AES.encrypt(note, 'secret_key').toString();
      mockRepository.create.mockReturnValue({ note: encryptedNote });
      mockRepository.save.mockResolvedValue({ id: 1, note: encryptedNote });

      const result = await service.create(note);
      expect(result).toEqual({ id: 1, note: encryptedNote });
      expect(mockRepository.save).toHaveBeenCalledWith({ note: encryptedNote });
    });

    it('should throw BadRequestException if note content is not provided', async () => {
      await expect(service.create('')).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if saving the note fails', async () => {
      const note = 'This is a secret note';
      mockRepository.save.mockRejectedValue(new Error('Failed to save'));

      await expect(service.create(note)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of secret notes', async () => {
      const secretNotes = [{ id: 1, createdAt: new Date() }];
      mockRepository.find.mockResolvedValue(secretNotes);

      const result = await service.findAll();
      expect(result).toEqual(
        secretNotes.map((note) => ({ id: note.id, createdAt: note.createdAt })),
      );
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if retrieval fails', async () => {
      mockRepository.find.mockRejectedValue(new Error('Failed to find'));

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a decrypted note', async () => {
      const encryptedNote = CryptoJS.AES.encrypt(
        'This is a secret note',
        'secret_key',
      ).toString();
      mockRepository.findOneBy.mockResolvedValue({
        id: 1,
        note: encryptedNote,
      });

      const result = await service.findOne(1, true);
      expect(result.note).toBe('This is a secret note');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return an encrypted note', async () => {
      const encryptedNote = CryptoJS.AES.encrypt(
        'This is a secret note',
        'secret_key',
      ).toString();
      mockRepository.findOneBy.mockResolvedValue({
        id: 1,
        note: encryptedNote,
      });

      const result = await service.findOne(1, false);
      expect(result.note).toBe(encryptedNote);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if note is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1, true)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if retrieval fails', async () => {
      mockRepository.findOneBy.mockRejectedValue(new Error('Failed to find'));

      await expect(service.findOne(1, true)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      const note = 'Updated secret note';
      const encryptedNote = CryptoJS.AES.encrypt(note, 'secret_key').toString();
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue({
        id: 1,
        note: encryptedNote,
      });

      const result = await service.update(1, note);
      expect(result.note).toBe(encryptedNote);
    });

    it('should throw BadRequestException if note content is not provided', async () => {
      await expect(service.update(1, '')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if note is not found', async () => {
      const note = 'Updated secret note';
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(1, note)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const note = 'Updated secret note';
      mockRepository.update.mockRejectedValue(new Error('Failed to update'));

      await expect(service.update(1, note)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a note', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if note is not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Failed to delete'));

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
