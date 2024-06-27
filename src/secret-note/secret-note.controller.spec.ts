import { Test, TestingModule } from '@nestjs/testing';
import { SecretNoteController } from './secret-note.controller';
import { SecretNoteService } from './secret-note.service';
import { SecretNote } from './secret-note.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SecretNoteController', () => {
  let controller: SecretNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretNoteController],
      providers: [
        {
          provide: SecretNoteService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SecretNoteController>(SecretNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new secret note', async () => {
      const note = 'This is a secret note';
      const result = { id: 1, note } as SecretNote;
      mockService.create.mockResolvedValue(result);

      expect(await controller.create(note)).toBe(result);
    });

    it('should throw BadRequestException if note content is not provided', async () => {
      await expect(controller.create('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of secret notes', async () => {
      const result = [{ id: 1, createdAt: new Date() }];
      mockService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a decrypted note', async () => {
      const result = { id: 1, note: 'This is a secret note' } as SecretNote;
      mockService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1, 'true')).toBe(result);
    });

    it('should return an encrypted note', async () => {
      const result = { id: 1, note: 'encrypted_note' } as SecretNote;
      mockService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1, 'false')).toBe(result);
    });

    it('should throw NotFoundException if note is not found', async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException(`Note with id 1 not found`),
      );

      await expect(controller.findOne(1, 'true')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      const note = 'Updated secret note';
      const result = { id: 1, note } as SecretNote;
      mockService.update.mockResolvedValue(result);

      expect(await controller.update(1, note)).toBe(result);
    });

    it('should throw BadRequestException if note content is not provided', async () => {
      await expect(controller.update(1, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if note is not found', async () => {
      mockService.update.mockRejectedValue(
        new NotFoundException(`Note with id 1 not found`),
      );

      await expect(controller.update(1, 'Updated secret note')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a note', async () => {
      mockService.remove.mockResolvedValue(undefined);

      expect(await controller.remove(1)).toBeUndefined();
    });

    it('should throw NotFoundException if note is not found', async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException(`Note with id 1 not found`),
      );

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
