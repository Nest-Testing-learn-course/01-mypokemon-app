import { TestingModule, Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokemonsModule } from './pokemons/pokemons.module';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let appController: AppController;
  let appService: AppService;
  let pokemonModule: PokemonsModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    appService = moduleRef.get<AppService>(AppService);
    pokemonModule = moduleRef.get<PokemonsModule>(PokemonsModule);
  });

  it('should be defined with custom proper elements', () => {
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
    expect(pokemonModule).toBeDefined();
  });
});
