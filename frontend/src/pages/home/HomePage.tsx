import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import BoxContainer from "../../components/BoxContainer/BoxContainer";
import { useEffect, useMemo, useState } from "react";
import { DocumentData } from "firebase/firestore";
import { LeafletMouseEvent } from "leaflet";
import useMapDataFetcher from "../../hooks/useMapDataFetcher";
import { toast } from "react-toastify";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import MapMarker from "../../components/MapMarker/MapMarker";

type SelectedMarker = {
  name: string;
  diseases: DocumentData[];
};

const HomePage = () => {
  const mapData = useMapDataFetcher();
  const [selectedMarker, setSelectedMarker] = useState<
    SelectedMarker | undefined
  >(undefined);

  useEffect(() => {
    if (mapData.error) {
      toast.error("Failed to fetch data try again later");
    }
  }, [mapData.error]);

  const eventHandlers = useMemo(
    () => ({
      click(evt: LeafletMouseEvent) {
        const idx = evt.target.options.children as number;
        const name = mapData.data!.centroids[idx].name;
        const diseases = mapData.data!.diseasesProbabilities[idx];
        setSelectedMarker({ name, diseases });
      },
    }),
    [mapData.data]
  );

  const closeDrawer = () => setSelectedMarker(undefined);

  return (
    <BoxContainer>
      <Drawer
        open={!!selectedMarker}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ p: 1 }} minWidth={455}>
          <Grid container>
            <Grid item xs={10}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {selectedMarker?.name}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={closeDrawer}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Diseases
          </Typography>
          {selectedMarker?.diseases.map((data) => (
            <Grid container key={data.disease}>
              <Grid item xs={10}>
                {data.disease}
              </Grid>
              <Grid item xs={2}>
                {data.probability_int}%
              </Grid>
            </Grid>
          ))}
        </Box>
      </Drawer>

      <MapContainer
        center={[40.76109413944779, -73.82886560401107]}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapData &&
          !mapData.error &&
          mapData.data &&
          !mapData.loading &&
          Object.keys(mapData.data.centroids).map((key) => (
            <Marker
              key={key}
              icon={MapMarker(mapData.data!.centroids[key].color)}
              position={[
                mapData.data!.centroids[key].latitude,
                mapData.data!.centroids[key].longitude,
              ]}
              eventHandlers={eventHandlers}
            >
              {key}
            </Marker>
          ))}
      </MapContainer>
    </BoxContainer>
  );
};

export default HomePage;
