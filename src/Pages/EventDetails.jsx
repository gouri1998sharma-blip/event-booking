import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios
      .get(`https://event-booking-backend-a858.onrender.com/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!event)
    return (
      <p style={{ textAlign: "center", marginTop: "3rem" }}>
        Loading event details...
      </p>
    );

  // Safe Price Calculation
  const pricePerTicket = Number(event.ticketPrice) || Number(event.price) || 0;
  const calculatedTotal = Number(seats) * pricePerTicket;

  // Check if event is expired
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const isExpired = eventDate < today;

  // Open Payment Modal
  const openModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to book tickets.");
      return navigate("/login");
    }
    setShowPaymentModal(true);
  };

  // Process Booking after Payment Click (FIXED SAFE NaN PROTECTION)
  const handleFinalPayment = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("token");

    setTimeout(async () => {
      try {
        await axios.post(
          "https://event-booking-backend-a858.onrender.com/api/bookings",
          {
            eventId: id,
            seatsBooked: Number(seats),
            totalAmount: calculatedTotal, // Guaranteed Number
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setIsProcessing(false);
        setShowPaymentModal(false);
        setMessage("🎉 Payment Successful! Ticket Booked.");
        setTimeout(() => navigate("/dashboard"), 1500);
      } catch (err) {
        setIsProcessing(false);
        setError(err.response?.data?.message || "Booking failed.");
      }
    }, 1500);
  };

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "2rem auto",
        padding: "2rem",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        background: "#fff",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={
          event.bannerUrl ||
          "https://via.placeholder.com/750x300?text=Event+Banner"
        }
        alt={event.title}
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover",
          borderRadius: "8px",
        }}
      />

      <h1 style={{ marginTop: "1.5rem", color: "#0f172a" }}>{event.title}</h1>

      {/* DESCRIPTION */}
      <div
        style={{
          margin: "1.5rem 0",
          padding: "1rem 1.2rem",
          background: "#f8fafc",
          borderRadius: "8px",
          borderLeft: "4px solid #2563eb",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>
          About This Event
        </h3>
        <p
          style={{
            margin: 0,
            lineHeight: "1.7",
            color: "#334155",
            fontSize: "1rem",
          }}
        >
          {event.description}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          margin: "1.5rem 0",
          color: "#475569",
        }}
      >
        <p style={{ margin: 0 }}>
          📍 <strong>Venue:</strong> {event.venue}
        </p>
        <p style={{ margin: 0 }}>
          📅 <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
        </p>
        <p style={{ margin: 0 }}>
          ⏰ <strong>Time:</strong> {event.time}
        </p>
        <p style={{ margin: 0 }}>
          🎟️ <strong>Available Seats:</strong> {event.availableSeats}
        </p>
        <p style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
          💰 <strong>Price:</strong> ₹{pricePerTicket} / ticket
        </p>
      </div>

      <hr style={{ margin: "1.5rem 0", borderColor: "#f1f5f9" }} />

      {/* BOOKING CONTROLS */}
      {isExpired ? (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            background: "#fee2e2",
            borderRadius: "8px",
            color: "#991b1b",
            fontWeight: "bold",
          }}
        >
          ❌ Booking closed. This event date has already passed.
        </div>
      ) : user.role === "admin" ? (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            background: "#fef3c7",
            borderRadius: "8px",
            color: "#92400e",
            fontWeight: "bold",
          }}
        >
          ℹ️ You are logged in as an Admin. Log in with a regular user account
          to book tickets.
        </div>
      ) : (
        <div>
          <div
            style={{
              margin: "1rem 0",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <label style={{ fontWeight: "bold" }}>Select Seats: </label>
            <input
              type="number"
              min="1"
              max={event.availableSeats}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              style={{
                width: "80px",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              Total: ₹{calculatedTotal}
            </span>
          </div>

          {message && (
            <p
              style={{
                color: "#16a34a",
                fontWeight: "bold",
                margin: "0.5rem 0",
              }}
            >
              {message}
            </p>
          )}
          {error && (
            <p
              style={{
                color: "#ef4444",
                fontWeight: "bold",
                margin: "0.5rem 0",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={openModal}
            disabled={event.availableSeats < 1}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: event.availableSeats < 1 ? "#94a3b8" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: event.availableSeats < 1 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            {event.availableSeats < 1 ? "Sold Out" : "Proceed to Payment"}
          </button>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "90%",
              maxWidth: "420px",
              padding: "1.8rem",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              ✖
            </button>

            <h3
              style={{
                textAlign: "center",
                marginBottom: "1rem",
                color: "#0f172a",
              }}
            >
              💳 Payment Gateway
            </h3>

            <div
              style={{
                background: "#f8fafc",
                padding: "0.8rem",
                borderRadius: "6px",
                marginBottom: "1.2rem",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                Amount to Pay
              </p>
              <h2 style={{ margin: 0, color: "#16a34a" }}>
                ₹{calculatedTotal}
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                marginBottom: "1.5rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="pay"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                📱 UPI / GPay / PhonePe / Paytm
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="pay"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                💳 Credit / Debit Card
              </label>
            </div>

            {paymentMethod === "upi" && (
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=pay_to_event_${event._id}`}
                  alt="QR Code"
                  style={{ borderRadius: "6px" }}
                />
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginTop: "0.3rem",
                  }}
                >
                  Scan QR or click below to simulate payment
                </p>
              </div>
            )}

            <button
              onClick={handleFinalPayment}
              disabled={isProcessing}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: isProcessing ? "#94a3b8" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: isProcessing ? "not-allowed" : "pointer",
              }}
            >
              {isProcessing
                ? "🔄 Processing Payment..."
                : `Pay ₹${calculatedTotal} & Book`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
