import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PokemonsService', () => {
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pokemon (create)', async () => {
    const data = { name: 'bulbasaur', type: 'grass' };
    const newPokemon = await service.create(data);
    expect(newPokemon).toEqual(
      expect.objectContaining({
        name: data.name,
        type: data.type,
      }),
    );
  });

  it('should get error if pokemon already exists (create)', async () => {
    const data = { name: 'bulbasaur', type: 'grass' };
    await service.create(data);
    await expect(service.create(data)).rejects.toThrow(BadRequestException);
    await expect(service.create(data)).rejects.toThrow(
      `Pokemon with name ${data.name} already exists`,
    );
  });

  it('should return a pokemon if exists (findOne)', async () => {
    const id = 5;
    const pokemon = await service.findOne(id);
    expect(pokemon).toBeDefined();
    expect(typeof pokemon.id).toBe('number');
    expect(typeof pokemon.name).toBe('string');
    expect(typeof pokemon.type).toBe('string');
    expect(typeof pokemon.hp).toBe('number');
    expect(Array.isArray(pokemon.sprites)).toBe(true);
    expect(pokemon.sprites.length).toBeGreaterThan(0);
  });

  it('should return a 404 error if pokemon does not exist (findOne)', async () => {
    const id = 40_009;
    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(id)).rejects.toThrow(
      `Pokemon with id ${id} not found`,
    );
  });

  it('should find all pokemons in cache (findAll)', async () => {
    const pokemons = await service.findAll({ limit: 10, page: 1 });

    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(10);

    expect(service.paginatedPokemonsCache.has('10-1')).toBeTruthy();
    expect(service.paginatedPokemonsCache.get('10-1')).toEqual(pokemons);
  });

  it('should find all pokemons from cache (findAll)', async () => {
    const pokemons = await service.findAll({ limit: 5, page: 2 });

    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(5);

    await expect(service.findAll({ limit: 5, page: 2 })).resolves.toEqual(
      pokemons,
    );
    expect(service.paginatedPokemonsCache.has('5-2')).toBeTruthy();
    expect(service.paginatedPokemonsCache.get('5-2')).toEqual(pokemons);
  });

  it('should check properties of pokemon (findOne)', async () => {
    const id = 6;
    const pokemon = await service.findOne(id);
    expect(pokemon).toBeDefined();
    expect(pokemon).toHaveProperty('id');
    expect(pokemon).toHaveProperty('name');
    expect(pokemon).toEqual(
      expect.objectContaining({
        id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        hp: expect.any(Number),
      }),
    );
  });

  it('should update a pokemon (update)', async () => {
    const data = { name: 'charmander', type: 'fire' };
    const newPokemon = await service.create(data);
    const updatedPokemon = await service.update(newPokemon.id, {
      type: 'water',
    });
    expect(updatedPokemon).toEqual(
      expect.objectContaining({
        id: newPokemon.id,
        name: data.name,
        type: 'water',
      }),
    );
  });

  it('should get error if pokemon not exist (update)', async () => {
    const id = 40_009;
    const data = { name: 'charmander', type: 'fire' };
    await expect(service.update(id, data)).rejects.toThrow(BadRequestException);
    await expect(service.update(id, data)).rejects.toThrow(
      `Pokemon with id ${id} not found`,
    );
  });

  it('should delete a pokemon (delete)', async () => {
    const data = { name: 'charmander', type: 'fire' };
    const newPokemon = await service.create(data);
    const deletedPokemon = await service.remove(newPokemon.id);
    expect(deletedPokemon).toBe(`pokemon with id #${newPokemon.id} deleted`);
  });
});
