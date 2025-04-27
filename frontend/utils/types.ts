export type TStyled = Omit<React.HTMLProps<HTMLDivElement>, "as" | "ref">;
export type TSvgProps = React.SVGProps<SVGSVGElement> & {
  isHovering?: boolean;
};

export type TravelInfo = {
  friend: string;
  email: string;
  location: {
    name: string;
    google_id: string;
    coordinates: {
      lng: number;
      lat: number;
    }
  };
  startDate: Date;
  endDate: Date;
};

export type TravelDatum = {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
};
