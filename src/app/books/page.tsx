'use client';

import React, { useState, useEffect } from 'react';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { Book } from '@/types/book'

async function fetchBooks(page: number, pageSize: number, search?: string) {
  const url = `/api/books?page=${page}&pageSize=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch books');
  }

  return res.json();
}

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });
  const [search, setSearch] = useState('');

  const loadBooks = async (page: number) => {
    try {
      const data = await fetchBooks(page, meta.pageSize, search.trim() ? search : undefined);
      setBooks(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error(error);
      alert('Failed to load books');
    }
  };

  useEffect(() => {
    // 페이지가 처음 로드될 때 데이터 가져오기
    loadBooks(meta.currentPage);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBooks(1); // 검색 시 첫 페이지로 이동
  };

  const handlePageChange = (page: number) => {
    loadBooks(page);
  };

  return (
    <div className="container mt-5">
      <h1>
        Books List
        <Link href={`/books/new`} className="btn btn-success float-end">
          등록하기
        </Link>      
      </h1>

      {/* 검색창 */}
      <div className="row d-flex align-items-center mb-3">
        <div className="col-9 col-md-9 col-xs-12">
          <form onSubmit={handleSearchSubmit} className="d-flex">
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={handleSearchChange}
              className="form-control"
              style={{ height: '100%' }}
            />
          </form>
        </div>

        <button className="col-3 col-md-3 col-xs-12 btn btn-primary" style={{ height: '100%' }} onClick={handleSearchSubmit}>
          검색
        </button>
        {/* <div className=" text-end">
        </div> */}
      </div>


      {/* 책 리스트 */}
      <table className='table table-responsive'>
        <thead>
          <tr>
            <td>no.</td>
            <td>제목</td>
            <td>저자</td>
            <td>가격</td>
            <td>재고</td>
            <td>바로가기</td>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((book: Book, idx: number) => (
              <tr key={book.id}>
                <td>{(meta.currentPage-1)*10 + idx+1}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.price}$</td>
                <td>{book.stock - (book.sales?? 0)}</td>
                <td><Link href={`/books/${book.id}`}>바로가기 </Link></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className='text-center'>No books found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BooksPage;