'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BookCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '0',
    stock: '0'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요';
    if (!formData.author.trim()) newErrors.author = '저자를 입력해주세요';
    if (!formData.price) newErrors.price = '가격을 입력해주세요';
    if (isNaN(Number(formData.price))) newErrors.price = '숫자만 입력 가능합니다';
    if (!formData.stock) newErrors.stock = '재고 수량을 입력해주세요';
    if (isNaN(Number(formData.stock))) newErrors.stock = '숫자만 입력 가능합니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      });

      if (!response.ok) {
        const {error} = await response.json()
        throw new Error(error?? '등록 실패');
      }
      
      alert('책이 성공적으로 등록되었습니다!');
      router.push('/books');
    } catch (error) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>새 책 등록</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        {/* 제목 필드 */}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">제목 *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        {/* 저자 필드 */}
        <div className="mb-3">
          <label htmlFor="author" className="form-label">저자 *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={`form-control ${errors.author ? 'is-invalid' : ''}`}
          />
          {errors.author && <div className="invalid-feedback">{errors.author}</div>}
        </div>

        {/* 설명 필드 */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows={3}
          />
        </div>

        {/* 가격 필드 */}
        <div className="mb-3">
          <label htmlFor="price" className="form-label">가격(USD) *</label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
          />
          {errors.price && <div className="invalid-feedback">{errors.price}</div>}
        </div>

        {/* 재고 필드 */}
        <div className="mb-3">
          <label htmlFor="stock" className="form-label">재고 수량 *</label>
          <input
            type="text"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
          />
          {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/books')}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
