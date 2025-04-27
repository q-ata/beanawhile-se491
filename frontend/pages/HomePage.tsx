import React, { useState, useEffect } from "react";
import { Heading, Stack, Text } from "@chakra-ui/react";

import NavbarPageWrapper from "../components/base/NavbarPageWrapper";
import HomeCalendar from "../components/home/HomeCalendar";
import HomeSummary from "../components/home/HomeSummary";
import { TravelInfo, TravelDatum } from "../utils/types";

import {
  getFriendsOverlappingTravelInfo,
  getTravelInfo,
} from "../utils/client";

const mergeIntervals = (intervals: TravelInfo[]): TravelInfo[] => {
  // sort intervals by friend, location, and startDate
  intervals.sort((a, b) => {
    if (a.friend !== b.friend) return a.friend.localeCompare(b.friend);
    if (a.location.google_id !== b.location.google_id)
      return a.location.google_id.localeCompare(b.location.google_id);
    return a.startDate.getTime() - b.startDate.getTime();
  });

  // merge adjacent intervals
  const merged: TravelInfo[] = [];
  for (const interval of intervals) {
    if (
      merged.length > 0 &&
      merged[merged.length - 1].friend === interval.friend &&
      merged[merged.length - 1].location.google_id ===
      interval.location.google_id &&
      new Date(
        merged[merged.length - 1].endDate.getTime() + 86400000
      ).getTime() === interval.startDate.getTime()
    ) {
      // merge intervals by updating the endDate of the last merged interval
      merged[merged.length - 1].endDate = interval.endDate;
    } else {
      // add a copy of the interval to avoid mutation
      merged.push({ ...interval });
    }
  }

  return merged;
};

const HomePage = () => {
  const [myTravelData, setMyTravelData] = useState<TravelDatum[]>([]);
  const [friendsTravelInfo, setFriendsTravelInfo] = useState<TravelInfo[]>([]);

  useEffect(() => {
    getTravelInfo().then((res) => {
      getFriendsOverlappingTravelInfo().then((res) => {
        if (res.ok) {
          setFriendsTravelInfo(
            mergeIntervals(
              res.content
                .map((friend) => {
                  return friend.overlap.map((overlap) => {
                    const startDate = new Date(overlap.start_date);
                    const endDate = new Date(overlap.end_date);

                    return {
                      friend: friend.name,
                      location: overlap.location,
                      startDate: new Date(
                        startDate.getTime() +
                        startDate.getTimezoneOffset() * 60000
                      ),
                      email: friend.email,
                      endDate: new Date(
                        endDate.getTime() + endDate.getTimezoneOffset() * 60000
                      ),
                    };
                  });
                })
                .reduce((a, b) => a.concat(b))
            )
          );
        } else {
          // TODO: error handling
        }
      });

      if (!res.ok) return; // TODO: handle error
      // TODO: this is probably bad
      setMyTravelData([
        ...myTravelData,
        ...res.content.map((loc) => {
          const startDate = new Date(loc.start_date);
          const endDate = new Date(loc.end_date);

          return {
            name: loc.location.name,
            startDate: new Date(
              startDate.getTime() + startDate.getTimezoneOffset() * 60000
            ),
            endDate: new Date(
              endDate.getTime() + endDate.getTimezoneOffset() * 60000
            ),
            location: loc.location.google_id,
          };
        }),
      ]);
    });

    // For frontend testing

    // setMyTravelData([
    //   {
    //     name: "Toronto",
    //     location: "Toronto",
    //     startDate: new Date(),
    //     endDate: new Date(),
    //   },
    //   {
    //     name: "Kitchener",
    //     location: "Kitchener",
    //     startDate: new Date("2024-11-27T02:33:31.000Z"),
    //     endDate: new Date("2024-11-29T14:33:31.000Z"),
    //   },
    // ]);

    // setFriendsTravelInfo(
    //   mergeIntervals([
    //     {
    //       friend: "David",
    //       location: {
    //         name: "Waterloo",
    //         google_id: "Waterloo",
    //         lng: "",
    //         lat: "",
    //       },
    //       startDate: new Date(),
    //       endDate: new Date(),
    //     },
    //     {
    //       friend: "Evan",
    //       location: { name: "Toronto", google_id: "Toronto", lng: "", lat: "" },
    //       startDate: new Date(),
    //       endDate: new Date(),
    //     },
    //     {
    //       friend: "David",
    //       location: {
    //         name: "Waterloo",
    //         google_id: "Waterloo",
    //         lng: "",
    //         lat: "",
    //       },
    //       startDate: new Date("2024-11-26T14:33:31.000Z"),
    //       endDate: new Date("2024-11-29T14:33:31.000Z"),
    //     },
    //     {
    //       friend: "Raymond",
    //       location: {
    //         name: "Waterloo",
    //         google_id: "Waterloo",
    //         lng: "",
    //         lat: "",
    //       },
    //       startDate: new Date("2024-11-26T14:33:31.000Z"),
    //       endDate: new Date("2024-11-29T14:33:31.000Z"),
    //     },
    //     {
    //       friend: "David",
    //       location: {
    //         name: "Waterloo",
    //         google_id: "Waterloo",
    //         lng: "",
    //         lat: "",
    //       },
    //       startDate: new Date("2024-12-23T14:33:31.000Z"),
    //       endDate: new Date("2024-12-25T14:33:31.000Z"),
    //     },
    //     {
    //       friend: "Evan",
    //       location: { name: "Toronto", google_id: "Toronto", lng: "", lat: "" },
    //       startDate: new Date("2024-12-21T14:33:31.000Z"),
    //       endDate: new Date("2024-12-21T14:33:31.000Z"),
    //     },
    //     {
    //       friend: "David",
    //       location: {
    //         name: "Waterloo",
    //         google_id: "Waterloo",
    //         lng: "",
    //         lat: "",
    //       },
    //       startDate: new Date("2024-12-20T14:33:31.000Z"),
    //       endDate: new Date("2024-12-22T14:33:31.000Z"),
    //     },
    //     {
    //       friend: "Raymond",
    //       location: {
    //         name: "Toronto",
    //         google_id: "Toronto",
    //         lng: "",
    //         lat: "",
    //       },
    //       startDate: new Date("2024-11-30T14:33:31.000Z"),
    //       endDate: new Date("2024-12-25T14:33:31.000Z"),
    //     },
    //   ])
    // );
  }, []);

  return (
    <NavbarPageWrapper>
      <Stack mx="auto" p="12px" spacing="32px">
        <Stack align="center" spacing="8px">
          <Heading fontSize="4xl">It's Beanawhile</Heading>
          <Text fontSize="lg" color="gray.500">
            Consider &#129752; around these folks sometime!
          </Text>
        </Stack>
        <Stack spacing="32px">
          <Stack rounded="lg" bg="white" boxShadow="lg" p="32px" spacing="16px">
            <Heading fontSize="2xl">Upcoming travel plans</Heading>
            <HomeCalendar
              myTravelData={myTravelData}
              friendsTravelInfo={friendsTravelInfo}
            />
          </Stack>
          <Stack rounded="lg" bg="white" boxShadow="lg" p="32px" spacing="16px">
            <Heading fontSize="2xl">Future travel plans</Heading>
            <HomeSummary friendsTravelInfo={friendsTravelInfo} />
          </Stack>
        </Stack>
      </Stack>
    </NavbarPageWrapper>
  );
};

export default HomePage;
