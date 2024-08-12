import { getDoc, Firestore, doc } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useDocument = <M>(
  firestore: Firestore,
  path: string,
  ...pathSegments: string[]
) => {
  const [data, setData] = useState<M | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDoc(doc(firestore, path, ...pathSegments))
      .then((doc) => setData({ _id: doc.id, ...doc.data() } as M))
      .catch(setError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
};
