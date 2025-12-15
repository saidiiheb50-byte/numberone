import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { menuItems, type MenuItem } from './data/menu'

type CartItemOptions = {
  sauce: boolean
  fries: boolean
}

type CartItem = {
  quantity: number
  options: CartItemOptions
}

type CartState = Record<string, CartItem>
type ServiceType = 'pickup' | 'delivery'

const restaurantPhone = '+21692883677'

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
    address: '',
    note: '',
  })
  const [optionsModal, setOptionsModal] = useState<{
    item: MenuItem | null
    options: CartItemOptions
  } | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const orderPanelRef = useRef<HTMLDivElement | null>(null)

  const cartLines = useMemo(
    () =>
      menuItems
        .filter((item) => cart[item.id])
        .map((item) => {
          const cartItem = cart[item.id]
          return {
            item,
            quantity: cartItem.quantity,
            options: cartItem.options,
            lineTotal: item.price * cartItem.quantity,
          }
        }),
    [cart],
  )

  const total = cartLines.reduce((sum, line) => sum + line.lineTotal, 0)
  const totalQuantity = cartLines.reduce((sum, line) => sum + line.quantity, 0)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (cartLines.length > 0) {
      setShowOrderPanel(true)
    }
  }, [cartLines.length])

  const openOptionsModal = (item: MenuItem) => {
    setOptionsModal({
      item,
      options: {
        sauce: false,
        fries: false,
      },
    })
  }

  const confirmAddToCart = () => {
    if (!optionsModal?.item) return

    const item = optionsModal.item
    const options = optionsModal.options

    setCart((prev) => {
      const existing = prev[item.id]
      if (existing) {
        return {
          ...prev,
          [item.id]: {
            quantity: existing.quantity + 1,
            options: existing.options, // Keep existing options for simplicity
          },
        }
      }
      return {
        ...prev,
        [item.id]: {
          quantity: 1,
          options,
        },
      }
    })

    setShowOrderPanel(true)
    setOptionsModal(null)
    requestAnimationFrame(() => {
      orderPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const addToCart = (item: MenuItem) => {
    openOptionsModal(item)
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id]
      if (!current) return prev
      const next = Math.max(0, current.quantity + delta)
      const updated = { ...prev }
      if (next === 0) {
        delete updated[id]
      } else {
        updated[id] = {
          ...current,
          quantity: next,
        }
      }
      return updated
    })
  }

  const handleSendOrder = () => {
    if (cartLines.length === 0) return

    const lines = cartLines
      .map(({ item, quantity, lineTotal, options }) => {
        const extras = []
        if (options.sauce) extras.push('Sauce')
        if (options.fries) extras.push('Frites')
        const extrasText = extras.length > 0 ? ` [${extras.join(', ')}]` : ''
        return `- ${item.name} x${quantity}${extrasText} (${formatPrice(lineTotal)})`
      })
      .join('\n')

    const header = `🍕 Nouvelle commande Number One 🍕`
    const info = [
      `👤 Client: ${customer.name || 'Non renseigné'}`,
      `📞 Téléphone: ${customer.phone || 'Non renseigné'}`,
      `📍 Adresse: ${customer.address || (serviceType === 'pickup' ? 'À emporter' : 'Non renseignée')}`,
      `🚚 Service: ${serviceType === 'pickup' ? 'À emporter' : 'Livraison'}`,
      customer.note ? `📝 Note: ${customer.note}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const message = encodeURIComponent(
      `${header}\n${info}\n\n${lines}\n\nTotal: ${formatPrice(total)}`,
    )
    const url = `https://wa.me/${restaurantPhone.replace(/\D/g, '')}?text=${message}`

    window.open(url, '_blank')
    
    // Show thank you card and clear cart after a short delay
    setTimeout(() => {
      setShowThankYou(true)
      setCart({})
      setCustomer({
        name: '',
        phone: '',
        address: '',
        note: '',
      })
    }, 500)
  }

  const scrollToMenu = () => {
    const el = document.getElementById('menu')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToAbout = () => {
    const el = document.getElementById('about')
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
                  <div className="category-item-image">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
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
          <button className="ghost-btn" onClick={scrollToAbout}>
            À propos de nous
          </button>
          <button className="ghost-btn" onClick={() => (window.location.href = `tel:${restaurantPhone}`)}>
            Appeler
          </button>
          <button className="primary-btn cart-btn" onClick={scrollToMenu}>
            Commander
            {totalQuantity > 0 && (
              <span className="cart-badge">{totalQuantity}</span>
            )}
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
                <div className="hero-cta-text">
                  <span className="hero-text-golden">Bienvenue chez Number One</span>
                  <span className="hero-text-golden">Panier prêt</span>
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

        <section id="about" className="about-section">
          <div className="about-container">
            <div className="about-content">
              <p className="eyebrow">À propos de nous</p>
              <h2>Number One, l'excellence culinaire à Tunis</h2>
              <div className="about-text">
                <p>
                  Depuis notre ouverture, <strong>Number One</strong> s'engage à vous offrir une expérience
                  gastronomique exceptionnelle. Spécialisés dans les <strong>sandwichs libanais</strong> et les{' '}
                  <strong>pizzas artisanales</strong>, nous mettons un point d'honneur à utiliser uniquement des
                  ingrédients frais et de qualité supérieure.
                </p>
                <p>
                  Chaque plat est préparé avec passion et savoir-faire, dans le respect des traditions culinaires
                  libanaises et italiennes. Nos viandes sont sélectionnées avec soin, nos légumes sont frais du jour,
                  et nos sauces sont préparées maison selon nos recettes secrètes.
                </p>
                <p>
                  Chez Number One, la qualité n'est pas négociable. Nous croyons que chaque client mérite le meilleur,
                  c'est pourquoi nous ne faisons aucun compromis sur la fraîcheur de nos produits et l'excellence de
                  notre service.
                </p>
              </div>
              <div className="about-features">
                <div className="about-feature">
                  <div className="feature-icon">🍽️</div>
                  <h3>Ingrédients frais</h3>
                  <p>Produits sélectionnés quotidiennement pour garantir fraîcheur et qualité</p>
                </div>
                <div className="about-feature">
                  <div className="feature-icon">👨‍🍳</div>
                  <h3>Préparation artisanale</h3>
                  <p>Chaque plat est préparé à la commande avec passion et expertise</p>
                </div>
                <div className="about-feature">
                  <div className="feature-icon">⭐</div>
                  <h3>Excellence garantie</h3>
                  <p>Un engagement inébranlable envers la qualité et la satisfaction client</p>
                </div>
              </div>
              <div className="about-social">
                <p className="social-label">Suivez-nous</p>
                <div className="social-links">
                  <a
                    href="https://www.instagram.com/number_one_officiel/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=100062974282274"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link facebook"
                    aria-label="Facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@numberoneofficiel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link tiktok"
                    aria-label="TikTok"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showOrderPanel || cartLines.length > 0 ? (
        <section className="order-section" ref={orderPanelRef}>
          <aside className={`order-panel order-panel-${serviceType}`}>
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
                {cartLines.map(({ item, quantity, lineTotal, options }) => {
                  const extras = []
                  if (options.sauce) extras.push('Sauce')
                  if (options.fries) extras.push('Frites')
                  return (
                    <li key={item.id} className="cart-line">
                      <div>
                        <p className="cart-title">{item.name}</p>
                        <p className="muted">{formatPrice(item.price)} / unité</p>
                        {extras.length > 0 && (
                          <p className="cart-options">
                            {extras.map((extra, idx) => (
                              <span key={idx} className="option-badge">
                                {extra}
                              </span>
                            ))}
                          </p>
                        )}
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
                  )
                })}
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
                Nom / Prénom *
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={customer.name}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Téléphone *
                <input
                  type="tel"
                  placeholder="+216 ..."
                  value={customer.phone}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </label>
              <label>
                Adresse {serviceType === 'delivery' && '*'}
                <input
                  type="text"
                  placeholder={serviceType === 'delivery' ? 'Votre adresse complète' : 'Adresse (optionnel)'}
                  value={customer.address}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  required={serviceType === 'delivery'}
                />
              </label>
              <label>
                Note (étage, instructions, etc.)
                <textarea
                  placeholder="Ajoutez une précision (étage, extra fromage, instructions de livraison...)"
                  value={customer.note}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, note: e.target.value }))}
                />
              </label>
            </div>

            <button
              className="primary-btn full-width"
              disabled={
                cartLines.length === 0 ||
                !customer.name.trim() ||
                !customer.phone.trim() ||
                (serviceType === 'delivery' && !customer.address.trim())
              }
              onClick={handleSendOrder}
            >
              Envoyer la commande via WhatsApp
            </button>
          </aside>
        </section>
      ) : null}

      {optionsModal && optionsModal.item && (
        <div className="options-modal-overlay" onClick={() => setOptionsModal(null)}>
          <div className="options-modal" onClick={(e) => e.stopPropagation()}>
            <div className="options-modal-header">
              <h3>{optionsModal.item.name}</h3>
              <button className="close-btn" onClick={() => setOptionsModal(null)}>
                ×
              </button>
            </div>
            <div className="options-modal-content">
              <p className="options-modal-price">{formatPrice(optionsModal.item.price)}</p>
              <div className="options-list">
                <label className="option-toggle">
                  <input
                    type="checkbox"
                    checked={optionsModal.options.sauce}
                    onChange={(e) =>
                      setOptionsModal({
                        ...optionsModal,
                        options: { ...optionsModal.options, sauce: e.target.checked },
                      })
                    }
                  />
                  <span className="toggle-slider"></span>
                  <span className="option-label">Sauce</span>
                </label>
                <label className="option-toggle">
                  <input
                    type="checkbox"
                    checked={optionsModal.options.fries}
                    onChange={(e) =>
                      setOptionsModal({
                        ...optionsModal,
                        options: { ...optionsModal.options, fries: e.target.checked },
                      })
                    }
                  />
                  <span className="toggle-slider"></span>
                  <span className="option-label">Frites</span>
                </label>
              </div>
            </div>
            <div className="options-modal-footer">
              <button className="ghost-btn" onClick={() => setOptionsModal(null)}>
                Annuler
              </button>
              <button className="primary-btn" onClick={confirmAddToCart}>
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {showThankYou && (
        <div className="thank-you-overlay" onClick={() => setShowThankYou(false)}>
          <div className="thank-you-card" onClick={(e) => e.stopPropagation()}>
            <button className="thank-you-close" onClick={() => setShowThankYou(false)}>
              ×
            </button>
            <div className="thank-you-image">
              <img src="/pizza.jpg" alt="Pizza" />
            </div>
            <div className="thank-you-content">
              <h2>Merci pour votre commande !</h2>
              <p>Votre commande est en préparation, attendez un peu 😊</p>
              <p className="thank-you-subtitle">Nous vous contacterons bientôt sur WhatsApp</p>
            </div>
            <button className="primary-btn" onClick={() => setShowThankYou(false)}>
              Parfait !
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default App
