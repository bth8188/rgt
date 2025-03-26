export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  description?: string;
  sales?: number;
};

export type BookFormData = {
  title: string;
  author: string;
  description: string;
  price: string;
  stock: string;
};

export type BookFormProps = {
  initialData?: Partial<BookFormData>;
  onSubmit: (data: BookFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  cancelHref: string;
};
