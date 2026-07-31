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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [pendingInputDetails, setPendingInputDetails] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [customOrderOpen, setCustomOrderOpen] = useState(false);


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
            <nav style={{ display: 'flex', gap: 16, fontSize: 14, fontWeight: 600 }}>
              <a href="#catalog" style={{ color: 'var(--navy)', textDecoration: 'none' }}>Shop</a>
              <button onClick={() => setCustomOrderOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--navy)', font: 'inherit', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Custom Orders</button>
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

      {customOrderOpen && <CustomOrderSection onClose={() => setCustomOrderOpen(false)} />}

      {/* Product detail / input collection modal */}
      {activeProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,43,60,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '90%', padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            {activeProduct.images?.[0] && (
              <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setLightboxImage(activeProduct.images[0])}>
                <img
                  src={activeProduct.images[0]}
                  alt={activeProduct.title}
                  style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
                />
                <span style={{ position: 'absolute', bottom: 22, right: 10, background: 'rgba(30,43,60,0.75)', color: '#fff', fontSize: 11, padding: '4px 9px', borderRadius: 999 }}>
                  🔍 Tap to view full image
                </span>
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
                <option>English</option><option>Bengali</option><option>Hindi</option><option>Bhojpuri</option><option>Maithili</option>
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