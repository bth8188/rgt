'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookFormProps, BookFormData } from '@/types/book';

export default function BookForm({
  onSubmit,
  isSubmitting = false,
  submitButtonText = '제출하기',
  cancelHref,
  initialData
}: BookFormProps) {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    description: '',
    price: '',
    stock: '',
    ...initialData // ✅ Optional Chaining으로 초기값 병합
  });
  const router = useRouter();
  
  // 또는 명시적 초기화
  useEffect(() => {
    setFormData({
      title: initialData?.title ?? '',
      author: initialData?.author ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price ?? '',
      stock: initialData?.stock ?? ''
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof BookFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim() ? '제목을 입력해주세요' : '',
      author: !formData.author.trim() ? '저자를 입력해주세요' : '',
      price: !formData.price ? '가격을 입력해주세요' : 
            isNaN(Number(formData.price)) ? '숫자만 입력 가능합니다' : '',
      stock: !formData.stock ? '재고 수량을 입력해주세요' : 
             isNaN(Number(formData.stock)) ? '숫자만 입력 가능합니다' : '',
      description: ''
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {/* 각 필드 UI (기존 코드와 동일) */}
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

      {/* 나머지 필드들도 동일하게 구현 */}

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              처리 중...
            </>
          ) : (
            submitButtonText
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.push(cancelHref)}
          disabled={isSubmitting}
        >
          취소
        </button>
      </div>
    </form>
  );
}