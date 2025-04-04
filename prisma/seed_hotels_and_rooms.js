import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

// Cities data based on the airline locations from airlines.js
const cities = [
  { city: "Dallas", country: "United States" },
  { city: "Atlanta", country: "United States" },
  { city: "Chicago", country: "United States" },
  { city: "Toronto", country: "Canada" },
  { city: "Frankfurt", country: "Germany" },
  { city: "London", country: "United Kingdom" },
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Doha", country: "Qatar" },
  { city: "Singapore", country: "Singapore" },
  { city: "Hong Kong", country: "China" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Paris", country: "France" },
  { city: "Tokyo", country: "Japan" },
  { city: "Sydney", country: "Australia" },
  { city: "Istanbul", country: "Turkey" },
  { city: "Zurich", country: "Switzerland" },
  { city: "Madrid", country: "Spain" },
  { city: "Moscow", country: "Russia" },
  { city: "Seoul", country: "South Korea" },
  { city: "Shanghai", country: "China" }
];

// Hotel names generator
const hotelChains = [
  "Grand", "Luxury", "Royal", "Elite", "Premium", 
  "Comfort", "Plaza", "Meridian", "Continental", "Imperial"
];

const hotelTypes = [
  "Hotel", "Suites", "Resort", "Inn", "Palace", 
  "Residences", "Lodge", "Boutique", "Towers", "Retreat"
];

// Room types
const roomTypes = [
  { name: "Standard Room", minPrice: 80, maxPrice: 150 },
  { name: "Deluxe Room", minPrice: 120, maxPrice: 220 },
  { name: "Premium Room", minPrice: 160, maxPrice: 300 },
  { name: "Junior Suite", minPrice: 200, maxPrice: 350 },
  { name: "Executive Suite", minPrice: 250, maxPrice: 450 },
  { name: "Presidential Suite", minPrice: 500, maxPrice: 1500 }
];

// Room amenities
const amenitiesList = [
  "Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Mini Bar", 
  "Coffee Machine", "In-room Safe", "Hairdryer", "Bathrobe", "Iron",
  "Work Desk", "Balcony", "City View", "Ocean View", "Garden View",
  "Room Service", "Jacuzzi", "King Size Bed", "Twin Beds"
];

// Hotel photos provided by the user
const hotelPhotos = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWH-Lzz92ZqEB0wPrhwjdhe-Flxf4AZHSpMw&s",
  "https://media.istockphoto.com/id/187363337/photo/modern-hotel-building-in-summer.jpg?s=612x612&w=0&k=20&c=eRVDcadZTKs5t2K-CEeXT6DiJQ68Fnbs6u9F-0S_v8Q=",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Capella%20Bangkok-exterior-new_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Raffles%20Singapore-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Atlantis%20The%20Royal-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Nihi%20Sumba-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpeg/Claridges-hero_W50BH24-profile.jpeg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Mandarin%20Oriental%20Bangkok-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Raffles%20London%20at%20The%20OWO-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Hotel%20de%20Crillon-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Hotel%20du%20Cap-Eden-Roc-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/The%20Lana-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Mount%20Nelson-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/OneOnly%20Mandarina-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Four%20Seasons%20Madrid-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Four%20Seasons%20at%20The%20Surf%20Club-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Le%20Bristol-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Gleneagles-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Castello%20di%20Reschio-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Sujan%20Jawai-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/The%20Connaught-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/Hotel%20Esencia-hero_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/The%20Brando-exterior_W50BH24-profile.jpg",
  "https://www.theworlds50best.com/hotels/filestore/jpg/The%20Tasman-hero_W50BH24-profile.jpg"
];

