const asOptions = (entries) => entries.map(([slug, name]) => ({ slug, name }));

export const fallbackReferenceData = {
  states: asOptions([
    ["andhra-pradesh", "Andhra Pradesh"], ["assam", "Assam"], ["bihar", "Bihar"],
    ["gujarat", "Gujarat"], ["karnataka", "Karnataka"], ["kerala", "Kerala"],
    ["maharashtra", "Maharashtra"], ["odisha", "Odisha"], ["punjab", "Punjab"],
    ["rajasthan", "Rajasthan"], ["tamil-nadu", "Tamil Nadu"], ["telangana", "Telangana"],
    ["west-bengal", "West Bengal"],
  ]),
  languages: asOptions([
    ["assamese", "Assamese"], ["bengali", "Bengali"], ["bhojpuri", "Bhojpuri"],
    ["english", "English"], ["gujarati", "Gujarati"], ["hindi", "Hindi"],
    ["kannada", "Kannada"], ["maithili", "Maithili"], ["malayalam", "Malayalam"],
    ["marathi", "Marathi"], ["odia", "Odia"], ["punjabi", "Punjabi"],
    ["rajasthani", "Rajasthani"], ["tamil", "Tamil"], ["telugu", "Telugu"], ["urdu", "Urdu"],
  ]),
  niches: asOptions([
    ["agriculture", "Agriculture"], ["beauty", "Beauty"], ["fitness", "Fitness"],
    ["food-culture", "Food & Culture"], ["home-living", "Home & Living"],
    ["lifestyle", "Lifestyle"], ["travel", "Travel"],
  ]),
  platforms: asOptions([
    ["facebook", "Facebook"], ["instagram", "Instagram"], ["josh", "Josh"], ["moj", "Moj"],
    ["pinterest", "Pinterest"], ["sharechat", "ShareChat"], ["snapchat", "Snapchat"],
    ["threads", "Threads"], ["whatsapp-channels", "WhatsApp Channels"], ["x", "X"],
    ["youtube", "YouTube"],
  ]),
};

export const availabilityOptions = asOptions([
  ["this_month", "Available this month"],
  ["two_weeks", "Available in 2 weeks"],
  ["next_month", "Available next month"],
  ["limited", "Limited availability"],
]);

export const fallbackFitWeights = [
  { factor: "quality", weight: 30 },
  { factor: "location", weight: 25 },
  { factor: "relevance", weight: 20 },
  { factor: "availability", weight: 10 },
  { factor: "budget", weight: 15 },
];
