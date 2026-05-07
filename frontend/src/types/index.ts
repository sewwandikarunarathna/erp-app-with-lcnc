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
  categoryId?: string;
  reorderPoint?: number;
  currentStock?: number;
  customFields?: Record<string, any>;
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
