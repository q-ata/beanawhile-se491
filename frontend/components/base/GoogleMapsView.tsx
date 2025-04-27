import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import GoogleMapReact from "google-map-react";
import { getBeanPicture, getTravelInfo, serializeDate } from "../../utils/client";
import { TravelInfo } from "../../utils/types";

type FriendData = {
  loc: string;
  name: string;
  pfp: string;
  email: string;
};

type MarkerData = { lat: number, lng: number, data: FriendData[] };

// the $hover prop is passed implicitly by gmaps,
// we dont use it currently since onMouseEnter seems to work fine and $hover needs custom code to calibrate
const FriendMarker = ({ data, lat, lng, $hover }: { data: FriendData[], lat: number, lng: number, $hover?: boolean }) => {
  const [hover, setHover] = useState(false);
  const history = useHistory();

  const FriendInfo = ({ data }: { data: FriendData[] }) => {
    return <div style={{
      border: "2px solid #aaa",
      borderRadius: "5px",
      backgroundColor: "#ccc",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    }}>
      <img src={data[0].pfp} width="48px" height="48px" style={{ margin: "4px" }} />
      <div style={{
        marginLeft: "8px",
        marginRight: "4px",
        flexDirection: "column",
        justifyContent: "center",
        display: "flex"
      }}>
        <span style={{
          maxWidth: "120px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: "60px"
        }}>{data[0].name}</span>
        {
          data.length > 1 ?
            <span>+{data.length - 1} more</span>
            :
            <></>
        }
      </div>
    </div>
  };

  const item = data[0];
  return (
    <div style={{
      fontSize: "1.2em",
      cursor: "pointer"
    }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={() => {
        history.push(`/user/${data[0].email}`)
      }}
    >
      <div style={{
        display: "inline-block",
        position: "absolute",
        transform: "translate(-50%, -100%)"
      }}
      >
        <FriendInfo data={data} />
        {/* CRINGE */}
        <div style={{
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderTop: "14px solid #aaa",
          margin: "auto"
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "12px solid #ccc",
            position: "relative",
            top: "-16px",
            left: "-12px"
          }}></div>
        </div>
      </div>
      <div style={{
        display: "inline-block",
        position: "absolute",
        transform: `translate(50 %, calc(-${100 / (data.length - 1)} % - 14px))`
      }}>
        {
          hover ?
            data.slice(1).map((d) => <FriendInfo data={[d]} />)
            :
            <></>
        }
      </div>
    </div>
  );
}

const GoogleMapsView = ({ data, selectedDate }: { data: TravelInfo[], selectedDate: Date }) => {

  const [center, setCenter] = useState({ lat: 46.8182, lng: 8.2275 });
  const [markerData, setMarkerData] = useState<MarkerData[]>([]);

  useEffect(() => {
    getTravelInfo({ start_date: serializeDate(new Date()), end_date: serializeDate(new Date()) }).then((res) => {
      if (res.ok && res.content.length > 0) {
        const loc = res.content[0].location.coordinates;
        setCenter({ lat: loc.lat, lng: loc.lng });
      }
    })
  }, []);

  useEffect(() => {
    const overlaps = data.filter((range) => {
      const start = range.startDate.getTime();
      const end = range.endDate.getTime();
      const pred = selectedDate.getTime();
      return start <= pred && end >= pred;
    });

    // TODO: We probably want to bunch together markers that are close to each other.
    // Furthermore, this algo should be a function of the current zoom level since
    // the marker size does not change with zoom.
    // Currently, we only bunch markers in the exact same location.

    // Group overlaps by location
    const grouped: { [id: string]: MarkerData } = {};
    for (const overlap of overlaps) {
      if (!grouped.hasOwnProperty(overlap.location.google_id)) {
        grouped[overlap.location.google_id] = {
          lat: overlap.location.coordinates.lat,
          lng: overlap.location.coordinates.lng,
          data: []
        };
      }

      grouped[overlap.location.google_id].data.push({
        name: overlap.friend,
        loc: overlap.location.name,
        pfp: getBeanPicture(overlap.friend),
        email: overlap.email,
      });
    }

    setMarkerData(Object.values(grouped));
  }, [data, selectedDate]);

  return (
    <GoogleMapReact
      bootstrapURLKeys={{ key: "INSERT_GOOGLE_API_KEY_HERE" }}
      // defaultCenter={center}
      center={center}
      defaultZoom={11}
    // distanceToMouse={(markerPos: {x: number, y: number}, mousePos: {x: number, y: number}, markerProps: object) => {
    //   console.log(markerProps);
    // }}
    >
      {markerData.map((marker) => {
        return <FriendMarker
          lat={marker.lat}
          lng={marker.lng}
          data={marker.data}
        />
      })}
    </GoogleMapReact>
  );
};

export default GoogleMapsView;
