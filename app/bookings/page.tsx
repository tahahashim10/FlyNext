'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HotelSuggestionsPanel from '@/components/HotelSuggestionsPanel';
import RoomSuggestionsPanel from '@/components/RoomSuggestionsPanel';
import FlightSuggestionsPanel from '@/components/FlightSuggestionsPanel';
import CitySuggestionsDropdown from '@/components/CitySuggestionsDropdown';
import { Hotel, Plane, Calendar, User, Mail, CreditCard, Search, AlertTriangle, CheckCircle, RefreshCw, MapPin } from 'lucide-react';

export default function BookingFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-populate fields from query parameters if available.
  const preHotelId = searchParams.get('hotelId') || '';
  const preRoomId = searchParams.get('roomId') || '';
  const preCheckIn = searchParams.get('checkIn') || '';
  const preCheckOut = searchParams.get('checkOut') || '';
  const preFlightIds = searchParams.get('flightIds') || '';
  const preDestinationCity = searchParams.get('destinationCity') || '';

  const [bookingData, setBookingData] = useState({
    hotelId: preHotelId,
    roomId: preRoomId,
    checkIn: preCheckIn,
    checkOut: preCheckOut,
    destinationCity: preDestinationCity,
    departureCity: 'Toronto', // Default value for departure city
    flightIds: preFlightIds,
    firstName: '',
    lastName: '',
    email: '',
    passportNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  // Toggle suggestion panels
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [showFlightSuggestions, setShowFlightSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'hotel' | 'flight'>('hotel');
  
  // State for city autocomplete (for destinationCity)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCitySuggestionsFlightTab, setShowCitySuggestionsFlightTab] = useState(false);
  // New state for departure city autocomplete
  const [showDepartureCitySuggestions, setShowDepartureCitySuggestions] = useState(false);

  // When flightIds changes, prepopulate destinationCity from the flight's route
  useEffect(() => {
    async function fetchFlightDestination() {
      const trimmedIds = bookingData.flightIds.trim();
      // Optionally, only fetch when flight id is longer than a threshold (e.g., 8 characters)
      if (trimmedIds.length >= 8) {
        // Use the first flight id if there are multiple ids
        const flightId = trimmedIds.split(',')[0].trim();
        try {
          const res = await fetch(`/api/flights/${flightId}`);
          if (res.ok) {
            const flightData = await res.json();
            // Check that flightData and its destination exist before accessing city
            if (flightData && flightData.destination && flightData.destination.city) {
              setBookingData(prev => ({
                ...prev,
                destinationCity: flightData.destination.city,
              }));
            }
          } else {
            console.error("Failed to fetch flight destination", await res.text());
          }
        } catch (error) {
          console.error("Error fetching flight destination", error);
        }
      }
    }
    fetchFlightDestination();
  }, [bookingData.flightIds]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    
    // When hotel ID changes, check if we should show room suggestions
    if (e.target.name === 'hotelId') {
      if (e.target.value && bookingData.checkIn && bookingData.checkOut) {
        setShowRoomSuggestions(true);
      } else {
        setShowRoomSuggestions(false);
      }
    }
    
    // When destination city changes in hotel tab, show city suggestions
    if (e.target.name === 'destinationCity' && activeTab === 'hotel') {
      if (e.target.value.trim().length >= 2) {
        setShowCitySuggestions(true);
      } else {
        setShowCitySuggestions(false);
      }
    }
    
    // When destination city changes in flight tab, show city suggestions
    if (e.target.name === 'destinationCity' && activeTab === 'flight') {
      if (e.target.value.trim().length >= 2) {
        setShowCitySuggestionsFlightTab(true);
      } else {
        setShowCitySuggestionsFlightTab(false);
      }
    }

    // When departure city changes, show suggestions if input length >= 2
    if (e.target.name === 'departureCity') {
      if (e.target.value.trim().length >= 2) {
        setShowDepartureCitySuggestions(true);
      } else {
        setShowDepartureCitySuggestions(false);
      }
    }
  };

  const clearForm = () => {
    setBookingData({
      hotelId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      destinationCity: '',
      departureCity: 'Toronto',
      flightIds: '',
      firstName: '',
      lastName: '',
      email: '',
      passportNumber: ''
    });
  };

  // State to track if we're loading flight suggestions
  const [loadingFlights, setLoadingFlights] = useState(false);
  
  // Force set flight suggestions to true
  const forceShowFlightSuggestions = () => {
    console.log("Force showing flight suggestions");
    console.log("Hotel ID:", bookingData.hotelId);
    console.log("Check-in date:", bookingData.checkIn);
    console.log("Departure city:", bookingData.departureCity);
    
    // Set loading state for the button
    setLoadingFlights(true);
    
    // Show flight suggestions panel
    setShowFlightSuggestions(true);
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setLoadingFlights(false);
    }, 1000);
  };

  useEffect(() => {
    // If departure city is cleared, hide flight suggestions
    if (!bookingData.departureCity || bookingData.departureCity.trim() === '') {
      setShowFlightSuggestions(false);
    }
  }, [bookingData.departureCity]);

  // Toggle show room suggestions when relevant data changes
  useEffect(() => {
    if (bookingData.hotelId && bookingData.checkIn && bookingData.checkOut) {
      setShowRoomSuggestions(true);
    } else {
      setShowRoomSuggestions(false);
    }
  }, [bookingData.hotelId, bookingData.checkIn, bookingData.checkOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Build payload based on provided details.
    const payload: any = {};
    if (bookingData.hotelId && bookingData.roomId) {
      payload.hotelId = Number(bookingData.hotelId);
      payload.roomId = Number(bookingData.roomId);
      if (bookingData.checkIn && bookingData.checkOut) {
        payload.checkIn = bookingData.checkIn;
        payload.checkOut = bookingData.checkOut;
      }
    }
    if (bookingData.flightIds.trim() !== '') {
      payload.flightIds = bookingData.flightIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      payload.firstName = bookingData.firstName;
      payload.lastName = bookingData.lastName;
      payload.email = bookingData.email;
      payload.passportNumber = bookingData.passportNumber;
    }

    console.log("Booking payload:", payload);

    if (!payload.hotelId && !payload.flightIds) {
      setError('Please provide either hotel or flight booking details.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Error response:", data);
        setError(data.error || 'Failed to create booking');
        setLoading(false);
      } else {
        const data = await res.json();
        if (data.flightBooking && data.hotelBooking) {
          setSuccess('Bookings added to your cart!');
        } else if (data.flightBooking || data.hotelBooking) {
          setSuccess('Booking added to your cart!');
        } else {
          setError('Unexpected booking response');
          setLoading(false);
          return;
        }
        clearForm();
        setLoading(false);
        
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setError('Error creating booking');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section with background image */}
      <div className="relative h-[30vh] w-full bg-gradient-to-r from-secondary to-primary/40">
        <div className="absolute inset-0 bg-[url('/hero-booking.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
        <div className="container mx-auto h-full flex flex-col justify-center items-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Book Your Perfect Journey
          </h1>
          <p className="text-lg md:text-xl mt-4 text-center max-w-2xl">
            Create your custom travel itinerary with hotels and flights in one place
          </p>
        </div>
      </div>

      {/* Main content container that overlaps hero */}
      <div className="container mx-auto px-4 -mt-16 mb-10 relative z-25">
        <div className="bg-card shadow-lg rounded-xl overflow-visible">
          {/* Notification area */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-t-xl flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-100 text-green-800 rounded-t-xl flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('hotel')}
              className={`flex-1 py-4 text-center font-medium text-lg transition-colors flex items-center justify-center ${
                activeTab === 'hotel' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Hotel className="mr-2 h-5 w-5" />
              Hotel Booking
            </button>
            <button
              onClick={() => setActiveTab('flight')}
              className={`flex-1 py-4 text-center font-medium text-lg transition-colors flex items-center justify-center ${
                activeTab === 'flight' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Plane className="mr-2 h-5 w-5" />
              Flight Booking
            </button>
          </div>

          {/* Form area */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hotel Booking Section */}
              {activeTab === 'hotel' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium mb-1">Hotel ID</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <Hotel className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="number"
                          name="hotelId"
                          value={bookingData.hotelId}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          placeholder="Enter Hotel ID or search by destination"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                      {(!bookingData.hotelId || bookingData.hotelId === '') &&
                        bookingData.destinationCity.trim() !== '' &&
                        showHotelSuggestions && (
                          <div className="absolute z-50 w-full mt-1 bg-card dark:bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border">
                            <HotelSuggestionsPanel
                              query={bookingData.destinationCity}
                              onSelect={(selectedId) => {
                                setBookingData({ ...bookingData, hotelId: selectedId.toString() });
                                setShowHotelSuggestions(false);
                              }}
                            />
                          </div>
                        )}
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium mb-1">Room ID</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <CreditCard className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="number"
                          name="roomId"
                          value={bookingData.roomId}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          placeholder="Enter Room ID or select from available rooms"
                          style={{ paddingLeft: '2.5rem' }}
                          onClick={() => {
                            if (bookingData.hotelId && bookingData.checkIn && bookingData.checkOut) {
                              setShowRoomSuggestions(true);
                            }
                          }}
                        />
                      </div>
                      {bookingData.hotelId && showRoomSuggestions && (
                        <div className="absolute z-50 w-full mt-1 bg-card dark:bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border">
                          <RoomSuggestionsPanel
                            hotelId={Number(bookingData.hotelId)}
                            checkIn={bookingData.checkIn}
                            checkOut={bookingData.checkOut}
                            onSelect={(selectedRoomId) => {
                              setBookingData({ ...bookingData, roomId: selectedRoomId.toString() });
                              setShowRoomSuggestions(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-In</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <Calendar className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="date"
                          name="checkIn"
                          value={bookingData.checkIn}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-Out</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <Calendar className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="date"
                          name="checkOut"
                          value={bookingData.checkOut}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination City (for hotel suggestions)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <MapPin className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="text"
                          name="destinationCity"
                          placeholder="e.g. Vancouver"
                          value={bookingData.destinationCity}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          style={{ paddingLeft: '2.5rem' }}
                          onFocus={() => {
                            if (bookingData.destinationCity.trim().length >= 2) {
                              setShowCitySuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay hiding to allow click to register
                            setTimeout(() => setShowCitySuggestions(false), 200);
                          }}
                        />
                        <CitySuggestionsDropdown
                          query={bookingData.destinationCity}
                          visible={showCitySuggestions}
                          onSelect={(city) => {
                            setBookingData({ ...bookingData, destinationCity: city });
                            setShowCitySuggestions(false);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (bookingData.destinationCity.trim()) {
                            setShowHotelSuggestions(!showHotelSuggestions);
                          }
                        }}
                        className="btn-primary h-10 flex items-center justify-center px-4 cursor-pointer"
                        disabled={!bookingData.destinationCity.trim()}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Find Hotels
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/10 p-4 rounded-lg border border-border">
                    <div className="flex items-center mb-2">
                      <Plane className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-semibold">Need a flight to your hotel?</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <label className="block text-sm font-medium mb-1">Departure City</label>
                        <div className="relative">
                          <div className="relative flex items-center">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                              <Plane className="h-5 w-5 text-muted transform -rotate-45" />
                            </div>
                            <input
                              type="text"
                              name="departureCity"
                              placeholder="e.g. Toronto"
                              value={bookingData.departureCity}
                              onChange={handleChange}
                              onFocus={() => {
                                if (bookingData.departureCity.trim().length >= 2) {
                                  setShowDepartureCitySuggestions(true);
                                }
                              }}
                              onBlur={() => {
                                // Delay hiding to allow click on suggestion to register
                                setTimeout(() => setShowDepartureCitySuggestions(false), 200);
                              }}
                              className="input input-bordered w-full pl-16 focus:pl-16"
                              style={{ paddingLeft: '2.5rem' }}
                            />
                          </div>
                          {/* City suggestions dropdown for departure city */}
                          <CitySuggestionsDropdown
                            query={bookingData.departureCity}
                            visible={showDepartureCitySuggestions}
                            onSelect={(city) => {
                              setBookingData({ ...bookingData, departureCity: city });
                              setShowDepartureCitySuggestions(false);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={forceShowFlightSuggestions}
                          className="btn-primary h-10 flex items-center justify-center px-4 cursor-pointer"
                          disabled={loadingFlights}
                        >
                          {loadingFlights ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Searching...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Find Flights
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Always show flight suggestions when the flag is true */}
                    {showFlightSuggestions && (
                      <div className="border border-border rounded-lg bg-card mt-4">
                        <FlightSuggestionsPanel
                          hotelId={Number(bookingData.hotelId) || 0}
                          suggestedDate={bookingData.checkIn || ''}
                          departureCity={bookingData.departureCity}
                          onSelect={(selectedFlightId) => {
                            setBookingData({ ...bookingData, flightIds: selectedFlightId });
                            setActiveTab('flight'); // Switch to flight tab when flight is selected
                            setShowFlightSuggestions(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Flight Booking Section */}
              {activeTab === 'flight' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Flight ID</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                        <Plane className="h-5 w-5 text-muted" />
                      </div>
                      <input
                        type="text"
                        name="flightIds"
                        placeholder="Enter Flight ID"
                        value={bookingData.flightIds}
                        onChange={handleChange}
                        className="input input-bordered w-full pl-16 focus:pl-16"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <User className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={bookingData.firstName}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          placeholder="First Name"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <User className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          value={bookingData.lastName}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          placeholder="Last Name"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <Mail className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={bookingData.email}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          placeholder="email@example.com"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Passport Number</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                          <CreditCard className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="text"
                          name="passportNumber"
                          value={bookingData.passportNumber}
                          onChange={handleChange}
                          className="input input-bordered w-full pl-16 focus:pl-16"
                          placeholder="Passport Number"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/10 p-4 rounded-lg border border-border">
                    <div className="flex items-center mb-2">
                      <Hotel className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-semibold">Need a hotel at your destination?</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Destination City</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none z-10">
                            <MapPin className="h-5 w-5 text-muted" />
                          </div>
                          <input
                            type="text"
                            name="destinationCity"
                            placeholder="e.g. Vancouver"
                            value={bookingData.destinationCity}
                            onChange={handleChange}
                            className="input input-bordered w-full pl-16 focus:pl-16"
                            style={{ paddingLeft: '2.5rem' }}
                            onFocus={() => {
                              if (bookingData.destinationCity.trim().length >= 2) {
                                setShowCitySuggestionsFlightTab(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay hiding to allow click to register
                              setTimeout(() => setShowCitySuggestionsFlightTab(false), 200);
                            }}
                          />
                          <CitySuggestionsDropdown
                            query={bookingData.destinationCity}
                            visible={showCitySuggestionsFlightTab}
                            onSelect={(city) => {
                              setBookingData({ ...bookingData, destinationCity: city });
                              setShowCitySuggestionsFlightTab(false);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (bookingData.destinationCity.trim()) {
                              setShowHotelSuggestions(!showHotelSuggestions);
                            }
                          }}
                          className="btn-primary h-10 flex items-center justify-center px-4 cursor-pointer"
                          disabled={!bookingData.destinationCity.trim()}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Find Hotels
                        </button>
                      </div>
                      
                      {bookingData.destinationCity.trim() !== '' && showHotelSuggestions && (
                        <div className="border border-border rounded-lg bg-card mt-2">
                          <HotelSuggestionsPanel
                            query={bookingData.destinationCity}
                            onSelect={(selectedId) => {
                              setBookingData({ ...bookingData, hotelId: selectedId.toString() });
                              setActiveTab('hotel'); // Switch to hotel tab
                              setShowHotelSuggestions(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-4 border-t border-border">
                <button 
                  type="submit" 
                  className="btn-primary w-full h-12 flex items-center justify-center text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Processing Booking...
                    </>
                  ) : (
                    <>
                      Complete Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Benefits of Booking with FlyNext</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
            <p className="text-muted">Find a lower price? We'll match it and give you an additional discount.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
            <p className="text-muted">Your payment and personal information are always protected with us.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:shadow-card transition-shadow">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-muted">Our friendly customer service team is available around the clock to help you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
