import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { useCart } from "../../context/CartContext";
import { Star, ShoppingCart, ChevronLeft } from 'lucide-react';
import { Button } from "../../components/ui/button";

const Category = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch("/products.json")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error loading products:", err));
  }, []);

  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const filteredProducts = products.filter(
    p => p.category.toLowerCase() === categoryName?.toLowerCase()
  );

  return (
    <div className="container px-4 md:px-8 py-8">
      <Button 
        variant="ghost" 
        className="mb-8 gap-2 hover:bg-secondary rounded-full"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="h-4 w-4" /> Back to Home
      </Button>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{categoryName} Collection</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Discover our curated selection of high-quality {categoryName?.toLowerCase()} products.
          </p>
        </div>
        <div className="text-sm font-medium bg-secondary px-4 py-2 rounded-full">
          {filteredProducts.length} Products Found
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <Card key={product.id} className="group border-none shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="relative h-72 overflow-hidden bg-secondary/30">
                <img src={`/${product.image}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4">
                  <Button size="icon" variant="secondary" className="rounded-full shadow-xl">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </Button>
                </div>
              </div>
              <CardContent className="pt-8 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl">{product.name}</h3>
                  <span className="font-bold text-accent text-lg">${(product.priceCents / 100).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter className="pb-8 pt-0">
                <Button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    addToCart(product); 
                  }} 
                  className="w-full h-12 rounded-xl gap-3 font-bold transition-all hover:scale-[1.02] shadow-lg" 
                  variant="default"
                >
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-secondary/20 rounded-3xl border-2 border-dashed">
          <h3 className="text-2xl font-bold text-muted-foreground">No products found in this category</h3>
          <Button className="mt-6 rounded-full" onClick={() => navigate('/')}>Explore Other Categories</Button>
        </div>
      )}
    </div>
  );
};

export default Category;
