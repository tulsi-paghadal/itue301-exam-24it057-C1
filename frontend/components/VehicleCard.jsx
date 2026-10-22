
function VehicleCard({ model, type, pricePerDay, available, onBook }) {
  return (
    <article className="vehicle-card">
      <div className="car-art">🚘</div>
      <p className="eyebrow">{type}</p>
      <h3>{model}</h3>
      <p className="price">
        ₹{pricePerDay} <span>/ day</span>
      </p>

      {available ? (
        <button onClick={onBook}>Book Now</button>
      ) : (
        <span className="unavailable">Not Available</span>
      )}
    </article>
  );
}

export default VehicleCard;
