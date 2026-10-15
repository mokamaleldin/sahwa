export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  image: string;
}

const destination = 'Silahtarağa Merkez Cami, Emniyettepe, 34060 Eyüpsultan/İstanbul';

export const LIBRARY_LOCATION = {
  name: 'Silahtarağa Merkez Cami',
  description: 'المسجد المقابل لجامعة بيلجي — الطابق العلوي',
  address: 'Emniyettepe, 34060 Eyüpsultan/İstanbul',
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
};