// Bedroom photos provided by the user
const bedroomPhotos = [
  "https://www.thespruce.com/thmb/zz6-ZvdoTeVLNNgU3mYaXiBbdeg=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/Blue-Bedroom-1-1f380dde8307444998c24d8a33a4dfb5.jpg",
  "https://www.thespruce.com/thmb/J8yidofMXHCbo9iIjNcojmkxNyQ=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/c3c900_3a1eab2ba5ae4dff94be57dc71099d8emv2_d_2800_2127_s_2-2ceecfd7328f4baba99a883ef2c973b2.jpeg",
  "https://www.thespruce.com/thmb/N5Es18Q7ZJABnIfA9o3PsxYnPpE=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/hickory-hill-home-6-ffa098747b95498b85c304220ffeb17c.jpg",
  "https://www.thespruce.com/thmb/mdvQxq1qp1kj61VTwD8UIb0osTk=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/hilliard-losaltos2-18-10-38-0d7fb954bf09431f92623fd5c66a016c.jpg",
  "https://www.thespruce.com/thmb/DSPiXsHFojJag1f5HYOfnNzHMv4=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/201105-MV-CandaceMaryLongfellow_133-1-d1427afe1e464975ade22adb6bec92f8.jpg",
  "https://www.thespruce.com/thmb/MoPGgV0YCIFOP9mlhzfSUKJrDSg=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/DesignbyEmilyHendersonDesignPhotographerbyTessaNeustadt_233-3bf82513a8b84ce89d0a48586e27c47d.jpeg",
  "https://www.thespruce.com/thmb/R5dUa90Rf1RtzCxfP0x0jealem8=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/0L5A0773_1-5f311e607db641d4bf761ebaa2bf740b.jpg",
  "https://www.thespruce.com/thmb/pepNP-uj8OMiHE0eI50HnptbrHU=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/modern_farmhouse_guest_home_-_marie_flanigan_interiors_2-7ef48e0331324213847ea23979ed4d3c.jpg",
  "https://www.thespruce.com/thmb/rzk2wJVM33bTq2WuQP536iM67nY=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/MichelleGerson-VictorianGlamourphotographerPatrickCline2-0676dcc6bc154f40bcf9c8d07e24d700.jpeg",
  "https://www.thespruce.com/thmb/ZiXw8LTID__nFruJTIBuVyBJ3Hk=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/LeAnne-03287-4c355756866b4d21ac891a8d4b3f5dbd-495e40ed07ca41bc875903e43a550b88.jpg"
];

// More bedroom photos to ensure we have enough for all rooms
const moreBedRoomPhotos = [
  "https://www.thespruce.com/thmb/V6xH-BAwow050HDKMxm-aAucEms=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/Mindy-Gayer-HIGH-REZ-159-e49bd6fcc37e4ea0bf52de857accd68c.jpg",
  "https://www.thespruce.com/thmb/95f9J5qZParwZyWhRDk81Lq1fR4=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/-HHJ3O1Q-376eca5fe1ce4b8fa691f8dbde5ba219.jpeg",
  "https://www.thespruce.com/thmb/qxSNQnn5b9ISYAaJi5rNsgjSlzM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/SM_4934K-7ef383a56bb34ee9af00b688e1866300-21859538ee35488d84de1695be276a59.jpg",
  "https://www.thespruce.com/thmb/5JkBDVFlrMZ4_iKfU32YOxNGiQM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/TheLeoCottage-27-0ed95026adda4b5a91370a69f0a6b487.jpg",
  "https://www.thespruce.com/thmb/AmUaTL7IakBxw3i4j8ZBZeyUOmU=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/18.-Flatiron-Apartment-by-Chango--Co.---Master-Bedroom-Angle-View-54163bc9b03541729d2c9a0b87d63917.jpg",
  "https://www.thespruce.com/thmb/onowIc2uHj0HvV5bpguOqEFYJG0=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/JS_HenryRoseID_BeechSt_0002B-ea56c84306be42d3bb25af4a6afeebe6.jpeg",
  "https://www.thespruce.com/thmb/NkskInrstSTkBuE1tSu--kperrs=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/JouffroyDabbans-CarolineAndreoni-6a0c0e26362f4787a80bd60922f65110.jpeg",
  "https://www.thespruce.com/thmb/0f5zfIOMo6RdhCd3eZ-2J1pFMpw=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/33.UpstateFarmhousebyChangoCo.-MasterBedroomFire-df596985e41741ac9e878712ab70ba3e.jpg",
  "https://www.thespruce.com/thmb/gA7omGAGByac2Jgo69br-wovVzM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/ghislaine_vinas_soholoft_0075_bedroom-bab35c962d6d4f0d8de43151bfa15db1.jpg",
  "https://www.thespruce.com/thmb/9aykV88j3Wct0WV3MRPxnxdXmro=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/EmileAugier-CarolineAndreoni2-471ed37343e44d119dee5a6cede890cb.jpeg"
];

