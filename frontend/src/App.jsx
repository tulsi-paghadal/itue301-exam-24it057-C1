
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import {
  lazy,
  Suspense,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import VehicleCard from "./components/VehicleCard";
import "./index.css";

const AuthContext = createContext(null);

const LazyAdminPanel = lazy(() => import("./pages/AdminPanel"));

function ProtectedRoute({ children }) {
  const { customer, token } = useContext(AuthContext);

  return customer && token
    ? children
    : <Navigate to="/" replace />;
}

function LoginPage() {
  const { setCustomer, setToken } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, licenseNumber }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.customer || !data.token) {
        throw new Error("The server returned an invalid login response.");
      }

      setCustomer(data.customer);
      setToken(data.token);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={login}>
        <p className="eyebrow">DRIVEEASY CAR RENTALS</p>
        <h1>Your next journey starts here.</h1>
        <p className="muted">
          Sign in using your registered customer details.
        </p>

        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="login-license">Driving license number</label>
        <input
          id="login-license"
          value={licenseNumber}
          onChange={(event) => setLicenseNumber(event.target.value)}
          placeholder="Enter license number"
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

function Navbar() {
  const { customer, setCustomer, setToken } = useContext(AuthContext);

  function logout() {
    setCustomer(null);
    setToken(null);
  }

  return (
    <header className="navbar">
      <Link className="brand" to={customer ? "/fleet" : "/"}>
        DriveEasy<span>.</span>
      </Link>

      <nav>
        <Link to="/fleet">Fleet</Link>
        <Link to="/my-bookings">My Bookings</Link>
        <Link to="/admin">Admin</Link>

        {customer ? (
          <button className="logout" onClick={logout}>
            Log out
          </button>
        ) : (
          <Link to="/">Login</Link>
        )}
      </nav>
    </header>
  );
}

function FleetPage() {
  const { token } = useContext(AuthContext);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selected, setSelected] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/vehicles"
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load vehicles.");
      }

      setVehicles(Array.isArray(data) ? data : data.vehicles || []);
    } catch (err) {
      setError(
        err.message ||
        "Could not load vehicles. Check the backend and MongoDB."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the fleet when the page mounts.
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Filter the already-fetched vehicles without another API request.
  const filteredVehicles =
    typeFilter === "All"
      ? vehicles
      : vehicles.filter(
          (vehicle) =>
            vehicle.type?.toLowerCase() === typeFilter.toLowerCase()
        );

  async function bookVehicle() {
    setMessage("");

    if (!selected) {
      setMessage("Please select a vehicle.");
      return;
    }

    if (!pickupDate || !returnDate || returnDate <= pickupDate) {
      setMessage("Choose a return date after the pickup date.");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vehicleId: selected._id,
            pickupDate,
            returnDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setMessage("Booking confirmed successfully!");
      setSelected(null);
      setPickupDate("");
      setReturnDate("");

      await loadVehicles();
    } catch (err) {
      setMessage(err.message || "Could not complete your booking.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <main className="page">
      <p className="eyebrow">FIND YOUR RIDE</p>
      <h1>Choose your next drive.</h1>
      <p className="muted">
        Comfort, freedom and the open road.
      </p>

      <label htmlFor="vehicle-type">Filter by vehicle type</label>
      <select
        id="vehicle-type"
        value={typeFilter}
        onChange={(event) => setTypeFilter(event.target.value)}
      >
        <option value="All">All</option>
        <option value="Hatchback">Hatchback</option>
        <option value="Sedan">Sedan</option>
        <option value="SUV">SUV</option>
      </select>

      {loading && <p>Loading vehicles...</p>}

      {error && (
        <div>
          <p className="error">{error}</p>
          <button onClick={loadVehicles}>Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="vehicle-grid">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                model={vehicle.model}
                type={vehicle.type}
                pricePerDay={vehicle.pricePerDay}
                available={vehicle.available}
                onBook={() => {
                  setSelected(vehicle);
                  setMessage("");
                }}
              />
            ))}
          </section>

          {filteredVehicles.length === 0 && (
            <p>No vehicles found for this type.</p>
          )}
        </>
      )}

      {selected && (
        <section className="booking-panel">
          <h2>Book {selected.model}</h2>

          <label htmlFor="pickup-date">Pickup date</label>
          <input
            id="pickup-date"
            type="date"
            min={new Date().toLocaleDateString("en-CA")}
            value={pickupDate}
            onChange={(event) => setPickupDate(event.target.value)}
            required
          />

          <label htmlFor="return-date">Return date</label>
          <input
            id="return-date"
            type="date"
            min={pickupDate || new Date().toLocaleDateString("en-CA")}
            value={returnDate}
            onChange={(event) => setReturnDate(event.target.value)}
            required
          />

          <button
            onClick={bookVehicle}
            disabled={bookingLoading || !selected.available}
          >
            {bookingLoading ? "Booking..." : "Confirm booking"}
          </button>

          <button
            className="secondary"
            onClick={() => setSelected(null)}
            disabled={bookingLoading}
          >
            Cancel
          </button>
        </section>
      )}

      {message && <p className="notice">{message}</p>}
    </main>
  );
}

function MyBookingsPage() {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/v1/bookings/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load bookings.");
        }

        if (!cancelled) {
          setBookings(
            Array.isArray(data) ? data : data.bookings || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load your bookings.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="page">
      <p className="eyebrow">YOUR JOURNEYS</p>
      <h1>My bookings</h1>

      {loading && <p>Loading your bookings...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p>No bookings yet.</p>
      )}

      {!loading && !error && (
        <section className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-row" key={booking._id}>
              <div>
                <h3>{booking.vehicleId?.model || "Vehicle"}</h3>
                <p>
                  {booking.pickupDate?.slice(0, 10)} →{" "}
                  {booking.returnDate?.slice(0, 10)}
                </p>
                <p className="muted">
                  Status: {booking.status}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function App() {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);

  return (
    <AuthContext.Provider
      value={{ customer, token, setCustomer, setToken }}
    >
      <BrowserRouter>
        <Navbar />

        <Suspense
          fallback={<main className="page">Loading admin panel...</main>}
        >
          <Routes>
            <Route
              path="/"
              element={
                customer && token
                  ? <Navigate to="/fleet" replace />
                  : <LoginPage />
              }
            />

            <Route
              path="/fleet"
              element={
                <ProtectedRoute>
                  <FleetPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <LazyAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
