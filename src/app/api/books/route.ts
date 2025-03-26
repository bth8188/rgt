import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // URLSearchParams로 쿼리 파라미터 추출
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10); // 현재 페이지 번호 (기본값: 1)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // 페이지 크기 (기본값: 10)
    const search = searchParams.get('search') || ''; // 검색어

    // 유효성 검사
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter. Page must be a positive integer.' },
        { status: 400 }
      );
    }

    if (isNaN(pageSize) || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pageSize parameter. PageSize must be a positive integer.' },
        { status: 400 }
      );
    }

    // Offset 계산
    const offset = (page - 1) * pageSize;

    // 기본 쿼리와 매개변수 설정
    let queryStr = `
      SELECT
        id
        , title
        , author
        , price
        , stock
        , (SELECT SUM(quantity) AS cnt FROM Sales WHERE id = B.id) AS sales
      FROM Books B WHERE is_deleted = FALSE`;
    const params: any[] = [];

    const trimmedSearch = search.trim();
    if (trimmedSearch && trimmedSearch !== '') {
      queryStr += ' AND (title ILIKE $1 OR author ILIKE $2)';
      params.push(`%${search}%`, `%${search}%`);
    }
    const orderQuery = ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    queryStr += orderQuery;
    params.push(pageSize, offset);

    const books = await query(queryStr, params);

    // 전체 레코드 수 조회
    let countQueryStr = 'SELECT COUNT(*) AS total FROM Books WHERE is_deleted = FALSE';
    const countParams: any[] = [];

    if (trimmedSearch && trimmedSearch !== '') {
      countQueryStr += ' AND (title ILIKE $1 OR author ILIKE $2)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    queryStr += orderQuery;

    const totalCountResult: {total: number}[] = await query(countQueryStr, countParams);
    const totalCount = totalCountResult[0].total;

    // 응답 데이터 구성
    return NextResponse.json({
      data: books,
      meta: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
      },
    }, {
      headers: { 'Cache-Control': 'public, max-age=60' }, // 캐싱 헤더 추가
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, author, description, price, stock } = body;

    const books = await query('SELECT * FROM Books WHERE title = $1', [title]);
    if (books.length) throw {status: 400, message:  '같은 제목의 책이 이미 있습니다.'};

    await query(
      'INSERT INTO Books (title, author, description, price, stock) VALUES ($1, $2, $3, $4, $5)',
      [title, author, description, price, stock]
    );

    return NextResponse.json({ message: 'Book added successfully' }, { status: 201 });
  }  catch (error: any) {
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}