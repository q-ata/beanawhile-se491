import React from "react";
import { Box, Grid, Stack, Text } from "@chakra-ui/react";

import { stringToColour } from "../../utils/formatters";
import { TravelInfo } from "../../utils/types";

const HomeSummary = ({
  friendsTravelInfo,
}: {
  friendsTravelInfo: TravelInfo[];
}) => {
  const friendsTravelPlans = friendsTravelInfo

    // filter travel plans ending more than 7 days in the future
    .filter(({ endDate }) => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 7);
      return endDate > futureDate;
    })

    // clip start date to 7 days in the future
    .map((travelInfo) => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 7);
      travelInfo.startDate = new Date(
        Math.max(travelInfo.startDate.getTime(), futureDate.getTime())
      );
      return travelInfo;
    })

    // group travel plans by friends
    .reduce((acc, travelInfo) => {
      if (!acc[travelInfo.friend]) {
        acc[travelInfo.friend] = [];
      }
      acc[travelInfo.friend].push(travelInfo);
      return acc;
    }, {} as Record<string, TravelInfo[]>);

  // sort by earliest start date
  const sortedFriendsTravelPlans = Object.entries(friendsTravelPlans)
    .map(([friend, travelInfos]) => ({
      friend,
      travelInfos: travelInfos.sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
      ),
    }))
    .sort(
      (a, b) =>
        a.travelInfos[0].startDate.getTime() -
        b.travelInfos[0].startDate.getTime()
    );

  return (
    <Stack spacing="16px">
      {sortedFriendsTravelPlans.length > 0 ? (
        sortedFriendsTravelPlans.map(({ friend, travelInfos }) => (
          <Box key={`summary-friend-${friend}`}>
            <Text fontSize="xl" fontWeight="bold" mb="8px">
              {friend}
            </Text>
            {travelInfos.map(({ startDate, endDate, location }, index) => (
              <Grid
                key={`summary-travel-plan-${friend}-${index}`}
                templateColumns="1fr auto"
                p="4px 32px"
                mb="8px"
                borderRadius="md"
                background={stringToColour(location.name)}
              >
                <Text>
                  {startDate.toLocaleDateString()} -{" "}
                  {endDate.toLocaleDateString()}
                </Text>
                <Text fontWeight="bold" textAlign="right">
                  {location.name}
                </Text>
              </Grid>
            ))}
          </Box>
        ))
      ) : (
        <Text textAlign="center">
          You and your friends share no travel plans after this week.
        </Text>
      )}
    </Stack>
  );
};

export default HomeSummary;
