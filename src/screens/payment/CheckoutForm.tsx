// import React, { useState } from "react";
// import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// const CheckoutForm = ({ price }: { price: number }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (event: any) => {
//     event.preventDefault();
  
//     if (!stripe || !elements) return;
//     setLoading(true);
  
//     try {
//       const response = await fetch("http://localhost:8082/api/v1/auth/create-payment-intent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ priceId: "price_1Qslz6CYFVrZvUk07xpGzAqh" }),
//       });
  
//       const { clientSecret } = await response.json();
  
//       const cardElement = elements.getElement(CardElement);
//       if (!cardElement) {
//         console.error("CardElement not found");
//         return;
//       }
  
//       const result = await stripe.confirmCardPayment(clientSecret, {
//         payment_method: { card: cardElement },
//       });
  
//       if (result.error) {
//         console.error(result.error.message);
//       } else {
//         console.log("Payment successful!", result.paymentIntent);
//       }
//     } catch (error) {
//       console.error("Payment failed:", error);
//     }
  
//     setLoading(false);
//   };
  
  

  
//   return (
//     <form onSubmit={handleSubmit} className="mt-4">
//       <CardElement className="p-2 border border-gray-300 rounded-md" />
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       <button
//         type="submit"
//         disabled={!stripe || loading}
//         className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-md disabled:opacity-50"
//       >
//         {loading ? "Processing..." : "Confirm Payment"}
//       </button>
//     </form>
//   );
// };

// export default CheckoutForm;
