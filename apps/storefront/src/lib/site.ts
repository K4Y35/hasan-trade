export const SITE = {
  name: 'Hasan Trade Electronics',
  phone: '+8801711166522',
  phoneHref: 'tel:+8801711166522',
  customerCare: '+8801611166522',
  customerCareHref: 'tel:+8801611166522',
  whatsapp: 'https://wa.me/+8801711166522',
  emails: ['hasantradeelectronics2014@gmail.com', 'htesyl2014@gmail.com', 'mdkamrulhasan145@gmail.com'],
  address: 'Ali Tower, Tamabil Road, Mirabazar, Sylhet Sadar-3100',
  hours: 'Saturday to Thursday: 9.00am to 10.00pm',
  maps: {
    lat: 24.8951079,
    lng: 91.8801194,
    photo: '/samples/showroom.jpg',
    href: 'https://www.google.com/maps/place/HASAN+TRADE+ELECTRONICS/@24.8951079,91.8801194,17z/data=!3m1!4b1!4m6!3m5!1s0x375055baee6bce5f:0xd44932de7372c922!8m2!3d24.8951079!4d91.8801194!16s%2Fg%2F11r8tnzsw3',
    embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.9!2d91.8801194!3d24.8951079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375055baee6bce5f%3A0xd44932de7372c922!2sHASAN%20TRADE%20ELECTRONICS!5e0!3m2!1sen!2sbd!4v1720000000000!5m2!1sen!2sbd',
  },
  about: [
    'Hasan Trade Electronics is one of the best electronics, electrical, and home appliance brands, with one of the largest and most trusted online and offline shops in Bangladesh. We have a large number of satisfied customers across the country under the banner of Hasan Trade Electronics.',
    'Hasan Trade Electronics is dedicated to building a more advanced society by providing a wide range of electronic products, including air conditioners, air conditioner spare parts, refrigerators and freezers, CCTV cameras, generators, televisions, monitors, home appliances, kitchen appliances, accessories, and gadgets.',
    'Hasan Trade Electronics is here to help you choose the right brand of smart accessories within your budget.',
  ],
};

export const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/mdkamrulhasan145' },
  { label: 'LinkedIn', href: 'http://www.linkedin.com/in/md-kamrul-hasan-b7a665102' },
  { label: 'Instagram', href: 'http://instagram.com/mdkamrulhasan8456' },
  { label: 'YouTube', href: 'https://www.youtube.com/@htesyl' },
  { label: 'WhatsApp', href: SITE.whatsapp },
];

export type NavNode = { label: string; href: string; children?: NavNode[] };

