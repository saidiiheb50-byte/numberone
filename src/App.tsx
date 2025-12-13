import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { menuItems, type MenuItem } from './data/menu'

type CartState = Record<string, number>
type ServiceType = 'pickup' | 'delivery'

const restaurantPhone = '+21650123456'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2,
  }).format(value)

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [showOrderPanel, setShowOrderPanel] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartState>({})
  const [serviceType, setServiceType] = useState<ServiceType>('pickup')
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    note: '',
  })
  const orderPanelRef = useRef<HTMLDivElement | null>(null)

  const cartLines = useMemo(
    () =>
      menuItems
        .filter((item) => cart[item.id])
        .map((item) => ({
          item,
          quantity: cart[item.id],
          lineTotal: item.price * cart[item.id],
        })),
    [cart],
  )

  const total = cartLines.reduce((sum, line) => sum + line.lineTotal, 0)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (cartLines.length > 0) {
      setShowOrderPanel(true)
    }
  }, [cartLines.length])

  const addToCart = (item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] ?? 0) + 1,
    }))
    setShowOrderPanel(true)
    requestAnimationFrame(() => {
      orderPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] ?? 0
      const next = Math.max(0, current + delta)
      const updated = { ...prev }
      if (next === 0) {
        delete updated[id]
      } else {
        updated[id] = next
      }
      return updated
    })
  }

  const handleSendOrder = () => {
    if (cartLines.length === 0) return

    const lines = cartLines
      .map(
        ({ item, quantity, lineTotal }) =>
          `- ${item.name} x${quantity} (${formatPrice(lineTotal)})`,
      )
      .join('\n')

    const header = `Nouvelle commande Number One`
    const info = [
      customer.name ? `Client: ${customer.name}` : '',
      customer.phone ? `Téléphone: ${customer.phone}` : '',
      `Service: ${serviceType === 'pickup' ? 'A emporter' : 'Livraison'}`,
      customer.note ? `Note: ${customer.note}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const message = encodeURIComponent(
      `${header}\n${info}\n\n${lines}\n\nTotal: ${formatPrice(total)}`,
    )
    const url = `https://wa.me/${restaurantPhone.replace(/\D/g, '')}?text=${message}`

    window.open(url, '_blank')
  }

  const scrollToMenu = () => {
    const el = document.getElementById('menu')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const renderCategoryHero = (
    title: string,
    category: MenuItem['category'],
    image: string,
    categoryKey: string,
  ) => {
    const items = menuItems.filter((item) => item.category === category)
    const minPrice = Math.min(...items.map((item) => item.price))
    const maxPrice = Math.max(...items.map((item) => item.price))
    const isExpanded = expandedCategory === categoryKey

    const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation()
      setExpandedCategory(isExpanded ? null : categoryKey)
    }

    return (
      <div className={`category-hero-card ${isExpanded ? 'expanded' : ''}`}>
        <div className="category-hero-image" onClick={toggleExpand}>
          <img src={image} alt={title} loading="lazy" />
          <div className="category-hero-overlay" />
          {!isExpanded && (
            <div className="category-hero-preview">
              <h2>{title}</h2>
              <p className="category-hero-price-preview">
                À partir de {formatPrice(minPrice)}
                {minPrice !== maxPrice && ` - ${formatPrice(maxPrice)}`}
              </p>
              <span className="category-hero-cta">Cliquez pour voir le menu</span>
            </div>
          )}
        </div>
        {isExpanded && (
          <div className="category-hero-content">
            <div className="category-hero-header">
              <h2>{title}</h2>
              <button className="ghost-btn" onClick={toggleExpand}>
                Fermer
              </button>
            </div>
            <p className="category-hero-price">
              {items.length} choix disponibles • À partir de {formatPrice(minPrice)}
              {minPrice !== maxPrice && ` - ${formatPrice(maxPrice)}`}
            </p>
            <div className="category-hero-items">
              {items.map((item) => (
                <div key={item.id} className="category-item">
                  <div className="category-item-info">
                    <h4>{item.name}</h4>
                    <p className="category-item-desc">{item.description}</p>
                    {item.badges && (
                      <div className="category-item-badges">
                        {item.badges.map((badge) => (
                          <span key={badge} className="badge">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="category-item-actions">
                    <span className="price">{formatPrice(item.price)}</span>
                    <button
                      className="primary-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(item)
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {showSplash && (
        <div className="splash">
          <div className="splash-logo">
            <img src="/logo.jpg" alt="Logo Number One" />
          </div>
          <p className="splash-title">Number One</p>
        </div>
      )}
      <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <img src="/logo.jpg" alt="Logo Number One" className="brand-logo" />
          </div>
          <div>
            <p className="brand-name">Number One</p>
            <small>Sandwich Libanais & Pizza · Tunis</small>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-btn" onClick={() => (window.location.href = `tel:${restaurantPhone}`)}>
            Appeler
          </button>
          <button className="primary-btn" onClick={scrollToMenu}>
            Commander
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-visual">
            <img
              src="/pizza.jpg"
              alt="Grande pizza artisanale"
              loading="lazy"
            />
            <div className="hero-visual-overlay" />
            <div className="hero-visual-content">
              <div className="brand-mark large">
                <img src="/logo.jpg" alt="Logo Number One" className="brand-logo" />
              </div>
              <div>
                <p className="eyebrow">Number One</p>
                <h3>Pizza & Sandwich Libanais</h3>
                <div className="hero-cta">
                  <button className="primary-btn subtle">Bienvenue chez Number One</button>
                  <button className="ghost-btn light">Panier prêt</button>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-content">
            <p className="eyebrow">Bienvenue chez Number One</p>
            <h1>Sandwich Libanais & Pizza, prêts pour votre commande</h1>
            <p className="lead">
              Une carte courte, des produits frais, une équipe rapide. Choisissez vos favoris,
              ajoutez au panier et finalisez par téléphone ou WhatsApp.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={scrollToMenu}>
                Voir le menu
              </button>
              <button
                className="ghost-btn"
                onClick={() => window.open(`https://wa.me/${restaurantPhone.replace(/\D/g, '')}`, '_blank')}
              >
                WhatsApp
              </button>
            </div>
            <div className="hero-tags">
              <span className="pill">Livraison rapide</span>
              <span className="pill">Paiement à la livraison</span>
              <span className="pill">Halal friendly</span>
            </div>
            <div className="hero-stats">
              <div>
                <strong>24/7</strong>
                <span>Service continu</span>
              </div>
              <div>
                <strong>15 min</strong>
                <span>Moyenne préparation</span>
              </div>
              <div>
                <strong>+50k</strong>
                <span>Clients servis</span>
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="menu">
          <div className="menu-header">
            <div>
              <p className="eyebrow">Commander en ligne</p>
              <h2>Choisissez, ajoutez au panier, envoyez</h2>
            </div>
          </div>

          <div className="category-hero-grid">
            {renderCategoryHero(
              'Fast Food',
              'sandwich',
              'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80',
              'fastfood'
            )}
            {renderCategoryHero(
              'Plats',
              'pizza',
              'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=1200&q=80',
              'plats'
            )}
          </div>
        </section>
      </main>

      {showOrderPanel || cartLines.length > 0 ? (
        <section className="order-section" ref={orderPanelRef}>
          <aside className="order-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Panier</p>
                <h3>Votre commande</h3>
              </div>
              <span className="count-badge">{cartLines.length} article(s)</span>
            </div>

            {cartLines.length === 0 ? (
              <p className="muted">Ajoutez vos plats pour commencer.</p>
            ) : (
              <ul className="cart-list">
                {cartLines.map(({ item, quantity, lineTotal }) => (
                  <li key={item.id} className="cart-line">
                    <div>
                      <p className="cart-title">{item.name}</p>
                      <p className="muted">{formatPrice(item.price)} / unité</p>
                    </div>
                    <div className="cart-actions">
                      <button className="circle-btn" onClick={() => updateQuantity(item.id, -1)}>
                        –
                      </button>
                      <span className="qty">{quantity}</span>
                      <button className="circle-btn" onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                      <span className="line-total">{formatPrice(lineTotal)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="total-row">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <div className="service-toggle">
              <button
                className={serviceType === 'pickup' ? 'chip active' : 'chip'}
                onClick={() => setServiceType('pickup')}
              >
                À emporter
              </button>
              <button
                className={serviceType === 'delivery' ? 'chip active' : 'chip'}
                onClick={() => setServiceType('delivery')}
              >
                Livraison
              </button>
            </div>

            <div className="form">
              <label>
                Nom / Prénom
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={customer.name}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label>
                Téléphone
                <input
                  type="tel"
                  placeholder="+216 ..."
                  value={customer.phone}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>
              <label>
                Note (adresse, sauce, etc.)
                <textarea
                  placeholder="Ajoutez une précision (étage, extra fromage...)"
                  value={customer.note}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, note: e.target.value }))}
                />
              </label>
            </div>

            <button
              className="primary-btn full-width"
              disabled={cartLines.length === 0}
              onClick={handleSendOrder}
            >
              Envoyer la commande via WhatsApp
            </button>
          </aside>
        </section>
      ) : null}
    </div>
    </>
  )
}

export default App
