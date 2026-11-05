import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { useCart } from '../../context/CartContext';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { Badge } from "../../components/ui/badge";
import { Link, useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Gadget', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Laptops', icon: '💻' },
  { name: 'Watches', icon: '⌚' },
  { name: 'Audio', icon: '🎧' },
  { name: 'Shoes', icon: '👟' },
  { name: 'Bags', icon: '👜' },
  { name: 'Glasses', icon: '🕶️' }
];
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const slides = [
    { title: 'Next-Gen Gadgets', subtitle: 'Experience the future today.', bg: 'bg-primary', image: '/slideImage/download__3_-removebg-preview.png' },
    { title: 'Summer Collection', subtitle: 'Fresh styles for the sunny days.', bg: 'bg-accent', image: '/slideImage/summerCollection-removebg-preview.png' },
    { title: 'Mega Sale', subtitle: 'Up to 50% off on all tech items.', bg: 'bg-primary', image: '/slideImage/megaSales-removebg-preview.png' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[400px] overflow-hidden rounded-3xl mt-6 mx-4 md:mx-8 shadow-xl" id="hero">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 flex items-center px-12 ${idx === current ? 'opacity-100' : 'opacity-0'} ${slide.bg}`}
        >
          <div className="max-w-2xl text-white space-y-4">
            <Badge variant="outline" className="text-white border-white">Trending Now</Badge>
            <h1 className="text-5xl font-extrabold leading-tight">{slide.title}</h1>
            <p className="text-xl text-white/80">{slide.subtitle}</p>
            <Button size="lg" variant="secondary" className="rounded-full mt-4">Shop Now</Button>
          </div>
          {slide.image && (
            <div className="hidden lg:block ml-auto w-1/3">
              <img className="w-full h-96 object-contain" src={slide.image} alt="Hero product" />
            </div>
          )}
        </div>
      ))}
      <button onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"><ChevronLeft /></button>
      <button onClick={() => setCurrent((current + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"><ChevronRight /></button>
    </section>
  );
};

const ProductSection = ({ title, items }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();


  return (
    <section className="py-12 container px-4 md:px-8">
      <div className="flex items-center justify-between mb-8 border-l-4 border-accent pl-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate(`/category/${title}`)}
        >
          See More
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(product => (
          <Card key={product.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
            <div className="relative h-64 overflow-hidden bg-secondary/30">
              <img src={`/${product.image}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3">
                <Button size="icon" variant="secondary" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </Button>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <span className="font-bold text-accent">${product.priceCents}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">Premium quality {product.category.toLowerCase()} for your daily needs.</p>
            </CardContent>
            <CardFooter className="pb-6">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="w-full rounded-xl gap-2 font-semibold transition-all hover:scale-[1.02]"
                variant="default"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
   const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/products.json")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error loading products:", err));
  }, []);
  const gadgets = products.filter(p => p.category === 'gadget');
  const fashion = products.filter(p => p.category === 'fashion');


  return (
    <div className="space-y-6">
      <HeroCarousel />

      <section className="container px-4 md:px-8 py-12" id="categories">
        <h2 className="text-2xl font-bold mb-8 text-center">Top Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-secondary cursor-pointer transition-all hover:-translate-y-1 shadow-sm border bg-white"
              onClick={() => navigate(`/category/${cat.name}`)}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      <ProductSection title="gadget" items={gadgets} />
      <ProductSection title="fashion" items={fashion} />

      <section className="container px-4 md:px-8 py-12">
        <div className="rounded-3xl bg-primary p-12 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden relative">
          <div className="space-y-6 z-10 max-w-xl">
            <h2 className="text-4xl font-bold leading-tight">Limited Time Offer: Free Shipping on all orders over $100</h2>
            <p className="text-white/70 text-lg">DeepStore handles the logistics so you can focus on enjoying your new lifestyle products.</p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">Claim Discount</Button>
          </div>
          <div className="mt-8 md:mt-0 opacity-20 md:opacity-100">
             <img className="w-80 h-80 object-contain rotate-12" src="/slideImage/English_Hd_Transparent__Sale_English__Sale_Clipart__Wordart__Golden_PNG_Image_For_Free_Download-removebg-preview.png" alt="abstract modern floating geometric shapes with glowing blue lights, tech aesthetic" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;