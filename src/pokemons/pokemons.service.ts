import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PokeApiResponse, PokeapiPokemonResponse } from './interfaces';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {
  paginatedPokemonsCache = new Map<string, Pokemon[]>();
  pokemonsCache = new Map<number, Pokemon>();

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemon: Pokemon = {
      ...createPokemonDto,
      id: new Date().getTime(),
      hp: createPokemonDto.hp ?? 100,
      sprites: createPokemonDto.sprites ?? [],
    };

    this.pokemonsCache.forEach((storedPokemon) => {
      if (pokemon.name === storedPokemon.name) {
        throw new BadRequestException(
          `Pokemon with name ${pokemon.name} already exists`,
        );
      }
    });

    this.pokemonsCache.set(pokemon.id, pokemon);

    return Promise.resolve(pokemon);
  }

  async findAll(paginationDto: PaginationDto): Promise<Pokemon[]> {
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const cacheKey = `${limit}-${page}`;
    if (this.paginatedPokemonsCache.has(cacheKey)) {
      return this.paginatedPokemonsCache.get(cacheKey)!;
    }

    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

    const response = await fetch(url);
    const data = (await response.json()) as PokeApiResponse;
    const pokemonResponses = data.results.map((result) => {
      const url = result.url;
      const id = parseInt(url.split('/').at(-2)!);
      return this.getPokemonInformation(id);
    });
    const pokemons = await Promise.all(pokemonResponses);
    this.paginatedPokemonsCache.set(cacheKey, pokemons);
    return Promise.resolve(pokemons);
  }

  async findOne(id: number) {
    if (this.pokemonsCache.has(id)) {
      return this.pokemonsCache.get(id)!;
    }

    const pokemon = await this.getPokemonInformation(id);

    this.pokemonsCache.set(id, pokemon);
    return Promise.resolve(pokemon);
  }

  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = this.pokemonsCache.get(id);
    if (!pokemon) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }

    const updatedPokemon = {
      ...pokemon,
      ...updatePokemonDto,
    };

    this.pokemonsCache.set(id, updatedPokemon);

    return Promise.resolve(updatedPokemon);
  }

  async remove(id: number) {
    await this.findOne(id);

    this.pokemonsCache.delete(id);

    // return Promise.resolve({ message: `pokemon with id #${id} deleted` });
    return Promise.resolve(`pokemon with id #${id} deleted`);
  }

  private async getPokemonInformation(id: number): Promise<Pokemon> {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

    if (response.status === 404) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }

    const data = (await response.json()) as PokeapiPokemonResponse;
    return {
      id,
      name: data.name,
      type: data.types.map((type) => type.type.name).join(', '),
      hp: data.stats[0].base_stat,
      sprites: [data.sprites.front_shiny, data.sprites.back_shiny],
    };
  }
}
