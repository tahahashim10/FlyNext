import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/utils/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const airports = await prisma.airport.findMany();
    return NextResponse.json(airports, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching airports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
