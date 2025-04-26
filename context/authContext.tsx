import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getDocs, getDoc } from "firebase/firestore";
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await updateUserData(res.user.uid);
      return { success: true };
    } catch (error: any) {
      const msg = error?.message;
      return { success: false, msg };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(firestore, "users", res.user.uid), {
        name,
        email,
        uid: res.user.uid,
        image: null, // or empty if you like
      });

      await updateUserData(res.user.uid);
      return { success: true };
    } catch (error: any) {
      const msg = error?.message;
      return { success: false, msg };
    }
  };

  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();

        const userData: UserType = {
          uid: data.uid,
          email: data.email || null,
          name: data.name || null,
          image: data.image || null,
        };
        setUser(userData);
      }
    } catch (error) {
      console.log("Error updating user data:", error);
    }
  };

  const contextValue: AuthContextType ={
    user,
    setUser,
    login,
    register,
    updateUserData
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = ():AuthContextType => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be wrapped inside AuthProvider")
    }
    return context
}