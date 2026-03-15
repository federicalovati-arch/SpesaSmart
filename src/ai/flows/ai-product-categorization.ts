'use server';
/**
 * @fileOverview An AI agent for categorizing and standardizing product names.
 *
 * - categorizeProduct - A function that handles the AI product categorization and standardization process.
 * - AIProductCategorizationInput - The input type for the categorizeProduct function.
 * - AIProductCategorizationOutput - The return type for the categorizeProduct function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIProductCategorizationInputSchema = z.object({
  productName: z
    .string()
    .describe('The name of the product to categorize and standardize.'),
});
export type AIProductCategorizationInput = z.infer<
  typeof AIProductCategorizationInputSchema
>;

const AIProductCategorizationOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe(
      'A suggested category for the product (e.g., "Dairy & Cheese", "Produce", "Bakery", "Meat", "Beverages", "Household", "Snacks", "Frozen Foods", "Pantry", "Personal Care", "Pet Supplies", "Baby Products", "Electronics", "Apparel", "Books", "Sporting Goods", "Toys", "Office Supplies", "Automotive", "Garden & Outdoor").'
    ),
  standardizedProductName: z
    .string()
    .describe('A standardized, consistent name for the product.'),
});
export type AIProductCategorizationOutput = z.infer<
  typeof AIProductCategorizationOutputSchema
>;

export async function categorizeProduct(
  input: AIProductCategorizationInput
): Promise<AIProductCategorizationOutput> {
  return aiProductCategorizationFlow(input);
}

const aiProductCategorizationPrompt = ai.definePrompt({
  name: 'aiProductCategorizationPrompt',
  input: {schema: AIProductCategorizationInputSchema},
  output: {schema: AIProductCategorizationOutputSchema},
  prompt: `You are an expert in supermarket product categorization and naming standardization.
Your goal is to help organize a product catalog by suggesting an appropriate category and a standardized name for a given product.

Here are some example categories to consider, but you are not limited to these if a more fitting one comes to mind: "Dairy & Cheese", "Produce", "Bakery", "Meat", "Beverages", "Household", "Snacks", "Frozen Foods", "Pantry", "Personal Care", "Pet Supplies", "Baby Products", "Electronics", "Apparel", "Books", "Sporting Goods", "Toys", "Office Supplies", "Automotive", "Garden & Outdoor".

When standardizing the name, aim for consistency, clarity, and conciseness, avoiding brand-specific language unless critical for identification.

Product Name: {{{productName}}}`,
});

const aiProductCategorizationFlow = ai.defineFlow(
  {
    name: 'aiProductCategorizationFlow',
    inputSchema: AIProductCategorizationInputSchema,
    outputSchema: AIProductCategorizationOutputSchema,
  },
  async (input) => {
    const {output} = await aiProductCategorizationPrompt(input);
    return output!;
  }
);
