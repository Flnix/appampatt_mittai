import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import qrcode from "../Images/QRCode.png";
import greenTick from "../Images/greenTick.gif"; // Add your green tick GIF here
import greenTickStatic from "../Images/greenTickStatic.png"; // Static image of the tick
import "./Stylings/PaymentOverlay.css";

export default function PaymentOverlay({ onClose, OrderDetails, totalPrice, cartItems }) {
  const [upiId] = useState("6369715501-b7bb@axl");
  const [token, setToken] = useState("");
  const [paymentDone, setPaymentDone] = useState(false); // Track payment status
  const [showStaticTick, setShowStaticTick] = useState(false); // Toggle static image

  useEffect(() => {
    // Generate a random token
    const generateToken = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    setToken(generateToken());
  
    // Prevent background scrolling when overlay is open
    document.body.classList.add("overlay-active");
  
    // Clean up when the overlay is closed
    return () => {
      document.body.classList.remove("overlay-active");
    };
  }, []);
  

  const handlePaymentDone = async () => {
    setPaymentDone(true);

    // Switch to static tick after the GIF finishes (e.g., 3 seconds)
    setTimeout(() => setShowStaticTick(true), 1540);

    const payload = {
      ...OrderDetails,
      Token: token,
      AmountPaid: totalPrice.toFixed(2),
      OrderedItems: cartItems.map((item) => ({
        ProductName: item.product.dname,
        Quantity: item.quantity,
      })),
    };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxBS7fM5ZT1ssX4q4rImFS8mWBZC0BR21uRg3CBP8M3_407jnRSbVbIC5tLGMgvG14Gwg/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          mode: "no-cors", // Allow the fetch to follow redirects
        }
      );
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Error submitting details. Please try again.");
      setPaymentDone(false); // If there was an error, reset the state
    }
  };

  return (
    <div className="overlay-container">
      <div className="overlay">
        <div className="payment-modal">
          {paymentDone ? (
            // Show green tick and payment message after payment is done
            <div className="payment-success-container text-center">
              {showStaticTick ? (
                <img
                  src={greenTickStatic}
                  alt="Payment Successful"
                  className="green-tick"
                />
              ) : (
                <img
                  src={greenTick}
                  alt="Payment Successful"
                  className="green-tick"
                />
              )}
              <h4 className="mt-3 text-success">Payment Done</h4>
              <p className="mt-2 text-center">
                Payment is in the verification process. You'll be notified via your Email ID. Thank you!
              </p>
            </div>
          ) : (
            // Show initial payment details overlay
            <>
              <h4>Scan QR or Use the Details Below</h4>

              <div className="qr-placeholder">
            <img src={qrcode} alt="QR Code" />
          </div>
              <h4>Total Price : ₹{totalPrice.toFixed(2)}</h4> {/* Display the total price */}

              <Form.Group className="mb-3">
                <Form.Label>UPI ID</Form.Label>
                <div className="d-flex">
                  <Form.Control type="text" value={upiId} readOnly />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => navigator.clipboard.writeText(upiId)}
                  >
                    Copy
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Token</Form.Label>
                <div className="d-flex">
                  <Form.Control type="text" value={token} readOnly />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => navigator.clipboard.writeText(token)}
                  >
                    Copy
                  </Button>
                </div>
              </Form.Group>

              <div className="alert alert-warning mt-3">
                <strong>Note:</strong> Please copy the token and include it in the payment reference or remarks section while making the payment. This will help us verify your transaction faster.
              </div>

              <div className="buttons-container">
  <Button
    variant="warning"
    className="me-2"
    onClick={handlePaymentDone}
    disabled={paymentDone} // Disable the button if payment is done
  >
    {paymentDone ? "Payment in Process..." : "Payment Done"}
  </Button>

  <Button variant="dark" onClick={onClose}>
    Close
  </Button>
</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}