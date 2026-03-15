'use server';
/**
 * @fileOverview A Genkit flow that parses a natural language shopping list into structured items.
 *
 * - parseNaturalLanguageShoppingList - A function that handles the parsing process.
 * - ParseNaturalLanguageShoppingListInput - The input type for the parseNaturalLanguageShoppingList function.
 * - ParseNaturalLanguageShoppingListOutput - The return type for the parseNaturalLanguageShoppingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseNaturalLanguageShoppingListInputSchema = z.object({
  naturalLanguageList: z
    .string()
    .describe(
      'A shopping list provided in natural language, e.g., "milk, bread, 2 apples, some cheese".'
    ),
});
export type ParseNaturalLanguageShoppingListInput = z.infer<
  typeof ParseNaturalLanguageShoppingListInputSchema
>;

const ParseNaturalLanguageShoppingListOutputSchema = z.object({
  items: z
    .array(
      z.object({
        productName: z
          .string()
          .describe('The name of the product, e.g., "milk", "apples".'),
        quantity: z
          .number()
          .int()
          .positive()
          .default(1)
          .describe('The quantity of the product, defaults to 1 if not specified.'),
      })
    )
    .describe('An array of parsed shopping list items with their product names and quantities.'),
});
export type ParseNaturalLanguageShoppingListOutput = z.infer<
  typeof ParseNaturalLanguageShoppingListOutputSchema
>;

export async function parseNaturalLanguageShoppingList(
  input: ParseNaturalLanguageShoppingListInput
): Promise<ParseNaturalLanguageShoppingListOutput> {
  return parseNaturalLanguageShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseNaturalLanguageShoppingListPrompt',
  input: {schema: ParseNaturalLanguageShoppingListInputSchema},
  output: {schema: ParseNaturalLanguageShoppingListOutputSchema},
  prompt: `You are an AI assistant specialized in parsing shopping lists. Your task is to extract product names and their quantities from natural language input and format them into a structured JSON array.

If a quantity is not explicitly mentioned for an item, assume the quantity is 1.

Natural Language Shopping List: {{{naturalLanguageList}}}

Expected JSON Output:`,
});

const parseNaturalLanguageShoppingListFlow = ai.defineFlow(
  {
    name: 'parseNaturalLanguageShoppingListFlow',
    inputSchema: ParseNaturalLanguageShoppingListInputSchema,
    outputSchema: ParseNaturalLanguageShoppingListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
