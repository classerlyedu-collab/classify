import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";

const stripekey =
  process.env.REACT_APP_STRIPE_PUBLIC_KEY ;

const stripePromise = loadStripe(stripekey || "" );

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceId: string; // Price ID for the subscription
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  priceId,
}) => {
  const [showSecondModal, setShowSecondModal] = useState(false);
    const navigate = useNavigate();

  console.log(showSecondModal);

  const handelClose = () => {
    onClose();
    setShowSecondModal(false);
    // router.push("/check-in")
  };

  return (
    <>
      {isOpen && (
        <Elements stripe={stripePromise}>
          <StripePaymentModal
            priceId={priceId}
            onClose={onClose}
            onPaymentSuccess={() => {
              navigate(RouteName?.AUTH_SCREEN);
              
            }}
          />
        </Elements>
      )}
      
    </>
  );
};

export const StripePaymentModal: React.FC<{
  priceId: string;
  // endpoint: string;
  onClose: () => void;
  onPaymentSuccess: () => void;
}> = ({ priceId, onClose, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token")

  const handleSubscription = async () => {
    setLoading(true);
    try {  
      const response = await Post("/payment/create-payment-intent", { priceId }, "","" )

      const { clientSecret } = await response;

      console.log("client secret" + clientSecret)


      if (!stripe || !elements) {
        displayMessage("Stripe is not loaded properly.")
        setLoading(false);
        return;
      }

      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);

      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        displayMessage("One or more card elements are not loaded.")
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardNumberElement },
        }
      );

      if (error) {
        // toast.error(error.message || "Card setup confirmation failed.");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        displayMessage("Payment successful!")
        onPaymentSuccess();
        onClose(); // Close modal on successful payment
      } else {
        displayMessage("Card setup was not completed successfully.")
      }
    } catch (err: any) {
      console.log("error in payment")
      // toast.error(err?.response?.data?.message || "An error occurred.");
    } finally {
      // console.log("finally")
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-3xl border border-zinc-700 max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Process Payment</h2>
          <button onClick={onClose} className="text-black font-bold text-2xl">
            &times;
          </button>
        </div>
        <p className="text-sm text-gray-900 mb-4">Secure Stripe Payment</p>

        {/* Card Inputs */}
        <div className="space-y-4">
          <div>
            <label htmlFor="card-number" className="text-sm font-medium mb-1 text-gray-900">
              Card Number
            </label>
            <div className="bg-zinc-200 opacity-90 p-2 border border-zinc-600 rounded-lg">
              <CardNumberElement
                id="card-number"
                options={{
                  style: {
                    base: {
                      color: "black",
                      fontSize: "16px",
                      "::placeholder": { color: "#7c7c7c" },
                    },
                    invalid: { color: "#fa755a" },
                  },
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="card-expiry" className="text-sm font-medium mb-1 text-gray-900">
                Expiry
              </label>
              <div className="bg-zinc-200 opacity-90 p-2 border border-zinc-600 rounded-lg">
                <CardExpiryElement
                  id="card-expiry"
                  options={{
                    style: {
                      base: {
                        color: "black",
                        fontSize: "16px",
                        "::placeholder": { color: "#7c7c7c" },
                      },
                      invalid: { color: "#fa755a" },
                    },
                  }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="card-cvc" className="text-sm font-medium mb-1 text-gray-900">
                CVC
              </label>
              <div className="bg-zinc-200 opacity-90 p-2 border border-zinc-600 rounded-lg">
                <CardCvcElement
                  id="card-cvc"
                  options={{
                    style: {
                      base: {
                        color: "#fff",
                        fontSize: "16px",
                        "::placeholder": { color: "#7c7c7c" },
                      },
                      invalid: { color: "#fa755a" },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            className="px-10 w-full py-1 text-black font-bold rounded-full border-2 border-[#7c7c7c]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-10 w-full py-3 text-black bg-blue-700 border-2 border-gray-600 hover:scale-105  rounded-full font-bold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubscription}
            disabled={loading}
          >
            {loading ? "Processing..." : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
};



