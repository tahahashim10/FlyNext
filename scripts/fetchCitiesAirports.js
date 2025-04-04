import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Build URL for AFS API
const baseUrl = process.env.AFS_BASE_URL;
// Get API key
const apiKey = process.env.AFS_API_KEY;

if (!apiKey) {
    console.error("AFS API key is not configured");
    process.exit(1);
}

if (!baseUrl) {
    console.error("AFS Base URL is not configured");
    process.exit(1);
}

async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Fetching ${url}, Attempt ${attempt}`);
            const res = await fetch(url, options);
            
            if (!res.ok) {
                console.error(`HTTP Error: ${res.status} - ${res.statusText}`);
                if (attempt === maxRetries) {
                    throw new Error(`Failed to fetch after ${maxRetries} attempts`);
                }
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
                continue;
            }
            
            return await res.json();
        } catch (error) {
            console.error(`Fetch Error on attempt ${attempt}:`, error);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
        }
    }
}

async function fetchCities() {
    const url = new URL('/api/cities', baseUrl).toString();
    console.log(`Fetching Cities URL: ${url}`);
    return fetchWithRetry(url, { 
        headers: { 
            'x-api-key': apiKey,
            'Accept': 'application/json'
        } 
    });
}

async function fetchAirports() {
    const url = new URL('/api/airports', baseUrl).toString();
    console.log(`Fetching Airports URL: ${url}`);
    return fetchWithRetry(url, { 
        headers: { 
            'x-api-key': apiKey,
            'Accept': 'application/json'
        } 
    });
}

async function main() {
    try {
        // 1) Clear out existing city/airport records
        await prisma.city.deleteMany({});
        await prisma.airport.deleteMany({});

        // 2) Fetch from AFS
        console.log('Attempting to fetch cities and airports...');
        const citiesData = await fetchCities();     // Array of { city, country }
        const airportsData = await fetchAirports(); // Array of { id, code, name, city, country }

        console.log(`Fetched ${citiesData.length} cities and ${airportsData.length} airports`);

        // 3) Insert into the local DB
        await prisma.city.createMany({
            data: citiesData.map((c) => ({
                city: c.city,
                country: c.country
            })),
        });

        await prisma.airport.createMany({
            data: airportsData.map((a) => ({
                code: a.code,
                name: a.name,
                city: a.city,
                country: a.country,
            })),
        });

        console.log('Cities and airports fetched and stored locally.');
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

main()
    .catch((err) => {
        console.error('Unhandled error:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });