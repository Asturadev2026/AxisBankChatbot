import "./axis.css";

export default function AxisBackground() {
  return (
    <div className="axis-bg">

      {/* TOP BAR */}
      <div className="topbar">
        <span>Skip to Main Content</span>
        <div className="top-actions">
          <span>English</span>
          <span>A-</span>
          <span>A</span>
          <span>A+</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="header">
        <div className="logo">AXIS BANK</div>
        <div className="nav">
          <span>Insta Services</span>
          <span>FAQs</span>
          <span>Deliverable Tracker</span>
          <span>Track Requests</span>
        </div>
      </div>

      {/* TITLE */}
      <div className="title">
        Axis Bank Support <span>DiL Se Open</span>
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <input placeholder="How may I help you?" />
      </div>

      {/* QUICK LINKS */}
      <div className="quick-links">
        <span>Download Credit Card Statement</span>
        <span>Balance in Savings Account</span>
        <span>IFSC Code</span>
        <span>Disputed Transaction</span>
      </div>

      {/* ===== LATEST UPDATES SECTION ===== */}
      <div className="latest-section">

        {/* LEFT SIDE */}
        <div className="latest-left">
          <h2>Latest</h2>
          <p>Updates</p>

          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* RIGHT SIDE CARDS */}
        <div className="latest-cards">

          {/* CARD 1 */}
<div className="latest-card">
  <img src="/cards/banner1.jpg" alt="" />
  <div className="card-text">
    Turn all your purchases into FLEXI EMI instantly
  </div>
</div>

{/* CARD 2 */}
<div className="latest-card">
  <img src="/cards/banner2.jpg" alt="" />
</div>

{/* CARD 3 */}
<div className="latest-card">
  <img src="/cards/banner3.jpg" alt="" />
  <div className="card-text">
    Support Website now available in 9 regional languages
  </div>
</div>

{/* CARD 4 */}
<div className="latest-card">
  <img src="/cards/banner4.jpg" alt="" />
  <div className="card-text">
    Master the art of securing yourself!
  </div>
</div>

        </div>
      </div>

    </div>
  );
}