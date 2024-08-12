
from dotenv import load_dotenv
import os
load_dotenv()
import geopandas as gpd
from geopy.geocoders import GoogleV3
from shapely.geometry import Point
from geopy.distance import geodesic

class GeoLocator:
    def __init__(self):
        self.geolocator = GoogleV3(api_key=os.getenv('GOOGLEV3_GEOCODING_KEY'))
          
    def get_lat_lon(self, address):
        location = self.geolocator.geocode(address)
        if location:
            return location.latitude, location.longitude
        else:
            raise ValueError("Address not found.")

class Neighborhoods:
    def __init__(self, shapefile_path):
        self.neighborhoods = gpd.read_file(shapefile_path)
    
    def get_neighborhood(self, lat, lon):
        point = gpd.GeoDataFrame([{'geometry': Point(lon, lat)}], crs="EPSG:4326")
        neighborhood = gpd.sjoin(point, self.neighborhoods, how='left', predicate='within')
        if neighborhood.empty:
            raise ValueError("The address does not fall within any neighborhood in the shapefile.")
        return neighborhood.iloc[0]['ntaname']
    
    def get_centroid(self, user_neighborhood_name):
        neighborhood_geom = self.neighborhoods[self.neighborhoods['ntaname'] == user_neighborhood_name]
        # Project to a suitable CRS (example using EPSG:3857)
        projected_neighborhood_geom = neighborhood_geom.to_crs(epsg=3857)
        centroid = projected_neighborhood_geom.geometry.centroid.to_crs(epsg=4326)  # Convert back to original CRS if needed
        return centroid.iloc[0]
    
    def calculate_distances(self, center):
        distances = {}
        for idx, row in self.neighborhoods.iterrows():
            other_center = row.geometry.centroid
            distance = geodesic((center.y, center.x), (other_center.y, other_center.x)).miles
            distances[row['ntaname']] = distance
        return distances