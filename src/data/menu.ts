export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: 'sandwich' | 'pizza'
  image: string
  badges?: string[]
  size?: string
}

export const menuItems: MenuItem[] = [
  {
    id: 'sandwich-chicken',
    name: 'Sandwich Libanais Poulet',
    description: 'Poulet mariné, crudités fraîches, sauce ail maison, pain pita grillé.',
    price: 11.5,
    category: 'sandwich',
    image: 'https://images.unsplash.com/photo-1604908177145-0ac1c9bb6466?auto=format&fit=crop&w=1200&q=80',
    badges: ['Best-seller', 'Grillé'],
  },
  {
    id: 'sandwich-beef',
    name: 'Sandwich Libanais Viande',
    description: 'Bœuf épicé, tomates, oignons caramélisés, sauce tahini citronnée.',
    price: 13,
    category: 'sandwich',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
    badges: ['Signature', 'Epice modérée'],
  },
  {
    id: 'sandwich-veggie',
    name: 'Sandwich Libanais Veggie',
    description: 'Falafel croustillant, pickles, menthe fraîche, sauce sésame.',
    price: 10,
    category: 'sandwich',
    image: 'https://images.unsplash.com/photo-1528838064669-8b5a7a7a7e9b?auto=format&fit=crop&w=1200&q=80',
    badges: ['Végétarien'],
  },
  {
    id: 'pizza-margherita',
    name: 'Pizza Margherita',
    description: 'Base tomate San Marzano, mozzarella fraîche, basilic, huile d’olive.',
    price: 18,
    category: 'pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    badges: ['Classique'],
  },
  {
    id: 'pizza-diavola',
    name: 'Pizza Diavola',
    description: 'Soubressade, mozzarella fior di latte, olives noires, piments doux.',
    price: 21,
    category: 'pizza',
    image: 'https://images.unsplash.com/photo-1548365328-9f5471392e99?auto=format&fit=crop&w=1200&q=80',
    badges: ['Epicée'],
  },
  {
    id: 'pizza-4fromages',
    name: 'Pizza 4 Fromages',
    description: 'Mozzarella, gorgonzola, parmesan, ricotta, pointe de miel.',
    price: 22,
    category: 'pizza',
    image: 'https://images.unsplash.com/photo-1548365328-8b30c9992833?auto=format&fit=crop&w=1200&q=80',
    badges: ['Gourmande'],
  },
]












