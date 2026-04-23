import 'reflect-metadata';
import { PaginationDto } from './pagination.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('PaginationDto', () => {
  it('should validate with default values', async () => {
    const dto = new PaginationDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate with valid values', async () => {
    const dto = new PaginationDto();
    dto.page = 2;
    dto.limit = 20;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should not validate with invalid page', async () => {
    const dto = new PaginationDto();
    dto.page = -1;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
    expect(errors[0].constraints?.min).toBe('page must not be less than 1');
  });

  it('should not validate with invalid limit', async () => {
    const dto = new PaginationDto();
    dto.limit = -1;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
    expect(errors[0].constraints?.min).toBe('limit must not be less than 1');
  });

  it('should convert string values to numbers', async () => {
    const input = { page: '2', limit: '20' };
    const dto = plainToInstance(PaginationDto, input);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });
});
