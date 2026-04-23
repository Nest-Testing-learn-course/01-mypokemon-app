import 'reflect-metadata';
import { CreatePokemonDto } from './create-pokemon.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('CreatePokemonDto', () => {
  it('should validate with valid required fields', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate with all fields including optional ones', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Charizard';
    dto.type = 'Fire/Flying';
    dto.hp = 78;
    dto.sprites = ['sprite1.png', 'sprite2.png'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should not validate without name', async () => {
    const dto = new CreatePokemonDto();
    dto.type = 'Electric';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should not validate without type', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should not validate with empty type', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should not validate with negative hp', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.hp = -10;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
    expect(errors[0].constraints?.min).toBe('hp must not be less than 0');
  });

  it('should not validate with invalid sprites array', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.sprites = ['valid.png', 123] as unknown as string[];

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should convert plain object to dto instance', async () => {
    const input = {
      name: 'Bulbasaur',
      type: 'Grass/Poison',
      hp: 45,
      sprites: ['bulbasaur.png', 'bulbasaur_back.png'],
    };
    const dto = plainToInstance(CreatePokemonDto, input);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.name).toBe('Bulbasaur');
    expect(dto.type).toBe('Grass/Poison');
    expect(dto.hp).toBe(45);
    expect(dto.sprites).toEqual(['bulbasaur.png', 'bulbasaur_back.png']);
  });

  it('should convert plain object with only required fields', async () => {
    const input = {
      name: 'Squirtle',
      type: 'Water',
    };
    const dto = plainToInstance(CreatePokemonDto, input);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.name).toBe('Squirtle');
    expect(dto.type).toBe('Water');
    expect(dto.hp).toBeUndefined();
    expect(dto.sprites).toBeUndefined();
  });
});
