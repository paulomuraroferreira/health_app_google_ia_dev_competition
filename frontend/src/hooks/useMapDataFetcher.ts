import { useEffect, useState } from "react";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase-config";

export interface MapData {
  diseasesProbabilities: DocumentData;
  centroids: DocumentData;
}

const fetchMapData = async (): Promise<MapData> => {
  const geometricInfoResponse = await getDocs(
    query(collection(db, "geometric_info"))
  );
  const diseasesProbabilitiesResponse = await getDocs(
    query(
      collection(db, "diseases_probabilities_neighborhoods"),
      where("probability", ">", 0)
    )
  );

  const geometricInfo = geometricInfoResponse.docs.map((doc) => doc.data());
  const diseasesProbabilitiesData = diseasesProbabilitiesResponse.docs.map(
    (doc) => doc.data()
  );

  const diseasesProbabilities = diseasesProbabilitiesData.reduce(
    (acc, curr) => {
      if (!acc[curr.neighborhood]) {
        acc[curr.neighborhood] = [];
      }
      acc[curr.neighborhood].push({
        ...curr,
        probability_int: (curr.probability * 100).toFixed(2),
      });
      return acc;
    },
    {}
  );

  const centroids = geometricInfo.reduce((acc, curr) => {
    acc[curr.name] = {
      latitude: curr.centroid.lat,
      longitude: curr.centroid.lon,
      name: curr.name,
      radius_in_kilometers: curr.radius_in_kilometers,
    };

    acc[curr.name].color = "green";

    for (const disease of diseasesProbabilities[curr.name]) {
      if (disease.probability_int > 30 && disease.probability_int < 90) {
        acc[curr.name].color = "orange";
      }
      if (disease.probability_int >= 90) {
        acc[curr.name].color = "red";
        break;
      }
    }

    return acc;
  }, {});

  return { diseasesProbabilities, centroids };
};

const useMapDataFetcher = () => {
  const [data, setData] = useState<MapData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMapData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

export default useMapDataFetcher;
