import { sum } from './sum.helper';

describe('sum.helper.ts', () => {
  it('should return the sum of two numbers', () => {
    // arrange
    const num1 = 12;
    const num2 = 24;

    // act
    const result = sum(num1, num2);

    // assert
    expect(result).toBe(36);
  });
});
