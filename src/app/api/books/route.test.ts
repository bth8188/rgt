import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from './route';

describe('GET /api/books', () => {
  it('should return a list of books', async () => {
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(0);
      },
    });
  });

  it('should handle database errors gracefully', async () => {
    jest.spyOn(appHandler, 'GET').mockImplementationOnce(async () => {
      throw new Error('Database error');
    });

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' });
        expect(response.status).toBe(500);
      },
    });
  });
});

describe('POST /api/books', () => {
  it('should add a book successfully', async () => {
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            title: 'test-insert',
            author: 'George Orwell Test',
            description: 'Dystopian novel Test',
            price: 10.99,
            stock: 100,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.message).toBe('Book added successfully');
      },
    });
  });

  it('should handle invalid input gracefully', async () => {
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(500);
      },
    });
  });
});
