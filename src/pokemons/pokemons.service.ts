import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PokeApiResponse, PokeapiPokemonResponse } from './interfaces';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {
  paginatedPokemonsCache = new Map<string, Pokemon[]>();

  create(createPokemonDto: CreatePokemonDto) {
    return Promise.resolve(
      `This action adds a new pokemon: ${createPokemonDto.name}`,
    );
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
    return pokemons;
  }

  async findOne(id: number) {
    const pokemon = await this.getPokemonInformation(id);
    return pokemon;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return Promise.resolve(
      `This action updates a #${id} pokemon: ${updatePokemonDto.name}`,
    );
  }

  remove(id: number) {
    return Promise.resolve(`This action removes a #${id} pokemon`);
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
