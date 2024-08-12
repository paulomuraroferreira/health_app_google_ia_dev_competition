import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
  UserCredential,
} from "firebase/auth";
import { createContext, useEffect, useMemo, useState } from "react";
import { app } from "../../firebase-config";

export const AuthContext = createContext<{
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  getUser: () => User | null;
}>({
  currentUser: null,
  signUp: async () => {
    return {} as UserCredential;
  },
  signIn: async () => {
    return {} as UserCredential;
  },
  signOut: async () => {},
  getUser: () => null,
});

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return auth.signOut();
  };

  const getUser = () => {
    return auth.currentUser;
  };

  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    return {
      currentUser,
      signIn,
      signUp,
      signOut,
      getUser,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
