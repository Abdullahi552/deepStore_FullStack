import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ChevronLeft, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Badge } from "../../components/ui/badge";
import { useEffect, useState } from 'react';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
      fetch("/products.json")
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(err => console.error("Error loading products:", err));
    }, []);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="container px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/')}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12">
      <Button 
        variant="ghost" 
        className="mb-8 gap-2 hover:bg-secondary rounded-full"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="rounded-3xl overflow-hidden bg-secondary/30 aspect-square shadow-2xl">
          <img 
            src={`/${product.image}`} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-1 text-sm font-medium rounded-full">
              {product.category}
            </Badge>
            <h1 className="text-5xl font-extrabold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">(128 Reviews)</span>
            </div>
            <p className="text-4xl font-bold text-accent">${product.price}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Description</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description} This premium product combines innovative design with exceptional functionality. Perfect for those who demand quality and style in their daily life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold">Free Shipping</p>
                <p className="text-muted-foreground">Orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold">1 Year Warranty</p>
                <p className="text-muted-foreground">Original products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold">30-Day Returns</p>
                <p className="text-muted-foreground">Money back policy</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-grow h-16 rounded-2xl text-lg font-bold gap-3 shadow-xl hover:scale-[1.02] transition-all"
               onClick={() => addToCart({
                  id: product.id,
                  name: product.name,
                  priceCents: product.price,   
                  image: product.image,
                  category: product.category
                })}
            >
              <ShoppingCart className="h-6 w-6" /> Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="h-16 rounded-2xl text-lg font-bold px-8">
              Wishlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;