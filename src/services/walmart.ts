import axios from 'axios';

const WALMART_API_KEY = process.env.VITE_WALMART_API_KEY;
const WALMART_PUBLISHER_ID = process.env.VITE_WALMART_PUBLISHER_ID;

interface WalmartStore {
  no: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  distance: number;
}

interface WalmartProduct {
  itemId: string;
  name: string;
  salePrice: number;
  categoryPath: string;
  brandName: string;
  thumbnailUrl: string;
  productUrl: string;
}

export const findNearbyStores = async (zipCode: string): Promise<WalmartStore[]> => {
  try {
    const response = await axios.get(
      'https://developer.api.walmart.com/api-proxy/service/affil/product/v2/stores',
      {
        params: { zip: zipCode },
        headers: {
          'WM_SEC.ACCESS_TOKEN': WALMART_API_KEY,
          'WM_QOS.CORRELATION_ID': 'test',
          'WM_SVC.NAME': 'Walmart Marketplace',
          'WM_PREVIEW': 'true'
        }
      }
    );
    return response.data.stores;
  } catch (error) {
    console.error('Error finding Walmart stores:', error);
    return [];
  }
};

export const searchProducts = async (query: string, storeId: string): Promise<WalmartProduct[]> => {
  try {
    const response = await axios.get(
      'https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search',
      {
        params: {
          publisherId: WALMART_PUBLISHER_ID,
          query,
          numItems: 25,
          responseGroup: 'full'
        },
        headers: {
          'WM_SEC.ACCESS_TOKEN': WALMART_API_KEY,
          'WM_QOS.CORRELATION_ID': 'test',
          'WM_SVC.NAME': 'Walmart Marketplace',
          'WM_PREVIEW': 'true'
        }
      }
    );
    return response.data.items;
  } catch (error) {
    console.error('Error searching Walmart products:', error);
    return [];
  }
};

export const getProductPrices = async (ingredients: string[], zipCode: string) => {
  const stores = await findNearbyStores(zipCode);
  if (stores.length === 0) return {};

  const productPrices: { [key: string]: WalmartProduct[] } = {};
  
  for (const ingredient of ingredients) {
    const products = await searchProducts(ingredient, stores[0].no);
    productPrices[ingredient] = products;
  }

  return {
    store: stores[0],
    products: productPrices
  };
}; 