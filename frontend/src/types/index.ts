import React from 'react';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  unitOfMeasure: string;
  active: boolean;
  categoryName?: string;
  currentStock?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
