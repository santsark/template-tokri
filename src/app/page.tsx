'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: string;
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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [pendingInputDetails, setPendingInputDetails] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('q', search);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [category, search]);

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
          alert('Payment received — your order is confirmed! You\'ll get a confirmation email, and your edited files within 24–48 hours.');
        }
      });
      rzp.open();
    } catch (err) {
      alert('Something went wrong placing your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }

  const categories = ['All', 'PUJA', 'WEDDING', 'BUSINESS'];

  return (
    <div>
      <header style={{ position: 'sticky', top: 0, background: 'rgba(247,241,227,0.95)', borderBottom: '1px solid var(--line)', zIndex: 50 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, padding: '12px 24px' }}>
          <span className="script" style={{ fontSize: 30, color: 'var(--navy)', fontWeight: 700 }}>Template Tokri</span>
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

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px' }}>
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
              {c === 'All' ? 'All' : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 24 }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
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
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--basket-brown)', textTransform: 'uppercase' }}>
                  {p.track === 'A' ? 'Quick-edit · 24-48h' : 'Custom design'}
                </div>
                <h3 className="serif" style={{ margin: '6px 0' }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{p.description.slice(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <strong style={{ color: 'var(--basket-brown-dark)' }}>₹{p.price}</strong>
                  <button
                    onClick={() => setActiveProduct(p)}
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

      {/* Product detail / input collection modal */}
      {activeProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,43,60,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '90%', padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            {activeProduct.images?.[0] && (
              <img
                src={activeProduct.images[0]}
                alt={activeProduct.title}
                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
              />
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
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCheckoutOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer' }}>Back</button>
              <button
                disabled={placingOrder}
                onClick={handlePayment}
                style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: 'var(--navy)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {placingOrder ? 'Please wait...' : 'Pay via UPI'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ background: 'var(--navy)', color: 'var(--sky-1)', marginTop: 60, padding: '40px 24px', textAlign: 'center' }}>
        <div className="script" style={{ fontSize: 26, color: '#fff' }}>Template Tokri</div>
        <p style={{ fontSize: 13, marginTop: 8 }}>Kolkata, West Bengal · hello@templatetokri.com</p>
      </footer>
    </div>
  );
}
