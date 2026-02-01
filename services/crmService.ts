export interface Provider {
  id: number;
  name: string;
  company: string;
  tel: string;
  mail: string;
  website?: string;
  createdAt: string;
  type: 'Personnel' | 'Entreprise';
}

const CRM_STORAGE_KEY = 'capitalone_providers';

const initialProviders: Provider[] = [
  {
    "id": 1,
    "name": "Mounir Ben Said",
    "company": "SOTUMAG",
    "tel": "+216 71 850 100",
    "mail": "mounir.bs@sotumag.com.tn",
    "website": "www.sotumag.com.tn",
    "createdAt": "15/01/2026",
    "type": "Entreprise"
  },
  {
    "id": 2,
    "name": "Anis Dridi",
    "company": "COMET",
    "tel": "+216 71 448 555",
    "mail": "a.dridi@comet.com.tn",
    "website": "www.comet.com.tn",
    "createdAt": "20/01/2026",
    "type": "Entreprise"
  },
  {
    "id": 3,
    "name": "Feten Mansour",
    "company": "SIAME",
    "tel": "+216 72 390 110",
    "mail": "f.mansour@siame.com.tn",
    "website": "www.siame.com.tn",
    "createdAt": "02/02/2026",
    "type": "Entreprise"
  },
  {
    "id": 4,
    "name": "Walid Ammar",
    "company": "Poulina Group",
    "tel": "+216 71 137 000",
    "mail": "w.ammar@poulina.com.tn",
    "website": "www.poulinagroup.com",
    "createdAt": "10/12/2025",
    "type": "Entreprise"
  },
  {
    "id": 5,
    "name": "Ridha El Abed",
    "company": "STEG",
    "tel": "+216 71 330 100",
    "mail": "r.elabed@steg.com.tn",
    "website": "www.steg.com.tn",
    "createdAt": "05/01/2026",
    "type": "Entreprise"
  },
  {
    "id": 6,
    "name": "Ines Belhaj",
    "company": "SNCFT",
    "tel": "+216 71 345 511",
    "mail": "i.belhaj@sncft.com.tn",
    "website": "www.sncft.com.tn",
    "createdAt": "25/01/2026",
    "type": "Entreprise"
  },
  {
    "id": 7,
    "name": "Hamza Rezgui",
    "company": "TUNISIE CABLES",
    "tel": "+216 71 236 000",
    "mail": "h.rezgui@cables.com.tn",
    "website": "www.tunisie-cables.com",
    "createdAt": "18/01/2026",
    "type": "Entreprise"
  },
  {
    "id": 8,
    "name": "Sarra Kammoun",
    "company": "SOPAL",
    "tel": "+216 74 298 522",
    "mail": "s.kammoun@sopal.com",
    "website": "www.sopal.com",
    "createdAt": "12/01/2026",
    "type": "Entreprise"
  },
  {
    "id": 9,
    "name": "Khalil Zghal",
    "company": "AMS",
    "tel": "+216 73 231 433",
    "mail": "k.zghal@ams.com.tn",
    "website": "www.ams.com.tn",
    "createdAt": "28/12/2025",
    "type": "Entreprise"
  },
  {
    "id": 10,
    "name": "Mehdi Tounsi",
    "company": "ASSAD",
    "tel": "+216 71 433 211",
    "mail": "m.tounsi@assad.com.tn",
    "website": "www.assad.com.tn",
    "createdAt": "01/02/2026",
    "type": "Entreprise"
  }
];

export const getProviders = (): Provider[] => {
  const data = localStorage.getItem(CRM_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(initialProviders));
    return initialProviders;
  }
  return JSON.parse(data);
};

export const saveProviders = (providers: Provider[]) => {
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(providers));
};

export const addProvider = (provider: Omit<Provider, 'id' | 'createdAt'>): Provider => {
  const providers = getProviders();
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  const newProvider: Provider = {
    ...provider,
    id: providers.length > 0 ? Math.max(...providers.map(p => p.id)) + 1 : 1,
    createdAt: dateStr,
  };
  const updated = [newProvider, ...providers];
  saveProviders(updated);
  return newProvider;
};