function shop(category?: string, q?: string, brand?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (brand) params.set('brand', brand);
  if (q) params.set('q', q);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

const ac = 'air-conditioner';
const fridge = 'refrigerator-and-freezer';
const camera = 'camera';
const kitchen = 'kitchen-appliances';
const wash = 'washing-machine';
const fan = 'fan-and-cooler';
const small = 'small-appliances';
const gen = 'generator';
const tv = 'television';
const spare = 'ac-spare-parts';

export const NAV: NavNode[] = [
  {
    label: 'Air Conditioner',
    href: shop(ac),
    children: [
      {
        label: 'Split Wall Mounted',
        href: shop(ac, 'split'),
        children: [
          { label: 'GREE', href: shop(ac, undefined, 'gree') },
          { label: 'HAIKO', href: shop(ac, 'HAIKO') },
          { label: 'GENERAL', href: shop(ac, 'General') },
          { label: 'MIDEA', href: shop(ac, 'Midea') },
          { label: 'ELITE', href: shop(ac, 'Elite') },
          { label: 'Haier', href: shop(ac, undefined, 'haier') },
          { label: 'VIOMI Brand', href: shop(ac, 'VIOMI') },
          { label: 'GREEN AIRE', href: shop(ac, 'GREEN AIRE') },
          { label: 'Safe', href: shop(ac, 'Safe') },
        ],
      },
      {
        label: 'Portable',
        href: shop(ac, 'portable'),
        children: [
          { label: 'Gree Brand Portable Air-Conditioner', href: shop(ac, 'portable gree') },
          { label: 'Midea Brand Portable Air-Conditioner', href: shop(ac, 'portable midea') },
        ],
      },
      {
        label: 'Ceiling',
        href: shop(ac, 'ceiling'),
        children: [
          { label: 'GREE Brand', href: shop(ac, 'ceiling gree') },
          { label: 'MIDEA Brand', href: shop(ac, 'ceiling midea') },
          { label: 'GENERAL Brand', href: shop(ac, 'ceiling general') },
        ],
      },
      {
        label: 'Cassette',
        href: shop(ac, 'cassette'),
        children: [
          { label: 'Gree Brand', href: shop(ac, 'cassette gree') },
          { label: 'Midea Brand', href: shop(ac, 'cassette midea') },
          { label: 'General Brand', href: shop(ac, 'cassette general') },
        ],
      },
      {
        label: 'Floor Standing',
        href: shop(ac, 'floor'),
        children: [
          { label: 'Gree Brand', href: shop(ac, 'floor gree') },
          { label: 'Midea Brand', href: shop(ac, 'floor midea') },
        ],
      },
      {
        label: 'Ducted Split',
        href: shop(ac, 'duct'),
        children: [
          { label: 'Gree brand Duct Type', href: shop(ac, 'duct gree') },
          { label: 'Midea Brand Duct Type', href: shop(ac, 'duct midea') },
        ],
      },
      { label: 'Multi VRF', href: shop(ac, 'VRF') },
      { label: 'Chiller', href: shop(ac, 'chiller') },
    ],
  },
  { label: 'Air-Conditioner Spare Parts', href: shop(spare) },
  {
    label: 'Refrigerator & Freezer',
    href: shop(fridge),
    children: [
      { label: 'KONKA Refrigerator', href: shop(fridge, undefined, 'konka') },
      { label: 'KONKA Chiller Fridge', href: shop(fridge, 'chiller') },
      { label: 'KONKA Chest freezer', href: shop(fridge, 'chest freezer') },
      { label: 'HAIKO Refrigerator', href: shop(fridge, 'HAIKO') },
      { label: 'HAIKO Chest Freezer', href: shop(fridge, 'HAIKO chest') },
      { label: 'Side by Side', href: shop(fridge, 'side by side') },
    ],
  },
  {
    label: 'Camera',
    href: shop(camera),
    children: [
      {
        label: 'HDCVI Camera',
        href: shop(camera, 'HDCVI'),
        children: [
          { label: 'Bullet', href: shop(camera, 'HDCVI bullet') },
          { label: 'Dome', href: shop(camera, 'HDCVI dome') },
          { label: 'Fisheye', href: shop(camera, 'HDCVI fisheye') },
        ],
      },
      {
        label: 'IP Camera',
        href: shop(camera, 'IP Camera'),
        children: [
          { label: 'Bullet', href: shop(camera, 'IP bullet') },
          { label: 'Dome', href: shop(camera, 'IP dome') },
          { label: 'Fisheye', href: shop(camera, 'IP fisheye') },
          { label: 'PTZ', href: shop(camera, 'PTZ') },
        ],
      },
      { label: 'Wifi Camera', href: shop(camera, 'wifi') },
      { label: 'Network Video Recorder(NVR)', href: shop(camera, 'NVR') },
      { label: 'Digital Video Recorder(DVR)', href: shop(camera, 'DVR') },
      { label: 'Camera Accessories', href: shop(camera, 'accessories') },
    ],
  },
  {
    label: 'Fan & Cooler',
    href: shop(fan),
    children: [
      { label: 'Air Circulator Fan', href: shop(fan, 'circulator') },
      { label: 'Ceiling Fan', href: shop(fan, 'ceiling') },
      { label: 'Air Cooler', href: shop(fan, 'cooler') },
      { label: 'Air Curtain', href: shop(fan, 'curtain') },
    ],
  },
  {
    label: 'Kitchen Appliances',
    href: shop(kitchen),
    children: [
      { label: 'Blender and Mixer', href: shop(kitchen, 'blender') },
      { label: 'Electric Kettle', href: shop(kitchen, 'kettle') },
      { label: 'Gas Stove', href: shop(kitchen, 'stove') },
      { label: 'Infrared Cooker', href: shop(kitchen, 'infrared') },
      { label: 'Microwave Oven', href: shop(kitchen, 'microwave') },
      { label: 'Pressure Cooker', href: shop(kitchen, 'pressure') },
      { label: 'Rice Cooker', href: shop(kitchen, 'rice') },
      { label: 'Water Dispenser', href: shop(kitchen, 'dispenser') },
      { label: 'KONKA KITCHEN HOOD', href: shop(kitchen, 'hood') },
    ],
  },
  {
    label: 'Washing Machine',
    href: shop(wash),
    children: [
      { label: 'Front Loading', href: shop(wash, 'front') },
      { label: 'Top Loading', href: shop(wash, 'top') },
      { label: 'Semi Auto', href: shop(wash, 'semi') },
    ],
  },
  {
    label: 'Generator',
    href: shop(gen),
    children: [
      { label: 'Perkins', href: shop(gen, undefined, 'perkins') },
      { label: 'Cummins', href: shop(gen, undefined, 'cummins') },
      { label: 'Ricardo', href: shop(gen, undefined, 'ricardo') },
      { label: 'Green Power', href: shop(gen, 'Green Power') },
    ],
  },
  { label: 'Transformer', href: shop('transformer') },
  { label: 'Accessories', href: shop('accessories') },
  {
    label: 'Small Appliances',
    href: shop(small),
    children: [
      { label: 'Air Purifier', href: shop(small, 'purifier') },
      { label: 'Dehumidifier', href: shop(small, 'dehumidifier') },
      { label: 'Electric Iron', href: shop(small, 'iron') },
      { label: 'Voltage Stabilizer', href: shop(small, 'stabilizer') },
    ],
  },
  {
    label: 'Television',
    href: shop(tv),
    children: [
      {
        label: 'Smart LED TV',
        href: shop(tv, 'smart'),
        children: [
          { label: 'Konka Brand Smart TV', href: shop(tv, undefined, 'konka') },
          { label: 'Xiaomi brand QLED TV', href: shop(tv, undefined, 'xiaomi') },
        ],
      },
      { label: 'Non Smart TV', href: shop(tv, 'led') },
    ],
  },
  {
    label: 'AC Servicing',
    href: '/services',
    children: [
      { label: 'Installation', href: '/services' },
      { label: 'Our Services', href: '/services' },
    ],
  },
  {
    label: 'About Us',
    href: '/about',
  },
  { label: 'Contact', href: '/contact' },
];

/** Nested product categories used by the shop filter, matching the live WooCommerce widget. */
export const SHOP_FILTER_TREE: NavNode[] = NAV.filter(
  (item) => !['AC Servicing', 'About Us', 'Contact'].includes(item.label),
).concat([{ label: 'Our Services', href: '/services' }]);

export const CATEGORY_LEADS: Record<string, string> = {
  'air-conditioner': 'Split, VRF & cassette',
  'ac-spare-parts': 'Compressors & pipes',
  'refrigerator-and-freezer': 'Deep & frost-free',
  camera: 'IP & HD night vision',
  'fan-and-cooler': 'Industrial & evaporative',
  'kitchen-appliances': 'Hoods, hobs & ovens',
  'washing-machine': 'Inverter front & top load',
  generator: '10kVA–1000kVA 3-phase',
  transformer: 'Substation & regulators',
  accessories: 'Stabilizers & hardware',
  'small-appliances': 'Everyday home electronics',
  television: '4K UHD & smart Android',
};

export const FOOTER_COLUMNS = [
  {
    title: 'Power & Cooling',
    links: [
      { label: 'Air Conditioners', href: shop(ac) },
      { label: 'AC Spare Parts', href: shop(spare) },
      { label: 'Diesel Generators', href: shop(gen) },
      { label: 'Transformers', href: shop('transformer') },
      { label: 'AC Installation', href: '/services' },
    ],
  },
  {
    title: 'Commercial Appliances',
    links: [
      { label: 'Refrigerators & Freezers', href: shop(fridge) },
      { label: 'CCTV Systems', href: shop(camera) },
      { label: 'Industrial Fans', href: shop(fan) },
      { label: 'Washing Machines', href: shop(wash) },
      { label: 'Kitchen Range', href: shop(kitchen) },
    ],
  },
  {
    title: 'Institutional Desk',
    links: [
      { label: 'Request a quote', href: '/contact' },
      { label: 'Warranty & claims', href: '/warranty' },
      { label: 'Showroom visit', href: '/contact' },
      { label: 'Corporate profile', href: '/about' },
      { label: 'Terms of sale', href: '/terms' },
    ],
  },
];

export const PARTNER_LOGOS = Array.from(
  { length: 9 },
  (_, i) => `/samples/partners/${[9, 10, 11, 12, 13, 15, 16, 17, 14][i]}.jpg`,
);

export const CLIENTS = [
  { src: '/samples/clients/1.jpg', name: 'Sylhet Imperial Hospital', kind: 'Healthcare' },
  { src: '/samples/clients/2.jpg', name: 'HGS', kind: 'Hospitality' },
  { src: '/samples/clients/3.jpg', name: 'Sylhet Women’s Medical College', kind: 'Education' },
  { src: '/samples/clients/4.jpg', name: 'Ibn Sina', kind: 'Healthcare' },
  { src: '/samples/clients/5.jpg', name: 'North East Medical College Hospital', kind: 'Healthcare' },
  { src: '/samples/clients/6.jpg', name: 'Sylhet Agricultural University', kind: 'Education' },
  { src: '/samples/clients/7.jpg', name: 'Grand Mostafa Hotel Ababil', kind: 'Hospitality' },
  { src: '/samples/clients/8.jpg', name: 'The Grand Mafi Hotel & Suites', kind: 'Hospitality' },
];

export const PAYMENT_LOGOS = [
  { src: '/samples/pay/bkash.png', alt: 'bKash' },
  { src: '/samples/pay/nagad.png', alt: 'Nagad' },
  { src: '/samples/pay/rocket.png', alt: 'Rocket' },
];
