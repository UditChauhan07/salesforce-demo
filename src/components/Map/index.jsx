import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { useState } from 'react';
import Loading from '../Loading';
import Styles from "./Styles.module.css";

const containerStyle = {
    width: '100%',
    height: '100%'
};
const circleOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    radius: 1000, // Radius in meters
    zIndex:1
};

let color = {
    A: "#00FF00a1", B: "#66FF66a1", C: "#FFFF66a1a1", D: "#FF9966a1", E: "#FF0000a1"
}

const MapGenerator = ({ focusOn, MarkLocations=[], zoom = 5,icon=true }) => {
    const key = process.env.REACT_APP_GMAK;
    const [selectedMarker, setSelectedMarker] = useState(null);
    if (key) {
        return (<LoadScript
            googleMapsApiKey={key}
            loadingElement={<Loading />}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={focusOn}
                zoom={zoom}
            >
                {MarkLocations.length && MarkLocations.map((location, index) => (
                    <>
                    {/* location.icon ||  */}
                        <Marker
                            key={index}
                            icon={icon?"/assets/marker.png":null}
                            position={{ lat: location.lat, lng: location.lng }}
                            onClick={() => setSelectedMarker(location)}
                        />
                        {/* <Circle
                            center={location}
                            options={{ ...circleOptions, strokeColor: color[location.tier], fillColor: color[location.tier] }}
                        /> */}
                    </>
                ))}

                {selectedMarker && (
                    <InfoWindow
                        position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                        onCloseClick={() => setSelectedMarker(null)}
                    >
                        <div className={Styles.markerHolder}>
                            <h2>{selectedMarker.title}</h2>
                            {selectedMarker?.content && <div dangerouslySetInnerHTML={{ __html: selectedMarker?.content }} />}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>)
    } else {
        return null;
    }
}

export default MapGenerator