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

const emptyForm = {
  id: '', slug: '', title: '', description: '', category: '', regionLanguage: '',
  track: 'A', price: '', images: [] as string[], isActive: true
};

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  function load() {
    fetch('/api/admin/products').then((r) => r.json()).then(setProducts);
  }
  function loadCategories() {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories);
  }
  useEffect(() => { load(); loadCategories(); }, []);

  async function handleImageUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setForm((f) => ({ ...f, images: [...f.images, data.url] }));
  }

  function startAdd() {
    setForm({ ...emptyForm, category: categories[0]?.name || '' });
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(p: any) {
    setForm({
      id: p.id, slug: p.slug, title: p.title, description: p.description,
      category: p.category, regionLanguage: p.regionLanguage, track: p.track,
      price: String(p.price), images: p.images || [], isActive: p.isActive
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (editingId) {
      await fetch(`/api/admin/products/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
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

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.trim() })
    });
    setNewCategoryName('');
    loadCategories();
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? Products already using it will keep the old value as plain text.')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    loadCategories();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', margin: 0 }}>Products</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowCategoryManager(!showCategoryManager)} style={btnOutline}>
            {showCategoryManager ? 'Close categories' : 'Manage categories'}
          </button>
          <button onClick={showForm ? () => setShowForm(false) : startAdd} style={btnPrimary}>
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {showCategoryManager && (
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Categories</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="New category name (e.g. Anniversary)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ ...input, flex: 1 }}
            />
            <button onClick={addCategory} style={btnPrimary}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c) => (
              <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F7F1E3', padding: '5px 10px', borderRadius: 999, fontSize: 13 }}>
                {c.name}
                <button onClick={() => deleteCategory(c.id)} style={{ background: 'none', border: 'none', color: '#A64A2A', cursor: 'pointer', fontWeight: 700 }}>×</button>
              </span>
            ))}
            {categories.length === 0 && <span style={{ fontSize: 13, color: '#6B7770' }}>No categories yet — add one above.</span>}
          </div>
        </div>
      )}

      {showForm && (
        <div style={card}>
          <div style={twoCol}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, '-') })} style={input} />
            <input placeholder="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={input} />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...input, width: '100%', marginTop: 10 }} rows={3} />
          <div style={twoCol}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={input}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
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

          <button onClick={handleSave} style={{ ...btnPrimary, marginTop: 14 }}>
            {editingId ? 'Save Changes' : 'Save Product'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {products.map((p) => (
          <div key={p.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong>{p.title}</strong> — ₹{p.price}
              <div style={{ fontSize: 12, color: '#6B7770' }}>{p.category} · {p.regionLanguage} · Track {p.track}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: p.isActive ? '#E4F1EE' : '#f0e0e0', color: p.isActive ? '#1F5D57' : '#A64A2A' }}>
                {p.isActive ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => startEdit(p)} style={btnOutline}>Edit</button>
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
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
  const [pendingNotes, setPendingNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [resending, setResending] = useState<Record<string, boolean>>({});

  function load() {
    fetch('/api/admin/orders').then((r) => r.json()).then(setOrders);
  }
  useEffect(load, []);

  async function saveStatus(id: string) {
    setSaving((s) => ({ ...s, [id]: true }));
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: pendingStatus[id] })
    });
    setSaving((s) => ({ ...s, [id]: false }));
    setPendingStatus((p) => { const n = { ...p }; delete n[id]; return n; });
    load();
  }

  async function saveNotes(id: string) {
    setSaving((s) => ({ ...s, [`notes-${id}`]: true }));
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: pendingNotes[id] })
    });
    setSaving((s) => ({ ...s, [`notes-${id}`]: false }));
    setPendingNotes((p) => { const n = { ...p }; delete n[id]; return n; });
    load();
  }

  async function handleDeliverFile(orderId: string, orderItemId: string, file: File) {
    setUploading((u) => ({ ...u, [orderItemId]: true }));
    const fd = new FormData();
    fd.append('file', file);
    fd.append('orderItemId', orderItemId);
    await fetch(`/api/admin/orders/${orderId}/deliver`, { method: 'POST', body: fd });
    setUploading((u) => ({ ...u, [orderItemId]: false }));
    load();
  }

  async function handleResend(orderId: string, orderItemId: string) {
    setResending((r) => ({ ...r, [orderItemId]: true }));
    const res = await fetch(`/api/admin/orders/${orderId}/resend-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderItemId })
    });
    setResending((r) => ({ ...r, [orderItemId]: false }));
    if (res.ok) {
      alert('Delivery email re-sent with a fresh link.');
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`Could not resend: ${data.error || 'unknown error'}`);
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: 16 }}>Orders</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {orders.map((o) => {
          const currentStatus = pendingStatus[o.id] ?? o.status;
          const statusChanged = pendingStatus[o.id] && pendingStatus[o.id] !== o.status;
          const currentNotes = pendingNotes[o.id] ?? (o.notes || '');
          const notesChanged = pendingNotes[o.id] !== undefined && pendingNotes[o.id] !== (o.notes || '');

          return (
            <div key={o.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <strong>{o.customerName}</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={currentStatus}
                    onChange={(e) => setPendingStatus((p) => ({ ...p, [o.id]: e.target.value }))}
                    style={{ ...input, width: 180 }}
                  >
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                    <option value="PAID">Paid</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {statusChanged && (
                    <button onClick={() => saveStatus(o.id)} disabled={saving[o.id]} style={btnPrimary}>
                      {saving[o.id] ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6B7770', margin: '4px 0' }}>{o.customerPhone} · {o.customerEmail}</div>

              <div style={{ fontSize: 13, marginTop: 6 }}>
                {o.items.map((i: any) => {
                  const itemTitle = i.product?.title || i.customTitle || 'Custom item';
                  return (
                    <div key={i.id} style={{ borderTop: '1px solid #E4DFD3', paddingTop: 8, marginTop: 8 }}>
                      <strong>{itemTitle}</strong> x{i.quantity} — ₹{i.unitPrice}
                      <div style={{ fontSize: 12, color: '#6B7770' }}>Inputs: {i.inputDetails || '—'}</div>

                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {i.deliveredFileUrl ? (
                          <>
                            <span style={{ fontSize: 12, color: '#1F5D57', background: '#E4F1EE', padding: '3px 10px', borderRadius: 999 }}>
                              ✓ Delivered
                            </span>
                            <button onClick={() => handleResend(o.id, i.id)} disabled={resending[i.id]} style={btnOutline}>
                              {resending[i.id] ? 'Sending...' : 'Resend email'}
                            </button>
                            <label style={{ ...btnOutline, cursor: 'pointer' }}>
                              Replace file
                              <input type="file" style={{ display: 'none' }} onChange={(e) => e.target.files && handleDeliverFile(o.id, i.id, e.target.files[0])} />
                            </label>
                          </>
                        ) : (
                          <label style={{ ...btnPrimary, cursor: 'pointer', display: 'inline-block' }}>
                            {uploading[i.id] ? 'Uploading...' : 'Upload finished file'}
                            <input type="file" style={{ display: 'none' }} disabled={uploading[i.id]} onChange={(e) => e.target.files && handleDeliverFile(o.id, i.id, e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontWeight: 700, marginTop: 10 }}>Total: ₹{o.totalAmount}</div>

              <div style={{ marginTop: 12, borderTop: '1px solid #E4DFD3', paddingTop: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Notes (offline messages, comments)</label>
                <textarea
                  rows={2}
                  value={currentNotes}
                  onChange={(e) => setPendingNotes((p) => ({ ...p, [o.id]: e.target.value }))}
                  style={{ ...input, width: '100%' }}
                  placeholder="e.g. Customer called to confirm spelling of names on 2 Aug"
                />
                {notesChanged && (
                  <button onClick={() => saveNotes(o.id)} disabled={saving[`notes-${o.id}`]} style={{ ...btnPrimary, marginTop: 6 }}>
                    {saving[`notes-${o.id}`] ? 'Saving...' : 'Save notes'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <p style={{ color: '#6B7770' }}>No orders yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Leads ----------------

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([]);
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
  const [pendingNotes, setPendingNotes] = useState<Record<string, string>>({});
  const [pendingQuote, setPendingQuote] = useState<Record<string, string>>({});
  const [linkAmount, setLinkAmount] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [generatingLink, setGeneratingLink] = useState<Record<string, boolean>>({});

  function load() {
    fetch('/api/admin/leads').then((r) => r.json()).then(setLeads);
  }
  useEffect(load, []);

  async function saveField(id: string, field: 'status' | 'notes' | 'amountQuoted', value: string) {
    const key = `${field}-${id}`;
    setSaving((s) => ({ ...s, [key]: true }));
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    });
    setSaving((s) => ({ ...s, [key]: false }));
    if (field === 'status') setPendingStatus((p) => { const n = { ...p }; delete n[id]; return n; });
    if (field === 'notes') setPendingNotes((p) => { const n = { ...p }; delete n[id]; return n; });
    if (field === 'amountQuoted') setPendingQuote((p) => { const n = { ...p }; delete n[id]; return n; });
    load();
  }

  async function generateLink(id: string, lead: any) {
    const amount = linkAmount[id] || String(lead.amountQuoted || '');
    if (!amount || Number(amount) <= 0) {
      alert('Enter a valid amount first.');
      return;
    }
    setGeneratingLink((g) => ({ ...g, [id]: true }));
    const res = await fetch(`/api/admin/leads/${id}/payment-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) })
    });
    setGeneratingLink((g) => ({ ...g, [id]: false }));
    if (res.ok) {
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`Could not generate link: ${data.error || 'unknown error'}`);
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: 16 }}>Custom Order Leads</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {leads.map((l) => {
          const currentStatus = pendingStatus[l.id] ?? l.status;
          const statusChanged = pendingStatus[l.id] && pendingStatus[l.id] !== l.status;
          const currentNotes = pendingNotes[l.id] ?? (l.notes || '');
          const notesChanged = pendingNotes[l.id] !== undefined && pendingNotes[l.id] !== (l.notes || '');
          const currentQuote = pendingQuote[l.id] ?? String(l.amountQuoted ?? '');
          const quoteChanged = pendingQuote[l.id] !== undefined && pendingQuote[l.id] !== String(l.amountQuoted ?? '');

          return (
            <div key={l.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <strong>{l.name} — {l.occasion}</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={currentStatus}
                    onChange={(e) => setPendingStatus((p) => ({ ...p, [l.id]: e.target.value }))}
                    style={{ ...input, width: 160 }}
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUOTED">Quoted</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="CLOSED">Closed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {statusChanged && (
                    <button onClick={() => saveField(l.id, 'status', currentStatus)} disabled={saving[`status-${l.id}`]} style={btnPrimary}>
                      {saving[`status-${l.id}`] ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6B7770', margin: '4px 0' }}>{l.phone} · {l.email}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{l.freeText}</div>

              {l.convertedOrder && (
                <div style={{ marginTop: 10, fontSize: 12, background: '#E4F1EE', color: '#1F5D57', padding: '6px 10px', borderRadius: 8, display: 'inline-block' }}>
                  ✓ Converted to order — status: <strong>{l.convertedOrder.status}</strong> (see Orders tab for delivery)
                </div>
              )}

              <div style={{ marginTop: 12, borderTop: '1px solid #E4DFD3', paddingTop: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Notes (discussion log)</label>
                <textarea
                  rows={3}
                  value={currentNotes}
                  onChange={(e) => setPendingNotes((p) => ({ ...p, [l.id]: e.target.value }))}
                  style={{ ...input, width: '100%' }}
                  placeholder="e.g. Called on 2 Aug, wants gold accents, will confirm budget by Friday"
                />
                {notesChanged && (
                  <button onClick={() => saveField(l.id, 'notes', currentNotes)} disabled={saving[`notes-${l.id}`]} style={{ ...btnPrimary, marginTop: 6 }}>
                    {saving[`notes-${l.id}`] ? 'Saving...' : 'Save notes'}
                  </button>
                )}
              </div>

              <div style={{ marginTop: 12, borderTop: '1px solid #E4DFD3', paddingTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Amount Quoted (₹)</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="number"
                      value={currentQuote}
                      onChange={(e) => setPendingQuote((p) => ({ ...p, [l.id]: e.target.value }))}
                      style={{ ...input, width: 120 }}
                      placeholder="e.g. 1500"
                    />
                    {quoteChanged && (
                      <button onClick={() => saveField(l.id, 'amountQuoted', currentQuote)} disabled={saving[`amountQuoted-${l.id}`]} style={btnPrimary}>
                        {saving[`amountQuoted-${l.id}`] ? '...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Generate Payment Link</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="number"
                      placeholder={l.amountQuoted ? `Full: ₹${l.amountQuoted}` : 'Amount'}
                      value={linkAmount[l.id] ?? ''}
                      onChange={(e) => setLinkAmount((p) => ({ ...p, [l.id]: e.target.value }))}
                      style={{ ...input, width: 140 }}
                    />
                    <button onClick={() => generateLink(l.id, l)} disabled={generatingLink[l.id]} style={btnPrimary}>
                      {generatingLink[l.id] ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7770', marginTop: 4 }}>Leave blank to use full quoted amount, or enter a partial advance.</div>
                </div>
              </div>

              {l.paymentLinkUrl && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#6B7770' }}>Latest link:</span>
                  <a href={l.paymentLinkUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#1E2B3C', wordBreak: 'break-all' }}>{l.paymentLinkUrl}</a>
                  <button
                    onClick={() => { navigator.clipboard.writeText(l.paymentLinkUrl); alert('Copied to clipboard.'); }}
                    style={{ ...btnOutline, fontSize: 11, padding: '3px 8px' }}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
