import React from "react";
import { Box, Grid, Link, Text } from "@chakra-ui/react";

import { stringToColour } from "../../utils/formatters";
import { TravelDatum, TravelInfo } from "../../utils/types";

const utcDate = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

const leqDates = (a: Date, b: Date) => utcDate(a) <= utcDate(b);

const eqDates = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const HomeCalendar = ({
  myTravelData,
  friendsTravelInfo,
}: {
  myTravelData: TravelDatum[];
  friendsTravelInfo: TravelInfo[];
}) => {
  const week = Array.from({ length: 7 }, (_, index) => {
    var date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });
  const weekStart = week[0];
  const weekEnd = week[week.length - 1];

  const weekMyTravelData = myTravelData
    .filter(
      ({ startDate, endDate }) =>
        leqDates(startDate, weekEnd) && leqDates(weekStart, endDate)
    )
    .map((travelDatum) => {
      return {
        ...travelDatum,
        startDate: leqDates(travelDatum.startDate, weekStart)
          ? weekStart
          : travelDatum.startDate,
        endDate: leqDates(weekEnd, travelDatum.endDate)
          ? weekEnd
          : travelDatum.endDate,
      };
    });

  const weekFriendsTravelInfo = friendsTravelInfo
    .filter(
      ({ startDate, endDate }) =>
        leqDates(startDate, weekEnd) && leqDates(weekStart, endDate)
    )
    .map((travelInfo) => {
      return {
        ...travelInfo,
        startDate: leqDates(travelInfo.startDate, weekStart)
          ? weekStart
          : travelInfo.startDate,
        endDate: leqDates(weekEnd, travelInfo.endDate)
          ? weekEnd
          : travelInfo.endDate,
      };
    })
    .reduce((acc, travelInfo) => {
      if (!acc[travelInfo.friend]) {
        acc[travelInfo.friend] = [];
      }
      acc[travelInfo.friend].push(travelInfo);
      return acc;
    }, {} as Record<string, TravelInfo[]>);

  return (
    <Grid templateColumns="repeat(7, 128px)" gap={4} justifyContent="center">
      {week.map((date, index) => {
        const showMonth =
          index === 0 || date.getMonth() !== week[index - 1].getMonth();

        return (
          <Box key={`date-${index}`} textAlign="center" mb="16px">
            <Box h="24px" mb="16px" fontSize="xl">
              {showMonth && (
                <Text fontWeight="bold">
                  {date.toLocaleString("default", { month: "short" })}
                </Text>
              )}
            </Box>
            <Text>{date.toLocaleString("default", { weekday: "short" })}</Text>
            <Text fontSize="xl">{date.getDate()}</Text>
          </Box>
        );
      })}

      {weekMyTravelData.length > 0 ? (
        weekMyTravelData.map(({ startDate, endDate, name, location }) => {
          const startIndex = week.findIndex((date) => eqDates(date, startDate));
          const endIndex = week.findIndex((date) => eqDates(date, endDate));

          return (
            <Box
              key={`location-${startDate}`}
              gridColumn={`${startIndex + 1} / ${endIndex + 2}`}
              mb="16px"
              p="4px"
              borderRadius="md"
              background={stringToColour(location)}
              textAlign="center"
            >
              <Text fontWeight="bold">{name}</Text>
            </Box>
          );
        })
      ) : (
        <Box gridColumn="1 / -1" textAlign="center">
          <Text>
            You have no travel plans this week, go to{" "}
            <Link href="my-travel" fontWeight="bold">
              My travel plans
            </Link>{" "}
            to add some.
          </Text>
        </Box>
      )}

      {Object.keys(weekFriendsTravelInfo).length > 0 ? (
        Object.entries(weekFriendsTravelInfo).map(([friend, travelInfos]) => (
          <React.Fragment key={`friend-${friend}`}>
            {travelInfos.map(({ location, startDate, endDate }) => {
              const startIndex = week.findIndex((date) =>
                eqDates(date, startDate)
              );
              const endIndex = week.findIndex((date) => eqDates(date, endDate));

              return (
                <Box
                  key={`travel-${friend}-${startDate}`}
                  gridColumn={`${startIndex + 1} / ${endIndex + 2}`}
                  p="4px"
                  borderRadius="md"
                  background={stringToColour(friend)}
                  textAlign="center"
                >
                  <Text fontWeight="bold">{friend}</Text>
                  <Text>{location.name}</Text>
                </Box>
              );
            })}
          </React.Fragment>
        ))
      ) : (
        <Box gridColumn="1 / -1" textAlign="center">
          <Text>You and your friends share no travel plans this week.</Text>
        </Box>
      )}
    </Grid>
  );
};

export default HomeCalendar;
