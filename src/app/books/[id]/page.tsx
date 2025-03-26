'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Book } from '@/types/book';
import { Sales } from '@/types/sales';

async function fetchBookDetails(id: string): Promise<Book & {salesData: Sales[]}> {
  const res = await fetch(`/api/books/${id}`, {
    method: 'GET',
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch book details');
  return res.json();
}

export default function BookDetailPage() {
  const { id: bookId } = useParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id, title, author, price, stock, sales, description, salesData, ...etc} = await fetchBookDetails(bookId as string);
        setBook({id, title, author, price, stock, description});
        setSales(salesData);
      } catch (error) {
        console.error(error);
        alert('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bookId]);

  // 삭제 함수
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('삭제 실패');
      
      alert('성공적으로 삭제되었습니다.');
      router.push('/books');
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (!book) return <div className="text-center my-5">Book not found</div>;

  return (
    <div className="container mt-5">
      <div className='d-flex justify-content-between'>

      {/* 뒤로 가기 버튼 */}
      <Link href="/books" className="btn btn-secondary mb-3">
        ← Back to List
      </Link>

      {/* 액션 버튼 그룹 */}
      <div className="d-flex gap-2 h-100">
        <Link 
          href={`/books/${bookId}/edit`}
          className="btn btn-primary"
        >
          수정하기
        </Link>
        <button
          onClick={handleDelete}
          className="btn btn-danger "
          disabled={isDeleting}
        >
          {isDeleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
      </div>

      <h1 className="mb-4">Book Details</h1>

      {/* 책 정보 그리드 */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title">{book.title}</h3>
              <p className="card-text">
                <strong>Author:</strong> {book.author}
              </p>
              <p className="card-text">
                <strong>Price:</strong> ${book.price}
              </p>
              <p className="card-text">
                <strong>Stock:</strong> {book.stock}
              </p>
              <p className="card-text">
                <strong>Description:</strong> {book.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 판매 이력 테이블 */}
      <h2 className="mt-5 mb-3">Sales History</h2>
      <table className="table table-responsive">
        <thead>
          <tr>
            <th>No.</th>
            <th>Date</th>
            <th>Quantity</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {sales.length > 0 ? (
            sales.map((sale, index) => (
              <tr key={sale.id}>
                <td>{index + 1}</td>
                <td>{sale.sale_date}</td>
                <td>{sale.quantity}</td>
                <td>${book.price * sale.quantity} $</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                판매 이력 없음
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
