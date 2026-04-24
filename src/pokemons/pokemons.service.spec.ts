import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { NotFoundException } from '@nestjs/common';

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

  it('should create a pokemon', () => {
    const data = { name: 'bulbasaur', type: 'grass' };
    const newPokemon = service.create(data);
    expect(newPokemon).toBe(
      `This action adds a new pokemon: ${JSON.stringify(data)}`,
    );
  });

  it('should return a pokemon if exists', async () => {
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

  it('should return a 404 error if pokemon does not exist', async () => {
    const id = 40_009;
    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(id)).rejects.toThrow(
      `Pokemon with id ${id} not found`,
    );
  });

  it('should find all pokemons in cache', async () => {
    const pokemons = await service.findAll({ limit: 10, page: 1 });

    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(10);

    expect(service.paginatedPokemonsCache.has('10-1')).toBeTruthy();
    expect(service.paginatedPokemonsCache.get('10-1')).toEqual(pokemons);
  });

  it('should check properties of pokemon', async () => {
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
});
