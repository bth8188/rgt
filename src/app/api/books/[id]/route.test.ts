import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from './route';

describe('GET /api/books/:id', () => {
  it('should return detail information of a book', async () => {
    await testApiHandler({
      appHandler,
      params: { id: '1' },
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET'});
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe(1);
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

describe('PUT /api/books/:id', () => {
  it('should add a book successfully', async () => {
    await testApiHandler({
      appHandler,
      params: { id: '1' },
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'PUT',
          body: JSON.stringify({
            title: 'test-insert',
            author: 'George Orwell Test',
            description: 'Dystopian novel Test',
            price: 10.99,
            stock: 100,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.message).toBe('Book updated successfully');
      },
    });
  });

  it('should handle invalid input gracefully', async () => {
    await testApiHandler({
      appHandler,
      params: { id: '1' },
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'PUT',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(400);
      },
    });
  });
});

describe('DELETE /api/books/:id', () => {
  it('should delete a book successfully', async () => {
    await testApiHandler({
      appHandler,
      params: { id: '1' },
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'DELETE',
          body: JSON.stringify({
            title: 'test-insert',
            author: 'George Orwell Test',
            description: 'Dystopian novel Test',
            price: 10.99,
            stock: 100,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.message).toBe('Book deleted successfully');
      },
    });
  });

  it('should handle invalid delete gracefully', async () => {
    await testApiHandler({
      appHandler,
      params: { id: '9999' },
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'DELETE',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(404);
      },
    });
  });
});
