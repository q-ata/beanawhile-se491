import React, { useEffect, useState } from "react";
import {
  Flex,
  Text,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Stack,
} from "@chakra-ui/react";

import GoogleMapsView from "../base/GoogleMapsView";
import { getAllFriendsTravelInfo, serializeDate } from "../../utils/client";
import { TravelInfo } from "../../utils/types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const friendlyDate = (date: Date) => {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const FriendsTravelMap = () => {
  const [allData, setAllData] = useState<TravelInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    getAllFriendsTravelInfo().then((res) => {
      if (res.ok) {
        setAllData(
          res.content
            .map((friend) => {
              return friend.info.map((info) => {
                return {
                  friend: friend.name,
                  location: info.location,
                  email: friend.email,
                  startDate: new Date(friendlyDate(new Date(info.start_date))),
                  endDate: new Date(friendlyDate(new Date(info.end_date))),
                };
              });
            })
            .reduce((a, b) => a.concat(b))
        );
      } else {
        // TODO: error handling
      }
    });
  }, []);

  return (
    <Flex w="100%" h="100%" direction="column" gap="12px">
      <Flex w="100%" h="100%" flex="1">
        <GoogleMapsView data={allData} selectedDate={selectedDate} />
      </Flex>
      <Stack direction="row" spacing="12px">
        <Slider
          aria-label="slider-ex-1"
          min={-10}
          max={200}
          defaultValue={0}
          onChange={(e) => {
            setSelectedDate(
              new Date(
                new Date(friendlyDate(new Date())).getTime() +
                1000 * 60 * 60 * 24 * (e + 1)
              )
            );
          }}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Text width="170px">{friendlyDate(selectedDate)}</Text>
      </Stack>
    </Flex>
  );
};

export default FriendsTravelMap;
