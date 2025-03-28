import { query } from '@/lib/db';
import { Book } from '@/types/book';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Next.js 14+ 공식 타입
) {
  try {
    const { id } = await params;
    const book = await getBookById(id);
    const salesData = await query('SELECT * FROM Sales WHERE book_id = $1', [id]);
    
    return NextResponse.json({
      ...book,
      salesData
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await getBookById(id);
    const body = await req.json();
    const { title, author, description, price, stock } = body;

    if (!title || !author || !description || !price || !stock) {
      return NextResponse.json({ error: 'Invalid Data' }, { status: 400 });
    }

    await query(
      'UPDATE Books SET title=$1, author=$2, description=$3, price=$4, stock=$5, updated_at=NOW() WHERE id=$6 AND is_deleted=FALSE',
      [title, author, description, price, stock, id]
    );

    return NextResponse.json({ message: 'Book updated successfully' });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await getBookById(id);
    await query(
      'UPDATE Books SET is_deleted=TRUE, updated_at=NOW() WHERE id=$1',
      [id]
    );

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}

async function getBookById(id: string): Promise<Book> {
  const books: Book[] = await query('SELECT * FROM Books WHERE id = $1', [id]);
  if (!books.length) throw {status: 404, message:  'Book not found'};
  return books[0];
}