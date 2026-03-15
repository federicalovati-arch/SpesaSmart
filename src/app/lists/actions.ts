'use server';

import { parseNaturalLanguageShoppingList } from '@/ai/flows/natural-language-shopping-list-creation-flow';

export async function parseListWithAI(naturalLanguageList: string) {
  try {
    const result = await parseNaturalLanguageShoppingList({ naturalLanguageList });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error parsing list with AI:', error);
    return { success: false, error: 'Failed to parse list.' };
  }
}
