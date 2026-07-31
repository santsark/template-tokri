'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'products' | 'orders' | 'leads';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('products');
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F1E3', fontFamily: 'Poppins, sans-serif' }}>
      <header style={{ background: '#1E2B3C', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: 'Caveat, cursive', fontSize: 26 }}>Template Tokri Admin</span>
        <nav style={{ display: 'flex', gap: 10, marginLeft: 20 }}>
          {(['products', 'orders', 'leads'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                background: tab === t ? '#C9A227' : 'transparent',
                color: tab === t ? '#232B26' : '#fff'
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fff', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
          Log out
        </button>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 28 }}>
        {tab === 'products' && <ProductsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'leads' && <LeadsTab />}
      </main>
    </div>
  );
}

// ---------------- Products ----------------

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    slug: '', title: '', description: '', category: 'PUJA', regionLanguage: '',
    track: 'A', price: '', images: [] as string[], isActive: true
  });

  function load() {
    fetch('/api/admin/products').then((r) => r.json()).then(setProducts);
  }
  useEffect(load, []);

  async function handleImageUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setForm((f) => ({ ...f, images: [...f.images, data.url] }));
  }

  async function handleCreate() {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowForm(false);
    setForm({ slug: '', title: '', description: '', category: 'PUJA', regionLanguage: '', track: 'A', price: '', images: [], isActive: true });
    load();
  }

  async function toggleActive(product: any) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive })
    });
    load();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif' }}>Products</h2>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div style={card}>
          <div style={twoCol}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} style={input} />
            <input placeholder="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={input} />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...input, width: '100%', marginTop: 10 }} rows={3} />
          <div style={twoCol}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={input}>
              <option value="PUJA">Puja</option>
              <option value="WEDDING">Wedding</option>
              <option value="BUSINESS">Business</option>
              <option value="OTHER">Other</option>
            </select>
            <select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })} style={input}>
              <option value="A">Track A — Quick edit</option>
              <option value="B">Track B — Custom</option>
            </select>
          </div>
          <input placeholder="Region / Language (e.g. Bengali)" value={form.regionLanguage} onChange={(e) => setForm({ ...form, regionLanguage: e.target.value })} style={{ ...input, width: '100%', marginTop: 10 }} />

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Product image</label><br />
            <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
            {uploading && <span style={{ fontSize: 12, color: '#6B7770' }}> Uploading...</span>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {form.images.map((url) => (
                <img key={url} src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
              ))}
            </div>
          </div>

          <button onClick={handleCreate} style={{ ...btnPrimary, marginTop: 14 }}>Save Product</button>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {products.map((p) => (
          <div key={p.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{p.title}</strong> — ₹{p.price}
              <div style={{ fontSize: 12, color: '#6B7770' }}>{p.category} · {p.regionLanguage} · Track {p.track}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: p.isActive ? '#E4F1EE' : '#f0e0e0', color: p.isActive ? '#1F5D57' : '#A64A2A' }}>
                {p.isActive ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => toggleActive(p)} style={btnOutline}>{p.isActive ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => deleteProduct(p.id)} style={{ ...btnOutline, color: '#A64A2A', borderColor: '#A64A2A' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Orders ----------------

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);

  function load() {
    fetch('/api/admin/orders').then((r) => r.json()).then(setOrders);
  }
  useEffect(load, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    load();
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: 16 }}>Orders</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {orders.map((o) => (
          <div key={o.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{o.customerName}</strong>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} style={{ ...input, width: 180 }}>
                <option value="PENDING_PAYMENT">Pending Payment</option>
                <option value="PAID">Paid</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div style={{ fontSize: 12, color: '#6B7770', margin: '4px 0' }}>{o.customerPhone} · {o.customerEmail}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {o.items.map((i: any) => (
                <div key={i.id} style={{ borderTop: '1px solid #E4DFD3', paddingTop: 6, marginTop: 6 }}>
                  <strong>{i.product.title}</strong> x{i.quantity} — ₹{i.unitPrice}
                  <div style={{ fontSize: 12, color: '#6B7770' }}>Inputs: {i.inputDetails || '—'}</div>
                </div>
              ))}
            </div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>Total: ₹{o.totalAmount}</div>
          </div>
        ))}
        {orders.length === 0 && <p style={{ color: '#6B7770' }}>No orders yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Leads ----------------

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([]);

  function load() {
    fetch('/api/admin/leads').then((r) => r.json()).then(setLeads);
  }
  useEffect(load, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    load();
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: 16 }}>Custom Order Leads</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {leads.map((l) => (
          <div key={l.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{l.name} — {l.occasion}</strong>
              <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} style={{ ...input, width: 160 }}>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUOTED">Quoted</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div style={{ fontSize: 12, color: '#6B7770', margin: '4px 0' }}>{l.phone} · {l.email}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{l.freeText}</div>
          </div>
        ))}
        {leads.length === 0 && <p style={{ color: '#6B7770' }}>No custom order requests yet.</p>}
      </div>
    </div>
  );
}

// ---------------- shared styles ----------------

const card: React.CSSProperties = { background: '#fff', border: '1px solid #E4DFD3', borderRadius: 12, padding: 16 };
const input: React.CSSProperties = { padding: 9, borderRadius: 8, border: '1.5px solid #E4DFD3', fontFamily: 'Poppins' };
const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 };
const btnPrimary: React.CSSProperties = { background: '#B97A3E', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, cursor: 'pointer' };
const btnOutline: React.CSSProperties = { background: '#fff', border: '1.5px solid #1E2B3C', color: '#1E2B3C', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' };
