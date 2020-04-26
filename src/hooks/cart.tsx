import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.setItem('products', JSON.stringify([]));
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem('products', JSON.stringify(products));
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      console.log({ product });
      const isNewProduct = !products.some(p => p.id === product.id);
      if (isNewProduct) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        const allProducts = products.map(p => {
          if (p.id === product.id) return { ...p, quantity: p.quantity + 1 };
          return p;
        });
        setProducts(allProducts);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const allProducts = products.map(p => {
        if (p.id === id) return { ...p, quantity: p.quantity + 1 };
        return p;
      });
      setProducts(allProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const allProducts = products
        .filter(p => {
          if (p.id === id) {
            if (p.quantity === 1) return false;
            return true;
          }
          return true;
          // if (p.id === id) return { ...p, quantity: p.quantity - 1 };
          // return p;
        })
        .map(p => {
          if (p.id === id) return { ...p, quantity: p.quantity - 1 };
          return p;
        });
      setProducts(allProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
