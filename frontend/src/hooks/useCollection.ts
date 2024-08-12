import {
  Firestore,
  query,
  collection,
  getDocs,
  QueryConstraint,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const useCollection = <M>(
  firestore: Firestore,
  path: string,
  ...queryConstraints: QueryConstraint[]
) => {
  const [data, setData] = useState<M[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDocs(query(collection(firestore, path), ...queryConstraints))
      .then((snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ _id: doc.id, ...doc.data() } as M)
        );
        setData(data);
        setLoading(false);
      })
      .catch(setError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
};