// All bedroom photos combined
const allBedroomPhotos = [...bedroomPhotos, ...moreBedRoomPhotos];

function generateHotelImages() {
  // Pick 5 random unique photos from hotelPhotos array
  const shuffled = [...hotelPhotos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

function generateRoomImages() {
  // Pick 3-4 random unique photos from allBedroomPhotos array
  const shuffled = [...allBedroomPhotos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 3); // 3-4 images
}

function generateRandomAmenities() {
  const shuffled = [...amenitiesList].sort(() => 0.5 - Math.random());
  const amenities = shuffled.slice(0, Math.floor(Math.random() * 8) + 5); // 5-12 amenities
  return amenities;
}

function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateRandomStarRating() {
  // Weighted towards 3-5 stars
  const weights = [0, 0, 0.1, 0.3, 0.4, 0.2]; // 0% for 0-2 stars, 10% for 3 stars, 30% for 4 stars, etc.
  const rand = Math.random();
  let sum = 0;
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (rand < sum) return i;
  }
  
  return 4; // Default to 4 stars
}

function generateRandomAddress(city) {
  const streetNumbers = [
    "123 Main Street", "456 Park Avenue", "789 Broadway", 
    "321 Ocean Drive", "654 Mountain View", "987 River Road",
    "741 Lake Street", "852 Central Avenue", "963 Grand Boulevard",
    "159 Sunset Drive", "357 Highland Avenue", "951 Harbor View"
  ];
  
  return `${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]}, ${city}`;
}

async function seed() {
  try {
    console.log('Starting seed process...');
    
    // Create 10 users
    const users = [];
    for (let i = 1; i <= 10; i++) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(`password${i}`, 10);
      
      const user = await prisma.user.create({
        data: {
          firstName: `User${i}`,
          lastName: `Lastname${i}`,
          email: `user${i}@example.com`,
          password: hashedPassword,
          profilePicture: `https://source.unsplash.com/300x300/?portrait,person,${i}`,
          phoneNumber: `+1555000${1000 + i}`,
          role: i <= 8 ? 'USER' : 'HOTEL_OWNER' // Make 2 hotel owners
        }
      });
      
      users.push(user);
      console.log(`Created user ${i} of 10`);
    }
    
    // Create 50 hotels (5 for each user)
    let hotelCount = 0;
    
    for (const user of users) {
      for (let i = 1; i <= 5; i++) {
        hotelCount++;
        
        // Pick a random city
        const cityIndex = Math.floor(Math.random() * cities.length);
        const city = cities[cityIndex];
        
        // Generate hotel name
        const hotelChain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
        const hotelType = hotelTypes[Math.floor(Math.random() * hotelTypes.length)];
        const hotelName = `${hotelChain} ${city.city} ${hotelType}`;
        
        // Create the hotel
        const hotel = await prisma.hotel.create({
          data: {
            ownerId: user.id,
            name: hotelName,
            logo: null, // No logo as requested
            address: generateRandomAddress(city.city),
            location: city.city,
            starRating: generateRandomStarRating(),
            images: generateHotelImages()
          }
        });
        
        console.log(`Created hotel ${hotelCount} of 50: ${hotelName}`);
        
        // Create 2 room types for each hotel
        const selectedRoomTypes = [];
        while (selectedRoomTypes.length < 2) {
          const randomRoomTypeIndex = Math.floor(Math.random() * roomTypes.length);
          const roomType = roomTypes[randomRoomTypeIndex];
          
          // Ensure we don't duplicate room types in the same hotel
          if (!selectedRoomTypes.includes(roomType.name)) {
            selectedRoomTypes.push(roomType.name);
            
            // Calculate random price within range
            const price = getRandomPrice(roomType.minPrice, roomType.maxPrice);
            
            // Create the room
            await prisma.room.create({
              data: {
                hotelId: hotel.id,
                name: roomType.name,
                amenities: generateRandomAmenities(),
                pricePerNight: price,
                images: generateRoomImages(),
                availableRooms: Math.floor(Math.random() * 10) + 5 // 5-14 rooms available
              }
            });
            
            console.log(`Created ${roomType.name} for ${hotelName}`);
          }
        }
      }
    }
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    console.error('Error in seed function:', error);
    process.exit(1);
  });