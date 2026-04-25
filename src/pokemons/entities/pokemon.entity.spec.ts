import { Pokemon } from './pokemon.entity';

describe('PokemonEntity', () => {
  it('should be defined', () => {
    expect(new Pokemon()).toBeDefined();
  });

  it('should assign and retrieve properties correctly', () => {
    const pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.name = 'bulbasaur';
    pokemon.type = 'grass';
    pokemon.hp = 100;
    pokemon.sprites = ['sprite1.png', 'sprite2.png'];

    expect(pokemon.id).toBe(1);
    expect(pokemon.name).toBe('bulbasaur');
    expect(pokemon.type).toBe('grass');
    expect(pokemon.hp).toBe(100);
    expect(pokemon.sprites).toEqual(['sprite1.png', 'sprite2.png']);
  });
});
