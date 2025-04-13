import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function getCostBreakdown(shoppingList: any[], ingredientsHave: any[], totalCost: number, budget: number) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Analyze this shopping list and provide a cost breakdown:
  Items to Buy:
  ${shoppingList.map(item => 
    `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
     Recipe: ${item.recipeName}
     Price: $${item.product?.price || 'N/A'}`
  ).join('\n')}

  Items Already Have:
  ${ingredientsHave.map(item => 
    `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
     Recipe: ${item.recipeName}`
  ).join('\n')}

  Total Cost: $${totalCost}
  Budget: $${budget}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function getShoppingStrategy(shoppingList: any[], location: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Based on this shopping list and location, provide a shopping strategy:
  Shopping List:
  ${shoppingList.map(item => 
    `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
     Store: ${item.product?.store || 'N/A'}`
  ).join('\n')}

  Location: ${location}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function getRecipeModifications(recipes: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Analyze these recipes and provide modified instructions:
  ${recipes.map(recipe => 
    `Recipe: ${recipe.name}
     Original Servings: ${recipe.servings}
     Desired Servings: ${recipe.desiredServings}
     Instructions: ${recipe.instructions}`
  ).join('\n\n')}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function getIngredientSubstitutions(shoppingList: any[], ingredientsHave: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Suggest ingredient substitutions and alternatives:
  Items to Buy:
  ${shoppingList.map(item => 
    `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
     Price: $${item.product?.price || 'N/A'}`
  ).join('\n')}

  Items Already Have:
  ${ingredientsHave.map(item => 
    `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)`
  ).join('\n')}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
} 