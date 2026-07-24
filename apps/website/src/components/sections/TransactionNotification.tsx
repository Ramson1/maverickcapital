"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, X } from "lucide-react";
import Link from "next/link";

const firstNames = [
  // Western names
  "Victor", "Sarah", "James", "Emily", "Michael", "Lisa", "David", "Anna",
  "Robert", "Jennifer", "William", "Jessica", "Richard", "Mary", "Joseph",
  "Patricia", "Charles", "Linda", "Thomas", "Barbara", "Christopher", "Elizabeth",
  "Daniel", "Susan", "Matthew", "Margaret", "Anthony", "Dorothy", "Mark", "Karen",
  "Andrew", "Nancy", "Joshua", "Betty", "Kenneth", "Helen", "Kevin", "Sandra",
  "Brian", "Donna", "George", "Carol", "Edward", "Ruth", "Ronald", "Sharon",
  "Timothy", "Laura", "Jason", "Michelle", "Jeffrey", "Maria", "Ryan", "Deborah",
  // Hausa names
  "Aminu", "Fatima", "Musa", "Aisha", "Ibrahim", "Hafsat", "Sani", "Zainab",
  "Yusuf", "Halima", "Abubakar", "Maryam", "Umar", "Khadija", "Bello", "Safiya",
  "Nasiru", "Amina", "Danladi", "Hauwa", "Bala", "Rabi", "Suleiman", "Bintu",
  // Yoruba names
  "Ade", "Funke", "Tunde", "Bola", "Segun", "Yemi", "Kunle", "Ngozi",
  "Oluwaseun", "Ifeoma", "Chinedu", "Amaka", "Obinna", "Nkechi", "Emeka", "Chika",
  "Adebayo", "Omolara", "Taiwo", "Kehinde", "Femi", "Simi", "Wale", "Tope",
  // Igbo names
  "Chukwuemeka", "Adaeze", "Ikenna", "Chiamaka", "Eze", "Nneka", "Obiora", "Ugochi",
  "Chidi", "Ifeanyichukwu", "Ngozi", "Chinyere", "Kelechi", "Amara", "Tochukwu", "Nnenna",
  "Emeka", "Chidinma", "Chibuzor", "Onyeka", "Chikelu", "Nkiru", "Ikenna", "Chisom",
  // Efik names
  "Ekpenyong", "Ini", "Offiong", "Edet", "Archibong", "Ibanga", "Eyo", "Nsima",
  "Okon", "Effiong", "Ekong", "Ukpong", "Asuquo", "Etim", "Inyang", "Ekanem",
  // European names
  "Hans", "Greta", "Pierre", "Sophie", "Marco", "Isabella", "Lars", "Astrid",
  "Stefan", "Katarina", "Henrik", "Brigitte", "Alessandro", "Francesca", "Oliver", "Charlotte",
  "Sebastian", "Victoria", "Maximilian", "Elena", "Friedrich", "Anastasia", "Wolfgang", "Ludmila",
];

const lastNames = [
  "W.", "M.", "K.", "R.", "T.", "P.", "L.", "S.", "H.", "B.", "C.", "D.",
  "F.", "G.", "J.", "N.", "O.", "Q.", "V.", "X.", "Y.", "Z.", "A.", "E.",
];

const investmentTypes = [
  "invested in",
  "purchased",
  "started a portfolio with",
  "added funds to their account with",
];

function generateRandomTransaction() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const type = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
  
  // Generate random amount between 100 and 50,000 USDT
  const amount = Math.floor(Math.random() * (50000 - 100 + 1) + 100);
  const formattedAmount = amount.toLocaleString() + " USDT";
  
  return {
    name: `${firstName} ${lastName}`,
    amount: formattedAmount,
    type,
  };
}

export function TransactionNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [transaction, setTransaction] = useState(generateRandomTransaction());

  useEffect(() => {
    const showNotification = () => {
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);

        // Show next notification after random delay (3-15 seconds)
        const randomDelay = Math.random() * (15000 - 3000) + 3000;
        setTimeout(() => {
          setTransaction(generateRandomTransaction());
          showNotification();
        }, randomDelay);
      }, 5000);
    };

    // Initial delay before first notification
    const initialDelay = Math.random() * (15000 - 3000) + 3000;
    const timeout = setTimeout(showNotification, initialDelay);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-sm rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-brand-100"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-900">
                  {transaction.name} {transaction.type} {transaction.amount}
                </p>
                <Link
                  href="/market"
                  className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View Stories →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
