import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Shield, CheckCircle } from 'lucide-react';
import { 
  CreditCardIcon, 
  PayPalIcon, 
  MTNMoneyIcon, 
  AirtelMoneyIcon,
  VisaIcon,
  MastercardIcon,
  AmexIcon,
  DiscoverIcon,
  ApplePayIcon,
  GooglePayIcon
} from '../../components/BrandIcons';
import { createOrder } from '../../services/firebase';
import { processPayment, type PaymentMethod } from '../../services/payments';
import { useAuth } from '../../App';

export default function CheckoutPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const returnStatus = searchParams.get('status');

  const [step, setStep] = useState(returnStatus === 'success' ? 3 : 1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(searchParams.get('orderId'));
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('card');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(returnStatus === 'success' ? 'Payment completed successfully!' : '');

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const orderItems = [
    { name: 'Nike Air Jordan 1 Retro', price: 159.99, quantity: 1, emoji: '👟' },
    { name: 'Classic Black Hoodie', price: 59.99, quantity: 2, emoji: '🧥' },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      // 1. Create order in Firebase
      const newOrderId = await createOrder({
        userId: user?.email,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          phone: formData.phone,
        },
        items: orderItems,
        subtotal,
        shipping,
        total,
        paymentMethod: selectedPayment,
        status: 'pending',
      });

      setOrderId(newOrderId);

      // 2. Process payment through selected gateway
      const result = await processPayment({
        method: selectedPayment,
        amount: total,
        currency: 'USD',
        orderId: newOrderId,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerPhone: formData.phone,
        items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        shippingAddress: formData.address ? {
          line1: formData.address,
          city: formData.city,
          state: formData.state,
          country: 'NG',
          postal_code: formData.zip,
        } : undefined,
      });

      if (result.status === 'completed') {
        setPaymentSuccess(result.message);
        setStep(3);
      } else if (result.status === 'pending') {
        setPaymentSuccess(result.message);
        setStep(3);
      } else if (result.status === 'cancelled') {
        setPaymentError('Payment was cancelled. Please try again.');
      } else {
        setPaymentError(result.message || 'Payment failed. Please try another method.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/cart" className="hover:text-black">Cart</Link>
        <span>/</span>
        <span className="text-black font-medium">Checkout</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Main Form */}
        <div className="flex-1">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>1</div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200">
              <div className={`h-full bg-purple-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>2</div>
              <span className="font-medium">Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200">
              <div className={`h-full bg-purple-600 transition-all ${step >= 3 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>3</div>
              <span className="font-medium">Review</span>
            </div>
          </div>

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Choose Payment Method</h2>

              <div className="space-y-4">
                {/* Payment Method Selector with Real Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-4">
                  {([
                    { key: 'card', label: 'Card', icon: <CreditCardIcon size={28} /> },
                    { key: 'paypal', label: 'PayPal', icon: <PayPalIcon size={28} /> },
                    { key: 'apple_pay', label: 'Apple Pay', icon: <ApplePayIcon size={28} /> },
                    { key: 'google_pay', label: 'Google Pay', icon: <GooglePayIcon size={28} /> },
                    { key: 'mtn_money', label: 'MTN Money', icon: <MTNMoneyIcon size={28} /> },
                    { key: 'airtel_money', label: 'Airtel Money', icon: <AirtelMoneyIcon size={28} /> },
                    { key: 'bank_transfer', label: 'Bank Transfer', icon: <span className="text-2xl">🏦</span> },
                    { key: 'cash_on_delivery', label: 'Cash on Delivery', icon: <span className="text-2xl">💵</span> },
                  ] as const).map(pm => (
                    <button
                      key={pm.key}
                      type="button"
                      onClick={() => setSelectedPayment(pm.key)}
                      className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                        selectedPayment === pm.key
                          ? 'border-2 border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-200'
                          : 'border border-gray-200 hover:border-purple-300 hover:shadow-sm'
                      }`}
                    >
                      {pm.icon}
                      <span className={`text-[10px] md:text-xs font-medium ${
                        selectedPayment === pm.key ? 'text-purple-700' : 'text-gray-600'
                      }`}>{pm.label}</span>
                    </button>
                  ))}
                </div>

                {/* Accepted Cards */}
                {selectedPayment === 'card' && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="text-xs text-gray-600 mb-2">We accept all major cards via Stripe:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <VisaIcon size={28} />
                      <MastercardIcon size={28} />
                      <AmexIcon size={28} />
                      <DiscoverIcon size={28} />
                    </div>
                  </div>
                )}

                {/* Payment-specific information */}
                {selectedPayment === 'paypal' && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-sm text-blue-800">
                    <p className="font-semibold mb-1">PayPal Checkout</p>
                    <p className="text-xs">You'll be redirected to PayPal to complete your payment securely.</p>
                  </div>
                )}

                {(selectedPayment === 'apple_pay' || selectedPayment === 'google_pay') && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm">
                    <p className="font-semibold mb-1">{selectedPayment === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}</p>
                    <p className="text-xs text-gray-600">
                      {selectedPayment === 'apple_pay'
                        ? 'Use Face ID, Touch ID, or your passcode to pay instantly.'
                        : 'Use your saved Google Pay cards for a fast checkout.'}
                    </p>
                  </div>
                )}

                {(selectedPayment === 'mtn_money' || selectedPayment === 'airtel_money') && (
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-sm text-yellow-900">
                    <p className="font-semibold mb-1">Mobile Money Payment</p>
                    <p className="text-xs">A payment dialog will open. Enter your mobile money number to authorize the payment.</p>
                  </div>
                )}

                {selectedPayment === 'bank_transfer' && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-sm text-green-800 space-y-1">
                    <p className="font-semibold">Bank Transfer Details</p>
                    <p className="text-xs"><strong>Bank:</strong> GTBank</p>
                    <p className="text-xs"><strong>Account:</strong> 0123456789</p>
                    <p className="text-xs"><strong>Name:</strong> Ahmad Costimetics Ltd</p>
                    <p className="text-xs mt-2 text-green-600">After transfer, upload your receipt for verification.</p>
                  </div>
                )}

                {selectedPayment === 'cash_on_delivery' && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-sm text-orange-800">
                    <p className="font-semibold mb-1">Cash on Delivery</p>
                    <p className="text-xs">Pay when you receive your order. Available in select areas only.</p>
                  </div>
                )}

                {paymentError && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-sm text-red-700">
                    ⚠️ {paymentError}
                  </div>
                )}

                {paymentSuccess && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-sm text-green-700">
                    ✓ {paymentSuccess}
                  </div>
                )}
              </div>

              <div className="flex gap-3 md:gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedPayment}
                  className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Order Confirmed!</h2>
                <p className="text-gray-500">Thank you for your purchase</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium">{orderId || '#ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span>{formData.email}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/"
                className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {orderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-2xl">
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
              <Shield className="w-5 h-5" />
              <span className="text-xs">Secure SSL Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
