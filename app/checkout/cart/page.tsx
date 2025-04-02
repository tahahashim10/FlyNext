'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Hotel, 
  Plane, 
  CreditCard, 
  ShoppingCart, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  DollarSign
} from "lucide-react";

interface HotelBooking {
  id: number;
  status: string;
  hotel: { name: string; location: string };
  room: { name: string; pricePerNight: number };
  checkIn: string;
  checkOut: string;
}

interface FlightBooking {
  id: number;
  status: string;
  flightIds: string[] | string;
  cost?: number;
}

interface BookingsResponse {
  hotelBookings: HotelBooking[];
  flightBookings: FlightBooking[];
}

interface SelectedBooking {
  id: number;
  type: "hotel" | "flight";
}

export default function CartPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingsResponse>({ hotelBookings: [], flightBookings: [] });
  const [selectedBookings, setSelectedBookings] = useState<SelectedBooking[]>([]);
  const [cardInfo, setCardInfo] = useState({ cardNumber: "", expiryMonth: "", expiryYear: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [hotelPage, setHotelPage] = useState(1);
  const [flightPage, setFlightPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch pending bookings.
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings/user", { credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to fetch bookings");
      } else {
        const data: BookingsResponse = await res.json();
        const pendingHotel = data.hotelBookings.filter((b) => b.status === "PENDING");
        const pendingFlight = data.flightBookings.filter((b) => b.status === "PENDING");
        setBookings({ hotelBookings: pendingHotel, flightBookings: pendingFlight });
      }
    } catch (err) {
      setError("Error fetching bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const toggleSelectBooking = (id: number, type: "hotel" | "flight") => {
    setSelectedBookings((prev) => {
      const exists = prev.find((b) => b.id === id && b.type === type);
      if (exists) {
        return prev.filter((b) => !(b.id === id && b.type === type));
      } else {
        return [...prev, { id, type }];
      }
    });
  };

  const computeHotelCost = (booking: HotelBooking): number => {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return booking.room.pricePerNight * nights;
  };

  const totalCost = selectedBookings.reduce((sum, sel) => {
    if (sel.type === "hotel") {
      const booking = bookings.hotelBookings.find((b) => b.id === sel.id);
      if (booking) {
        return sum + computeHotelCost(booking);
      }
    } else if (sel.type === "flight") {
      const booking = bookings.flightBookings.find((b) => b.id === sel.id);
      if (booking && booking.cost) {
        return sum + booking.cost;
      }
    }
    return sum;
  }, 0);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    setError("");
    if (selectedBookings.length === 0) {
      setError("Please select at least one booking to checkout.");
      return;
    }
    if (!cardInfo.cardNumber || !cardInfo.expiryMonth || !cardInfo.expiryYear) {
      setError("Please enter your payment details.");
      return;
    }
    setLoading(true);
    try {
      // Process each selected booking.
      for (const sel of selectedBookings) {
        const payload = {
          bookingId: sel.id,
          bookingType: sel.type,
          cardNumber: cardInfo.cardNumber,
          expiryMonth: Number(cardInfo.expiryMonth),
          expiryYear: Number(cardInfo.expiryYear),
        };
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(`Checkout failed for booking ${sel.id}: ${data.error || ""}`);
        }
      }
      // After checkout, encode the selected bookings payload to pass to the confirmation page.
      const invoicePayload = btoa(JSON.stringify(selectedBookings));
      // Navigate to the confirmation page.
      router.push(
        `/checkout/confirmation?invoicePayload=${encodeURIComponent(invoicePayload)}&totalCost=${totalCost.toFixed(2)}`
      );
    } catch (err: any) {
      setError(err.message || "Error during checkout");
    }
    setLoading(false);
  };

  // Pagination helper function
  const renderPagination = (
    totalItems: number, 
    currentPage: number, 
    setPage: (page: number) => void
  ) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Helper function to generate page range
    const getPageRange = () => {
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      const range = [];
      
      // Always show first page
      range.push(1);
      
      // Determine middle pages
      if (currentPage > 3 && currentPage < totalPages - 2) {
        // Add ellipsis if we're not near the start
        if (currentPage > 4) {
          range.push(-1); // -1 represents ellipsis
        }
        
        // Add pages around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        
        // Add ellipsis if we're not near the end
        if (currentPage < totalPages - 3) {
          range.push(-2); // -2 represents another possible ellipsis
        }
      } else {
        // Near start or end, show first few or last few pages
        if (currentPage <= 3) {
          range.push(2, 3, 4);
          range.push(-1); // ellipsis
        } else {
          range.push(-1); // ellipsis
          range.push(totalPages - 3, totalPages - 2, totalPages - 1);
        }
      }
      
      // Always show last page
      if (!range.includes(totalPages)) {
        range.push(totalPages);
      }
      
      return range;
    };
    
    return (
      <div className="flex justify-center items-center space-x-4 mt-6 min-h-[48px]">
        <button 
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="btn btn-ghost btn-sm disabled:opacity-50"
        >
          Previous
        </button>
        
        <div className="flex items-center space-x-3">
          {getPageRange().map((page, index) => {
            if (page === -1 || page === -2) {
              return (
                <span 
                  key={`ellipsis-${index}`} 
                  className="px-2 text-muted"
                >
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`btn btn-square btn-sm w-10 ${
                  currentPage === page 
                    ? 'btn-primary text-primary-content' 
                    : 'btn-ghost'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="btn btn-ghost btn-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  // Paginate bookings
  const paginatedHotelBookings = bookings.hotelBookings
    .slice((hotelPage - 1) * itemsPerPage, hotelPage * itemsPerPage);
  
  const paginatedFlightBookings = bookings.flightBookings
    .slice((flightPage - 1) * itemsPerPage, flightPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero-like header section */}
          <div className="relative mb-12 bg-gradient-to-r from-secondary to-primary/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-travel.jpg')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
            <div className="relative p-8 text-white flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Booking Cart</h1>
                <p className="mt-4 text-lg max-w-2xl">
                  Review and checkout your pending bookings
                </p>
              </div>
              <ShoppingCart className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          {/* Hotel Bookings Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Hotel className="h-6 w-6 mr-2 text-primary" />
              Hotel Bookings
            </h3>
            {bookings.hotelBookings.length === 0 ? (
              <div className="bg-background border border-border rounded-lg p-8 text-center">
                <Hotel className="h-16 w-16 mx-auto text-primary mb-4" />
                <p className="text-muted">No pending hotel bookings.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedHotelBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center bg-background border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      {/* Checkbox with custom styling */}
                      <label className="flex items-center cursor-pointer mr-4">
                        <input
                          type="checkbox"
                          checked={!!selectedBookings.find((sel) => sel.id === booking.id && sel.type === "hotel")}
                          onChange={() => toggleSelectBooking(booking.id, "hotel")}
                          className="hidden"
                        />
                        <span 
                          className={`
                            w-6 h-6 border-2 rounded 
                            ${selectedBookings.find((sel) => sel.id === booking.id && sel.type === "hotel") 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-gray-300'
                            }
                            flex items-center justify-center
                          `}
                        >
                          {selectedBookings.find((sel) => sel.id === booking.id && sel.type === "hotel") && '✓'}
                        </span>
                      </label>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-lg">{booking.hotel.name}</h4>
                            <p className="text-muted text-sm">{booking.room.name}</p>
                          </div>
                          <div className="flex items-center text-primary">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-bold">
                              {computeHotelCost(booking).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                          <div className="flex items-center text-muted">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>
                              {new Date(booking.checkIn).toLocaleDateString()} - 
                              {new Date(booking.checkOut).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination for Hotel Bookings */}
                {renderPagination(
                  bookings.hotelBookings.length, 
                  hotelPage, 
                  setHotelPage
                )}
              </>
            )}
          </div>

          {/* Flight Bookings Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Plane className="h-6 w-6 mr-2 text-primary" />
              Flight Bookings
            </h3>
            {bookings.flightBookings.length === 0 ? (
              <div className="bg-background border border-border rounded-lg p-8 text-center">
                <Plane className="h-16 w-16 mx-auto text-primary mb-4" />
                <p className="text-muted">No pending flight bookings.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedFlightBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center bg-background border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      {/* Checkbox with custom styling */}
                      <label className="flex items-center cursor-pointer mr-4">
                        <input
                          type="checkbox"
                          checked={!!selectedBookings.find((sel) => sel.id === booking.id && sel.type === "flight")}
                          onChange={() => toggleSelectBooking(booking.id, "flight")}
                          className="hidden"
                        />
                        <span 
                          className={`
                            w-6 h-6 border-2 rounded 
                            ${selectedBookings.find((sel) => sel.id === booking.id && sel.type === "flight") 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-gray-300'
                            }
                            flex items-center justify-center
                          `}
                        >
                          {selectedBookings.find((sel) => sel.id === booking.id && sel.type === "flight") && '✓'}
                        </span>
                      </label>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-lg">Flight Booking</h4>
                            <p className="text-muted text-sm">
                              {Array.isArray(booking.flightIds)
                                ? booking.flightIds.join(", ")
                                : booking.flightIds}
                            </p>
                          </div>
                          <div className="flex items-center text-primary">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-bold">
                              {booking.cost ? booking.cost.toFixed(2) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination for Flight Bookings */}
                {renderPagination(
                  bookings.flightBookings.length, 
                  flightPage, 
                  setFlightPage
                )}
              </>
            )}
          </div>

          {/* Total Cost Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-primary" />
              Total Cost
            </h3>
            <div className="text-3xl font-bold text-primary text-right flex items-center justify-end">
              <DollarSign className="h-8 w-8 mr-2" />
              {totalCost.toFixed(2)}
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-primary" />
              Payment Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Enter card number"
                  value={cardInfo.cardNumber}
                  onChange={handleCardChange}
                  className="input input-bordered w-full"
                  maxLength={16}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Expiry Month</label>
                  <input
                    type="number"
                    name="expiryMonth"
                    placeholder="MM"
                    value={cardInfo.expiryMonth}
                    onChange={handleCardChange}
                    className="input input-bordered w-full"
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Expiry Year</label>
                  <input
                    type="number"
                    name="expiryYear"
                    placeholder="YYYY"
                    value={cardInfo.expiryYear}
                    onChange={handleCardChange}
                    className="input input-bordered w-full"
                    min={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={handleCheckout} 
            className="btn btn-primary w-full flex items-center justify-center" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner mr-2"></span>
                Processing Checkout...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Checkout Selected Bookings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}