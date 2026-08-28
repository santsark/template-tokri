'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  regionLanguage: string;
  track: 'A' | 'B';
  price: number;
  images: string[];
  tags: string[];
};

type CartItem = {
  productId: string;
  quantity: number;
  inputDetails: string;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

// TEMPORARY — flip to false once Razorpay live API keys are verified.
const MANUAL_PAYMENT_MODE = true;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<{ id: string; name: string }[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pendingInputDetails, setPendingInputDetails] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [customOrderOpen, setCustomOrderOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategoryList).catch(() => setCategoryList([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('q', search);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [category, search]);

  useEffect(() => {
    if (products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const productSlug = params.get('product');
    if (productSlug) {
      const match = products.find((p) => (p as any).slug === productSlug);
      if (match) { setActiveProduct(match); setActiveImageIndex(0); }
    }
  }, [products]);

  function addToCart(product: Product, inputDetails: string) {
    setCart((prev) => [...prev, { productId: product.id, quantity: 1, inputDetails }]);
    setActiveProduct(null);
    setPendingInputDetails('');
    setCartOpen(true);
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function cartTotal() {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  async function handlePayment() {
    if (!customerInfo.name || !customerInfo.phone || cart.length === 0) return;
    setPlacingOrder(true);

    if (MANUAL_PAYMENT_MODE) {
      try {
        await fetch('/api/manual-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerEmail: customerInfo.email,
            items: cart
          })
        });
        setCart([]);
        setCheckoutOpen(false);
        setOrderSuccessOpen(true);
      } catch (err) {
        alert('Something went wrong placing your order. Please try again.');
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          items: cart
        })
      });
      const data = await res.json();

      const rzp = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount * 100,
        currency: 'INR',
        name: 'Template Tokri',
        description: 'Order payment',
        order_id: data.razorpayOrderId,
        prefill: {
          name: customerInfo.name,
          contact: customerInfo.phone,
          email: customerInfo.email
        },
        theme: { color: '#B97A3E' },
        handler: function () {
          // Actual confirmation happens server-side via the Razorpay webhook,
          // not this client callback — this just gives the user feedback.
          setCart([]);
          setCheckoutOpen(false);
          setOrderSuccessOpen(true);
        }
      });
      rzp.open();
    } catch (err) {
      alert('Something went wrong placing your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }

  const categories = ['All', ...categoryList.map((c) => c.name)];

  return (
    <div>
      <header style={{ position: 'sticky', top: 0, background: 'rgba(247,241,227,0.95)', borderBottom: '1px solid var(--line)', zIndex: 50 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, padding: '12px 24px' }}>
          <img src="/logo.png" alt="Template Tokri" style={{ height: 44 }} />
            <nav style={{ display: 'flex', gap: 16, fontSize: 14, fontWeight: 600 }}>
              <a href="#catalog" style={{ color: 'var(--navy)', textDecoration: 'none' }}>Shop</a>
                            <button onClick={() => setCustomOrderOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--navy)', font: 'inherit', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Custom Orders</button>
                            <a href="#about" style={{ color: 'var(--navy)', textDecoration: 'none' }}>About</a>
                            <a href="#faq" style={{ color: 'var(--navy)', textDecoration: 'none' }}>FAQ</a>
            </nav>
          <input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 380, padding: '9px 14px', borderRadius: 999, border: '1.5px solid var(--line)' }}
          />
          <button
            onClick={() => setCartOpen(true)}
            style={{ marginLeft: 'auto', background: 'var(--basket-brown)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}
          >
            🧺 Cart ({cart.length})
          </button>
        </div>
      </header>

      <div style={{
  background: 'radial-gradient(ellipse at top left, var(--sky-2), var(--sky-1) 45%, var(--cream) 85%)',
  padding: '64px 24px 56px',
  textAlign: 'center'
}}>
  <h1 className="script" style={{ fontSize: 'clamp(40px, 7vw, 68px)', color: 'var(--navy)', margin: '0 0 10px', lineHeight: 1.05 }}>
    Your basket of designs
  </h1>
  <p style={{ maxWidth: 640, margin: '0 auto 14px', color: 'var(--muted)', fontSize: 16, lineHeight: 1.6 }}>
    Wedding cards, festive invites, milestone celebrations, and business templates —<br />
    made for Indian households, in languages that feel like you.
  </p>
  <p style={{ maxWidth: 560, margin: '0 auto 26px', color: 'var(--muted)', fontSize: 13.5 }}>
    🧺 Quick-edit designs delivered in 24–48 hours &nbsp;·&nbsp; ✨ Fully custom designs crafted just for you
  </p>
  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
    {categoryList.slice(0, 3).map((cat) => (
      <button
        key={cat.id}
        onClick={() => { setCategory(cat.name); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
        style={{
          background: '#fff', border: '1.5px solid var(--navy)', color: 'var(--navy)',
          padding: '9px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
        }}
      >
        {cat.name}
      </button>
    ))}
    <a
      href="#catalog"
      style={{ background: 'var(--basket-brown)', color: '#fff', padding: '9px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
    >
      Browse everything
    </a>
  </div>
</div>
      

      <section id="catalog" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                background: category === c ? 'var(--navy)' : 'var(--sky-1)',
                color: category === c ? '#fff' : 'var(--navy)'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 24 }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    height: 160,
                    background: p.images?.[0]
                      ? `#eee url(${p.images[0]}) center/cover no-repeat`
                      : p.track === 'A'
                      ? 'linear-gradient(135deg, var(--blush), var(--gold))'
                      : 'linear-gradient(135deg, var(--navy), var(--sage))'
                  }}
                />
                {p.images?.length > 1 && (
                  <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(30,43,60,0.75)', color: '#fff', fontSize: 11, padding: '3px 9px', borderRadius: 999 }}>
                    📷 {p.images.length}
                  </span>
                )}
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--basket-brown)', textTransform: 'uppercase' }}>
                  {p.track === 'A' ? 'Quick-edit · 24-48h' : 'Custom design'}
                </div>
                <h3 className="serif" style={{ margin: '6px 0' }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{p.description.slice(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <strong style={{ color: 'var(--basket-brown-dark)' }}>₹{p.price}</strong>
                  <button
                    onClick={() => { setActiveProduct(p); setActiveImageIndex(0); }}
                    style={{ background: 'none', border: '1.5px solid var(--navy)', color: 'var(--navy)', borderRadius: 999, padding: '7px 14px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && <p style={{ color: 'var(--muted)' }}>No templates found yet — add some via Prisma Studio.</p>}
        </div>
      </section>

      {customOrderOpen && <CustomOrderSection onClose={() => setCustomOrderOpen(false)} />}

      {/* Product detail / input collection modal */}
      {activeProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,43,60,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '90%', padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            {activeProduct.images?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setLightboxImage(activeProduct.images[activeImageIndex])}>
                  <img
                    src={activeProduct.images[activeImageIndex]}
                    alt={activeProduct.title}
                    style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, display: 'block' }}
                  />
                  <span style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(30,43,60,0.75)', color: '#fff', fontSize: 11, padding: '4px 9px', borderRadius: 999 }}>
                    🔍 Tap to view full image
                  </span>
                  {activeProduct.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex((i) => (i === 0 ? activeProduct.images.length - 1 : i - 1)); }}
                        style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', fontSize: 16 }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex((i) => (i === activeProduct.images.length - 1 ? 0 : i + 1)); }}
                        style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', fontSize: 16 }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {activeProduct.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
                    {activeProduct.images.map((img, idx) => (
                      <img
                        key={img}
                        src={img}
                        alt=""
                        onClick={() => setActiveImageIndex(idx)}
                        style={{
                          width: 48, height: 48, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                          border: idx === activeImageIndex ? '2px solid var(--basket-brown)' : '2px solid transparent',
                          opacity: idx === activeImageIndex ? 1 : 0.7
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          <h3 className="serif">{activeProduct.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{activeProduct.description}</p>
            {activeProduct.track === 'A' && (
              <>
                <p style={{ fontSize: 13, background: 'var(--sky-1)', padding: 10, borderRadius: 8 }}>
                  This is a quick-edit template — tell us what to put on it (names, date, wording) and we'll send your personalised version within 24–48 hours of payment.
                </p>
                <textarea
                  placeholder="e.g. Names: Ritu & Sourav, Date: 12 Dec 2026, venue: ..."
                  value={pendingInputDetails}
                  onChange={(e) => setPendingInputDetails(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid var(--line)', marginTop: 10 }}
                />
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
              <strong>₹{activeProduct.price}</strong>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setActiveProduct(null)} style={{ padding: '9px 16px', borderRadius: 999, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button
                  onClick={() => addToCart(activeProduct, pendingInputDetails)}
                  style={{ padding: '9px 18px', borderRadius: 999, border: 'none', background: 'var(--basket-brown)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Add to Tokri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Image lightbox — full, uncropped view */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(20,25,30,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, padding: 24, cursor: 'zoom-out'
          }}
        >
          <img
            src={lightboxImage}
            alt="Full size preview"
            style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }}
          />
          <button
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.15)',
              color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40,
              fontSize: 18, cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
      {/* Order success modal */}
      {orderSuccessOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,43,60,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 260, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 420, width: '100%', padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🧺</div>
            <h3 className="serif" style={{ margin: '0 0 10px' }}>{MANUAL_PAYMENT_MODE ? 'Order received!' : 'Payment received!'}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              {MANUAL_PAYMENT_MODE
                ? "We've received your order! We'll send you a secure payment link via WhatsApp or email shortly to complete your purchase."
                : "Your order is confirmed. You'll get a confirmation email, and your edited files within 24–48 hours."}
            </p>
            <button
              onClick={() => setOrderSuccessOpen(false)}
              style={{ marginTop: 18, background: 'var(--basket-brown)', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 28px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
      
      {/* Cart drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: 380, background: '#fff', boxShadow: '-8px 0 30px rgba(0,0,0,0.15)', zIndex: 210, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="script" style={{ color: 'var(--navy)', margin: 0, fontSize: 24 }}>Your Tokri</h3>
            <button onClick={() => setCartOpen(false)} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {cart.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: 40 }}>Your tokri is empty.</p>}
            {cart.map((item, i) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                  <strong style={{ fontSize: 14 }}>{product?.title}</strong>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.inputDetails.slice(0, 60)}</div>
                  <button onClick={() => removeFromCart(i)} style={{ fontSize: 12, color: 'var(--basket-brown-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>Remove</button>
                </div>
              );
            })}
          </div>
          {cart.length > 0 && (
            <div style={{ padding: 18, borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 12 }}>
                <span>Subtotal</span><span>₹{cartTotal()}</span>
              </div>
              <button
                onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: 'var(--basket-brown)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,43,60,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 220 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 420, width: '90%', padding: 28 }}>
            <h3 className="serif">Checkout</h3>
            <input placeholder="Full name" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} style={{ width: '100%', padding: 10, margin: '8px 0', borderRadius: 8, border: '1.5px solid var(--line)' }} />
            <input placeholder="Phone number" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} style={{ width: '100%', padding: 10, margin: '8px 0', borderRadius: 8, border: '1.5px solid var(--line)' }} />
            <input placeholder="Email (for your files)" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} style={{ width: '100%', padding: 10, margin: '8px 0', borderRadius: 8, border: '1.5px solid var(--line)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, margin: '14px 0' }}>
              <span>Total</span><span>₹{cartTotal()}</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--muted)', margin: '4px 0 14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2 }} />
              <span>
                I agree to the{' '}
                <a href="/terms-of-use" target="_blank" style={{ color: 'var(--navy)', fontWeight: 600 }}>Terms of Use</a>
                {' '}and{' '}
                <a href="/refund-policy" target="_blank" style={{ color: 'var(--navy)', fontWeight: 600 }}>Refund Policy</a>
              </span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCheckoutOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer' }}>Back</button>
              <button
                disabled={placingOrder || !agreedToTerms}
                onClick={handlePayment}
                style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: agreedToTerms ? 'var(--navy)' : '#ccc', color: '#fff', fontWeight: 700, cursor: agreedToTerms ? 'pointer' : 'not-allowed' }}
              >
                {placingOrder ? 'Please wait...' : MANUAL_PAYMENT_MODE ? 'Place Order' : 'Pay via UPI'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AboutSection />
      <FAQSection />

      <footer style={{ background: 'var(--navy)', color: 'var(--sky-1)', marginTop: 60, padding: '40px 24px', textAlign: 'center' }}>
        <div className="script" style={{ fontSize: 26, color: '#fff' }}>Template Tokri</div>
        <p style={{ fontSize: 13, marginTop: 8 }}>Kolkata, West Bengal · hello@templatetokri.in</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14, fontSize: 12.5 }}>
          <a href="/terms-of-use" style={{ color: 'var(--sky-1)' }}>Terms of Use</a>
          <a href="/privacy-policy" style={{ color: 'var(--sky-1)' }}>Privacy Policy</a>
          <a href="/refund-policy" style={{ color: 'var(--sky-1)' }}>Refund Policy</a>
          <a href="/delivery-policy" style={{ color: 'var(--sky-1)' }}>Delivery Policy</a>
        </div>
      </footer>
    </div>
  );
}

function CustomOrderSection({ onClose }: { onClose: () => void }) {
  const [occasion, setOccasion] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', preferredLanguage: 'English',
    freeText: '', wedding: { couple: '', date: '', venue: '', theme: '' },
    puja: { community: '', dates: '' },
    business: { businessName: '', businessCategory: '' }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!form.name || !form.phone || !occasion) {
      alert('Please fill in your name, phone number, and select an occasion.');
      return;
    }
    setSubmitting(true);
    try {
      let occasionDetails = {};
      if (occasion === 'Wedding') occasionDetails = form.wedding;
      if (occasion === 'Puja') occasionDetails = form.puja;
      if (occasion === 'Business') occasionDetails = form.business;

      await fetch('/api/custom-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          preferredLanguage: form.preferredLanguage,
          occasion,
          occasionDetails,
          freeText: form.freeText
        })
      });
      setSubmitted(true);
    } catch (err) {
      alert('Something went wrong submitting your request. Please try again or WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = { width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid var(--line)', fontFamily: 'Poppins', fontSize: 14 };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(30,43,60,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: 20
      }}
    >
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: 30 }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: '#fff', border: '1px solid var(--line)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: 'var(--muted)' }}
        >
          ✕
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🧺</div>
            <h2 className="serif" style={{ marginTop: 0 }}>Thanks — we've got your request!</h2>
            <p style={{ color: 'var(--muted)' }}>
              Our team will reach out to you at {form.phone} within a day with next steps and a quote.
              {form.email && ' A confirmation has also been sent to your email.'}
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 16, background: 'var(--basket-brown)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--basket-brown)' }}>Track B — Custom Design</div>
            <h2 className="serif" style={{ margin: '6px 0 20px' }}>Tell us what you need</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>What's this for?</label>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} style={inputStyle}>
                <option value="">Select an occasion</option>
                <option value="Wedding">Wedding</option>
                <option value="Puja">Puja / Festival</option>
                <option value="Business">Business</option>
                <option value="Other">Something else</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div><label style={labelStyle}>Your name</label><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label style={labelStyle}>Phone number</label><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email (optional)</label>
              <input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Preferred language</label>
              <select style={inputStyle} value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
                <option>English</option><option>Hindi</option><option>Bengali</option>
              </select>
            </div>

            {occasion === 'Wedding' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div><label style={labelStyle}>Couple's names</label><input style={inputStyle} placeholder="e.g. Ritu & Sourav" value={form.wedding.couple} onChange={(e) => setForm({ ...form, wedding: { ...form.wedding, couple: e.target.value } })} /></div>
                <div><label style={labelStyle}>Wedding date</label><input type="date" style={inputStyle} value={form.wedding.date} onChange={(e) => setForm({ ...form, wedding: { ...form.wedding, date: e.target.value } })} /></div>
                <div><label style={labelStyle}>Venue</label><input style={inputStyle} value={form.wedding.venue} onChange={(e) => setForm({ ...form, wedding: { ...form.wedding, venue: e.target.value } })} /></div>
                <div><label style={labelStyle}>Colour theme / motif</label><input style={inputStyle} placeholder="e.g. Mithila art, maroon & gold" value={form.wedding.theme} onChange={(e) => setForm({ ...form, wedding: { ...form.wedding, theme: e.target.value } })} /></div>
              </div>
            )}

            {occasion === 'Puja' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div><label style={labelStyle}>Community / pandal name</label><input style={inputStyle} value={form.puja.community} onChange={(e) => setForm({ ...form, puja: { ...form.puja, community: e.target.value } })} /></div>
                <div><label style={labelStyle}>Event dates</label><input style={inputStyle} placeholder="e.g. 1-5 Oct" value={form.puja.dates} onChange={(e) => setForm({ ...form, puja: { ...form.puja, dates: e.target.value } })} /></div>
              </div>
            )}

            {occasion === 'Business' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div><label style={labelStyle}>Business name</label><input style={inputStyle} value={form.business.businessName} onChange={(e) => setForm({ ...form, business: { ...form.business, businessName: e.target.value } })} /></div>
                <div><label style={labelStyle}>Business category</label><input style={inputStyle} value={form.business.businessCategory} onChange={(e) => setForm({ ...form, business: { ...form.business, businessCategory: e.target.value } })} /></div>
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Tell us anything else about what you need</label>
              <textarea rows={4} style={inputStyle} placeholder="Fonts you like, reference designs, quantity, deadline..." value={form.freeText} onChange={(e) => setForm({ ...form, freeText: e.target.value })} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ background: 'var(--basket-brown)', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 22px', fontWeight: 700, cursor: 'pointer' }}
            >
              {submitting ? 'Sending...' : 'Send request'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function AboutSection() {
  return (
    <section id="about" style={{ padding: '64px 24px', background: 'linear-gradient(180deg, var(--sky-1) 0%, var(--cream) 60%)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🧺</div>
        <h2 className="script" style={{ fontSize: 40, color: 'var(--navy)', margin: '0 0 6px' }}>Welcome to Template Tokri</h2>
        <p className="serif" style={{ fontStyle: 'italic', color: 'var(--muted)', fontSize: 16, margin: '0 0 26px' }}>
          Where every big dream begins with an unforgettable first impression.
        </p>

        <p style={{ color: 'var(--ink)', fontSize: 15, lineHeight: 1.8, textAlign: 'left', margin: '0 0 14px' }}>
          A tokri has always held the things closest to our hearts — sweets for celebration, blooms for a blessing, and the love of family. Template Tokri is our basket of beginnings.
        </p>
        <p style={{ color: 'var(--ink)', fontSize: 15, lineHeight: 1.8, textAlign: 'left', margin: '0 0 30px' }}>
          Whether you're stepping into a lifetime of love or launching a dream business, we believe your story deserves to be announced with soul. An invitation or brand design isn't just paper or pixels — it's an emotion, a promise, and the standard-setter for everything that follows.
        </p>

        <h3 className="serif" style={{ fontSize: 22, color: 'var(--navy)', margin: '0 0 20px' }}>What we craft with love</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 26 }}>
          <div style={{ background: 'var(--blush)', borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
            <div style={{ fontSize: 26 }}>🌸</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#712B13', marginTop: 10 }}>Dream celebrations</div>
            <div style={{ fontSize: 13, color: '#8a4f38', marginTop: 4, lineHeight: 1.6 }}>
              Artful, soulful invitations for weddings and milestones that stir excitement long before the day arrives.
            </div>
          </div>
          <div style={{ background: 'var(--gold)', borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
            <div style={{ fontSize: 26 }}>💼</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#412402', marginTop: 10 }}>Bespoke business branding</div>
            <div style={{ fontSize: 13, color: '#5c4a00', marginTop: 4, lineHeight: 1.6 }}>
              Distinctive, polished designs that give modern ventures instant credibility and charm.
            </div>
          </div>
        </div>

        <p className="serif" style={{ fontStyle: 'italic', color: 'var(--muted)', fontSize: 15, margin: '0 0 28px' }}>
          Handcrafted luxury, made thoughtful and accessible.
        </p>

        <div>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🤍</div>
          <p className="script" style={{ fontSize: 26, color: 'var(--navy)', margin: 0, lineHeight: 1.2 }}>
            With love and gratitude,<br />Shruti, Founder
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What's the difference between quick-edit and custom design?",
      a: 'Quick-edit (Track A) is a ready template we personalise with your details in 24–48 hours. Custom design (Track B) is built from scratch around your specific requirements.'
    },
    {
      q: 'How fast will I get my files?',
      a: 'Quick-edit: 24–48 hours after payment and receiving your details. Custom: timeline confirmed with you individually after we understand your requirements.'
    },
    {
      q: 'What languages do you support?',
      a: 'We design in multiple Indian languages so your invitation feels personal and familiar — let us know your preference when you order.'
    },
    {
      q: 'Is paying by UPI safe?',
      a: "Yes — all payments go through Razorpay, a licensed payment gateway. We never see or store your card or UPI details."
    },
    {
      q: 'Can I get a refund?',
      a: 'It depends on the product and stage of your order — see our full Refund Policy in the footer for details.'
    },
    {
      q: 'Do you deliver printed cards, or only digital files?',
      a: "Currently we deliver digital files only — you can print locally or share them online/via WhatsApp."
    },
    {
      q: 'What if I need changes after ordering?',
      a: 'Contact us — quick-edit templates include light corrections, and custom orders include revision rounds agreed upfront.'
    },
    {
      q: 'Do you deliver anywhere in India?',
      a: "Yes — we design for Indian households everywhere. Anyone, anywhere, can order from us."
    },
    {
      q: 'Will the logo and watermark be on the card I receive?',
      a: 'No — the watermark on preview images is just for protection. Your final delivered file will be clean and completely free of any watermark or logo.'
    }
  ];

  return (
    <section id="faq" style={{ maxWidth: 720, margin: '0 auto', padding: '20px 24px 56px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--basket-brown)' }}>
          FAQ
        </div>
        <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 30 }}>Common questions</h2>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {faqs.map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left', padding: '16px 18px', background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                fontFamily: 'Poppins', fontWeight: 600, fontSize: 14.5, color: 'var(--navy)'
              }}
            >
              {item.q}
              <span style={{ fontSize: 18, color: 'var(--basket-brown)', flexShrink: 0, marginLeft: 12 }}>
                {openIndex === i ? '−' : '+'}
              </span>
            </button>
            {openIndex === i && (
              <div style={{ padding: '0 18px 16px', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}