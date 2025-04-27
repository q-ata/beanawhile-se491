import React from "react";
import { Box, Heading, Text, Stack } from "@chakra-ui/react";

import NavbarPageWrapper from "../components/base/NavbarPageWrapper";
import FriendsTravelMap from "../components/friendsTravel/FriendsTravelMap";

const FriendsTravelPage = () => {
  return (
    <NavbarPageWrapper>
      <Stack w="100%" h="100%" mx="auto" p="12px" spacing="32px">
        <Stack align="center" spacing="8px">
          <Heading fontSize="4xl">Friends' travel plans</Heading>
          <Text fontSize="lg" color="gray.500">
            Where will your friends have &#129752;? Check out their plans!
          </Text>
        </Stack>
        <Box
          w="100%"
          h="100%"
          rounded="lg"
          bg="white"
          boxShadow="lg"
          p="32px"
          minH="600px"
        >
          <FriendsTravelMap />
        </Box>
      </Stack>
    </NavbarPageWrapper>
  );
};

export default FriendsTravelPage;
