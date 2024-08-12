from dataclasses import dataclass
from pathlib import Path

current_file_dir = Path(__file__).parent

@dataclass
class PathInfo:
    NEIGHBORHOOD_SHP_FILE_PATH: str = str(current_file_dir.parent / 'backend' / 'data' / 'Neighborhoods Boundries/geo_export_9e34d11d-eac6-48c3-a245-53140a985db0.shp')
    PDFS_FOLDER: str = str(current_file_dir.parent / 'backend' / 'data' / 'pdfs')
    NEIGHBORHOOD_DISEASES_DISTRIBUTION_JSON_PATH: str = str(current_file_dir.parent / 'backend' / 'data' / 'neighborhoods_diseases.json')    
    USERS_INFO : str = str(current_file_dir.parent / 'backend' / 'data' / 'users_info.json')
    SYMPTOMS_LIST: str = str(current_file_dir.parent / 'backend' / 'data' / 'symptoms_list_updated.json')
    GEOMETRIC_RADIUS_CSV: str = str(current_file_dir.parent / 'backend' / 'data' / 'Neighborhoods_Centroid_Based_Circles.csv')
    ENV_FILE_PATH: str = str(current_file_dir.parent /'.env')

