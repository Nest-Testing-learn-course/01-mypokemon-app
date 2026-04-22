import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  IsArray,
} from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hp?: number;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  sprites?: string[];
}
