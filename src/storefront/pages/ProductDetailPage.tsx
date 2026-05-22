import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Share2, Truck, RotateCcw, Shield, Star, ShoppingBag, 
  Minus, Plus, Loader2, Check, ChevronRight
} from 'lucide-react';
import { subscribeToProducts } from '../../services/firebase';
import { useAuth } from '../../App';
import { addToCart } from '../../services/cartStore';
import { addToWishlist, isInWishlist, removeFromWishlist } from '../../services/cartStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { reviewsAPI } from '../../services/api';

interface Review {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Load product from Firebase
  useEffect(() => {
    if (!id) return;

    const unsubDoc = onSnapshot(doc(db, 'products', id), (snap) => {
      if (snap.exists()) {
        const p = { id: snap.id, ...snap.data() };
        setProduct(p);
        setSelectedColor((p as any).colors?.[0] || '');
        setLoading(false);
      }
    }, () => setLoading(false));

    const unsubAll = subscribeToProducts((all: any[]) => {
      if (!product) {
        const found = all.find(p => p.id === id);
        if (found) {
          setProduct(found);
          setSelectedColor(found.colors?.[0] || '');
        }
      }
      const current = all.find(p => p.id === id);
      if (current) {
        setRelatedProducts(all.filter(p => p.id !== id && p.category === current.category).slice(0, 4));
      } else {
        setRelatedProducts(all.filter(p => p.id !== id).slice(0, 4));
      }
      setLoading(false);
    });

    return () => { unsubDoc(); unsubAll(); };
  }, [id]);

  // Load reviews for this product
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const response = await reviewsAPI.getAll({ product: id });
        setReviews(response.data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [id]);

