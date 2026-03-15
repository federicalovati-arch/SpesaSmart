'use server';

import { categorizeProduct } from '@/ai/flows/ai-product-categorization';

export async function getCategorySuggestion(productName: string) {
  try {
    const result = await categorizeProduct({ productName });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    return { success: false, error: 'Failed to get suggestion from AI.' };
  }
}
