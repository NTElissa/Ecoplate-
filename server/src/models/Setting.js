import mongoose from 'mongoose';

// One document holds all the editable text of the home page.
// Defaults come from the Ecoplate business plan and pitch deck.
const S = (def) => ({ type: String, default: def });

const settingSchema = new mongoose.Schema(
  {
    brand: {
      name: S('Ecoplate Organic Fertilizer'),
      tagline: S('Waste not, grow more.'),
      location: S('Karongi, Rwanda'),
    },
    hero: {
      eyebrow: S('Circular farming from Karongi'),
      title: S('Hotel food waste, turned into food for the soil.'),
      subtitle: S(
        'We collect sorted food waste from hotels, compost it with care, and bring it back to farmers as safe, affordable organic fertilizer.'
      ),
      image: S('/images/farmers-field.jpg'),
      primaryCta: S('Support our work'),
      secondaryCta: S('See how it works'),
    },
    about: {
      title: S('A small team with a simple loop'),
      body: S(
        'Ecoplate is a circular economy enterprise based in Karongi, Rwanda. Hotels produce a lot of food waste. Farmers struggle to find organic fertilizer they can afford. We connect the two. Sorted hotel food waste goes through a controlled composting process and comes out as nutrient-rich fertilizer for maize, vegetables and other crops.\n\nWe have a working prototype, we have run composting and drying trials, and local farmers have told us what they saw in their fields. The business is formally registered and our pilot production has started.'
      ),
      image: S('/images/worker-sorting.jpg'),
      secondImage: S('/images/farmers-hillside.jpg'),
    },
    mission: S(
      'To reduce food waste and improve soil health by producing affordable, safe, and locally made organic fertilizer.'
    ),
    vision: S(
      'To become a leading circular economy enterprise in Rwanda, connecting hospitality waste management with sustainable agriculture.'
    ),
    problem: {
      title: S('Two problems that belong together'),
      farmers: S(
        'Agriculture employs between 64.5% and 70% of Rwandans, yet most farmers struggle to find organic fertilizer. It is scarce and expensive, so many turn to chemical fertilizers that wear down the soil over time.'
      ),
      hotels: S(
        'Hotels throw away a lot of food every month. A 4 to 5 star hotel can produce 3 to 5 tons, and a 3 star or smaller hotel 1 to 2 tons. Disposal costs money and adds methane to the air, while good organic material goes to waste.'
      ),
      solution: S(
        'Ecoplate closes the loop: Hotels, then Ecoplate, then Farmers, then back to the hotels. Chemical-free, safe for the soil, and cheaper for everyone involved.'
      ),
    },
    contact: {
      phone: S('+250 784 358 995'),
      whatsapp: S('250784358995'),
      email: S('colleneishimwe@gmail.com'),
      address: S('Karongi, Western Province, Rwanda'),
      website: S('https://sites.google.com/view/ecoplate-rwanda'),
      hours: S(''),
    },
    donation: {
      title: S('Help us take Ecoplate to the next level'),
      intro: S(
        'Your gift goes straight into the pilot: lab testing, equipment, waste collection, packaging and getting the first bags to farmers.'
      ),
      momoNumber: S('0784 358 995'),
      momoName: S('Ecoplate'),
      instructions: S(
        'Send your gift by mobile money to the number shown, then add the reference code we give you after you submit this form. We confirm every gift by hand and write back to say thank you.'
      ),
      target: { type: Number, default: 0 },
      currency: S('RWF'),
      suggested: { type: [Number], default: [5000, 10000, 25000, 50000] },
      uses: {
        type: [String],
        default: [
          'Laboratory testing of fertilizer samples',
          'Equipment: compost bins, grinder, drying racks',
          'Waste collection containers and logistics',
          'Packaging, labels and branding',
          'Protective gear for our field team',
        ],
      },
    },
    social: {
      facebook: S(''),
      instagram: S(''),
      twitter: S(''),
      linkedin: S(''),
      youtube: S(''),
    },
    footer: {
      note: S('Waste not, grow more.'),
    },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model('Setting', settingSchema);