  // Wishlist check
  useEffect(() => {
    if (id) setWishlisted(isInWishlist(id));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-4">This product may have been removed or doesn't exist.</p>
          <Link to="/search" className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Browse Products</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const thumbnail = product.thumbnail;
  const allImages = images.length > 0 ? images : (thumbnail ? [{ url: thumbnail }] : []);
  const features = product.features || [];
  const specifications = product.specifications || [];
  const colors = product.colors || product.variants?.find((v: any) => v.name === 'Color')?.options || [];
  const sizes = product.sizes || product.variants?.find((v: any) => v.name === 'Size')?.options || [];
  const inStock = (product.stock || 0) > 0;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : (product.rating || 0);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      emoji: product.emoji,
      thumbnail: allImages[0]?.url || product.thumbnail,
      category: product.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      setWishlisted(false);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        emoji: product.emoji,
        thumbnail: allImages[0]?.url || product.thumbnail,
        category: product.category,
        inStock,
      });
      setWishlisted(true);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/sign-in');
      return;
    }
    if (!reviewContent.trim()) {
      alert('Please write a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        product: id,
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      });

      setReviewTitle('');
      setReviewContent('');
      setReviewRating(5);
      setShowReviewForm(false);

      // Refresh reviews
      const response = await reviewsAPI.getAll({ product: id });
      setReviews(response.data.reviews);

      alert('Review submitted! Thank you for your feedback.');
    } catch (error: any) {
      alert('Failed to submit review: ' + error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/search" className="hover:text-black">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-16">
        {/* Product Images */}
        <div className="space-y-3 md:space-y-4">
          <div className="bg-gray-50 rounded-2xl h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
            {allImages[activeImage]?.url ? (
              <img src={allImages[activeImage].url} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-[120px] md:text-[180px]">{product.emoji || '📦'}</span>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
              {allImages.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-lg flex items-center justify-center border-2 transition-colors shrink-0 overflow-hidden ${
                    activeImage === i ? 'border-purple-600' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              {product.brand && (
                <p className="text-xs md:text-sm text-purple-600 font-semibold uppercase tracking-wide">{product.brand}</p>
              )}
              <p className="text-[10px] text-gray-400">{product.category}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleWishlist}
                className={`w-9 h-9 md:w-10 md:h-10 border rounded-full flex items-center justify-center transition-colors ${
                  wishlisted ? 'bg-red-50 border-red-300' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}
                className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 md:w-5 md:h-5 ${i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
              <span className="font-semibold ml-1">{avgRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 text-sm">{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</span>
            <span className="text-gray-400">|</span>
            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
              {inStock ? `In Stock (${product.stock} left)` : 'Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl md:text-3xl font-bold">${product.price}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-lg md:text-xl text-gray-400 line-through">${product.compareAtPrice}</span>
                <span className="bg-red-100 text-red-600 text-xs md:text-sm font-semibold px-3 py-1 rounded-full">
                  Save ${(product.compareAtPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Features */}
          {features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-sm">Key Features:</h3>
              <ul className="space-y-1">
                {features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-sm">Color: <span className="text-gray-600 font-normal">{selectedColor}</span></h3>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-xs md:text-sm transition-colors ${
                      selectedColor === color ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-sm">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 md:w-14 md:h-11 rounded-lg border text-xs md:text-sm font-medium transition-colors ${
                      selectedSize === size ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-200 rounded-lg self-start">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 md:p-3 hover:bg-gray-50">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 md:w-12 text-center text-sm md:text-base font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 md:p-3 hover:bg-gray-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 flex-1">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  addedToCart ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {addedToCart ? '✓ Added!' : <><ShoppingBag className="w-4 h-4 md:w-5 md:h-5" /> Add to Cart</>}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 bg-purple-600 text-white py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
              <Truck className="w-4 h-4 md:w-5 md:h-5 text-purple-600 shrink-0" />
              <span className="text-[10px] md:text-xs">{product.shipping?.freeShipping ? 'Free Shipping' : 'Fast Shipping'}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-purple-600 shrink-0" />
              <span className="text-[10px] md:text-xs">{product.returnPolicy || '30-Day Returns'}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600 shrink-0" />
              <span className="text-[10px] md:text-xs">{product.warranty || 'Secure Payment'}</span>
            </div>
          </div>

          {/* Specifications */}
          {specifications.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-sm">Specifications</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                {specifications.map((spec: any, i: number) => (
                  <div key={i} className={`flex text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <span className="w-1/3 p-2 md:p-3 font-medium text-gray-700 border-r border-gray-100">{spec.name}</span>
                    <span className="flex-1 p-2 md:p-3 text-gray-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-8 md:pt-12 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (!user) { navigate('/sign-in'); return; }
              setShowReviewForm(!showReviewForm);
            }}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-6 animate-fade-in">
            <h3 className="font-bold mb-4">Your Review</h3>
            
            {/* Star Rating Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(i)}
                    className="p-0.5"
                  >
                    <Star className={`w-7 h-7 md:w-8 md:h-8 transition-colors cursor-pointer ${
                      i <= (hoverRating || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    }`} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500 self-center">{reviewRating}/5</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                placeholder="Summarize your experience"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review</label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                placeholder="Tell others about your experience with this product..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewContent.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => {
              const userName = review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous';
              return (
                <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt={userName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm">{userName}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        {review.createdAt && (
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {review.title && <h4 className="font-bold text-sm mb-1">{review.title}</h4>}
                      <p className="text-sm text-gray-700">{review.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-6 md:pt-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {relatedProducts.map(item => (
              <Link
                to={`/products/${item.id}`}
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {item.thumbnail || item.images?.[0]?.url ? (
                    <img src={item.thumbnail || item.images[0].url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-4xl md:text-5xl">{item.emoji || '📦'}</span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  {item.brand && <p className="text-[10px] text-purple-600 uppercase font-semibold">{item.brand}</p>}
                  <h3 className="font-medium text-xs md:text-sm text-gray-800 line-clamp-2">{item.name}</h3>
                  <p className="font-bold mt-1 text-sm md:text-base">${item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
