import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { Pokemon } from './entities/pokemon.entity';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

const mockPokemons: Pokemon[] = [
  {
    id: 1,
    name: 'bulbasaur',
    type: 'grass, poison',
    hp: 45,
    sprites: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/1.png',
    ],
  },
  {
    id: 2,
    name: 'ivysaur',
    type: 'grass, poison',
    hp: 60,
    sprites: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/2.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/2.png',
    ],
  },
];

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonsController],
      providers: [PokemonsService],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have call the service with correct parameters', async () => {
    const dto: PaginationDto = { page: 1, limit: 10 };

    jest.spyOn(service, 'findAll');

    await controller.findAll(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findAll).toHaveBeenCalledWith(dto);
  });

  it('should have called the service and check the response', async () => {
    const dto: PaginationDto = { page: 1, limit: 10 };

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(async () => Promise.resolve(mockPokemons));

    const pokemons = await controller.findAll(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findAll).toHaveBeenCalledWith(dto);
    expect(pokemons).toBe(mockPokemons);
  });

  it('should have call the service with correct id (findOne)', async () => {
    const id = '1';

    jest
      .spyOn(service, 'findOne')
      .mockImplementation(async () => Promise.resolve(mockPokemons[0]));

    const pokemon = await controller.findOne(id);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findOne).toHaveBeenCalledWith(+id);
    expect(pokemon).toEqual(mockPokemons[0]);
  });

  it('should have call the service with correct id and data (update)', async () => {
    const id = '1';
    const dto: UpdatePokemonDto = { name: 'bulbasaur', type: 'grass' };

    jest
      .spyOn(service, 'update')
      .mockImplementation(async () => Promise.resolve('updated'));

    const result = await controller.update(id, dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.update).toHaveBeenCalledWith(+id, dto);
    expect(result).toBe('updated');
  });

  it('should have call the service with correct id (delete)', async () => {
    const id = '1';

    jest
      .spyOn(service, 'remove')
      .mockImplementation(async () => Promise.resolve('deleted'));

    const result = await controller.remove(id);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.remove).toHaveBeenCalledWith(+id);
    expect(result).toBe('deleted');
  });
});
