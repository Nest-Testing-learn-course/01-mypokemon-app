import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';

describe('Pokemons (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  it('/pokemons (POST) with no body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: [
        'name should not be empty',
        'name must be a string',
        'type should not be empty',
        'type must be a string',
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/pokemons (POST) - with no body 2', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');

    const mostHaveErrorMessage = [
      'type should not be empty',
      'name must be a string',
      'type must be a string',
      'name should not be empty',
    ];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const messageArray: string[] = response.body.message ?? [];

    expect(mostHaveErrorMessage.length).toBe(messageArray.length);
    expect(messageArray).toEqual(expect.arrayContaining(mostHaveErrorMessage));
  });

  it('/pokemons (POST) - with valid body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons').send({
      name: 'Pikachu',
      type: 'Electric',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      name: 'Pikachu',
      type: 'Electric',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(Number),
      hp: 100,
      sprites: [],
    });
  });

  it('/pokemons (GET) should return paginated list of pokemons', async () => {
    const response = await request(app.getHttpServer())
      .get('/pokemons')
      .query({ page: 1, limit: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect((response.body as Pokemon[]).length).toBe(5);
    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('type');
      expect(pokemon).toHaveProperty('hp');
      expect(pokemon).toHaveProperty('sprites');
    });
  });

  it('/pokemons/:id (GET) should return a pokemon by id', async () => {
    const response = await request(app.getHttpServer()).get('/pokemons/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('hp');
    expect(response.body).toHaveProperty('sprites');
  });

  it('/pokemons/:id (GET) should return 404 if pokemon not found', async () => {
    const id = 40000;
    const response = await request(app.getHttpServer()).get(`/pokemons/${id}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('statusCode');
  });

  it('/pokemons/:id (PATCH) should update a pokemon', async () => {
    const id = 1;
    const data = {
      name: 'Pikachu Updated',
      type: 'Electric',
    };
    // First, fetch the pokemon to add it to cache
    const bulbasaur = (
      await request(app.getHttpServer()).get(`/pokemons/${id}`)
    ).body as Pokemon;

    const updatedPokemon = (
      await request(app.getHttpServer())
        .patch(`/pokemons/${id}`)
        .send(data)
        .expect(200)
    ).body as Pokemon;

    // expect(updatedPokemon).toEqual(expect.objectContaining(data));
    expect(updatedPokemon).toEqual({ ...bulbasaur, ...data });
  });

  it('/pokemons/:id (PATCH) should return 400 if pokemon not found', async () => {
    const id = 40000;
    const response = await request(app.getHttpServer()).patch(
      `/pokemons/${id}`,
    );

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('statusCode');
  });

  it('/pokemons/:id (DELETE) should delete a pokemon', async () => {
    const id = 1;
    const response = await request(app.getHttpServer()).delete(
      `/pokemons/${id}`,
    );

    expect(response.text).toBe(`pokemon with id #${id} deleted`);
    expect(response.status).toBe(200);
  });

  it('/pokemons/:id (DELETE) should return 404 if pokemon not found', async () => {
    const id = 40000;
    const response = await request(app.getHttpServer()).delete(
      `/pokemons/${id}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: `Pokemon with id ${id} not found`,
      error: 'Not Found',
      statusCode: 404,
    });
  });
});
