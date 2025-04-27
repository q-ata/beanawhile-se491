import React, { useState, useEffect } from "react";
import Calendar from "rc-year-calendar";
import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

import "../App.css";

import NavbarPageWrapper from "../components/base/NavbarPageWrapper";
import { getTravelInfo, addTravelInfo } from "../utils/client";
import { stringToColour } from "../utils/formatters";
import { TravelDatum } from "../utils/types";

type Range = {
  startDate: Date;
  endDate: Date;
};

const MyTravelPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [range, setRange] = useState<Range | null>(null);
  const [location, setLocation] = useState(null);
  const [travelData, setTravelData] = useState<TravelDatum[]>([]);

  useEffect(() => {
    getTravelInfo().then((res) => {
      if (!res.ok) return; // TODO: handle error
      // TODO: this is probably bad
      setTravelData([
        ...travelData,
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
  }, []);

  const resetSelection = () => {
    setRange(null);
    setLocation("");
    onClose();
  };

  return (
    <NavbarPageWrapper>
      <Stack mx="auto" p="12px" spacing="32px">
        <Stack align="center" spacing="8px">
          <Heading fontSize="4xl">My travel plans</Heading>
          <Text fontSize="lg" color="gray.500">
            Where will you have &#129752;? Share your plans with friends!
          </Text>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p="32px">
          <Calendar
            enableRangeSelection={true}
            roundRangeLimits={false}
            style="custom"
            customDataSourceRenderer={(
              element: any,
              date: any,
              events: any
            ) => {
              const recentEvent = events[events.length - 1];
              element.title = recentEvent.name;
              element.style.background = stringToColour(recentEvent.location);
              element.style.borderRadius = "0";
            }}
            onRangeSelected={(event: any) => {
              setRange({ startDate: event.startDate, endDate: event.endDate });
              onOpen();
            }}
            dataSource={travelData}
          />
        </Box>
        <Modal isCentered isOpen={isOpen} onClose={resetSelection} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton
              marginLeft="auto"
              marginRight="12px"
              marginTop="12px"
              position="static"
            />
            <ModalBody padding="0 32px 32px 32px">
              <Stack spacing="12px">
                <FormControl id="location">
                  <FormLabel>
                    {range
                      ? `Where do you plan on bean from ${range.startDate.toLocaleDateString()} to ${range.endDate.toLocaleDateString()}?`
                      : "Where do you plan on bean?"}
                  </FormLabel>
                  <GooglePlacesAutocomplete
                    selectProps={{ value: location, onChange: setLocation }}
                    autocompletionRequest={{
                      types: ["(regions)"],
                    }}
                  />
                </FormControl>
                <Button
                  bg="blue.400"
                  color="white"
                  _hover={{
                    bg: "blue.500",
                  }}
                  onClick={async () => {
                    if (location) {
                      const res = await addTravelInfo(
                        range.startDate,
                        range.endDate,
                        location.value.place_id
                      );

                      if (res.ok) {
                        setTravelData([
                          ...travelData,
                          {
                            name: location.label,
                            location: location.value.place_id,
                            startDate: range.startDate,
                            endDate: range.endDate,
                          },
                        ]);
                      } else {
                        // TODO: error handling
                      }
                    }
                    resetSelection();
                  }}
                >
                  Confirm
                </Button>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Stack>
    </NavbarPageWrapper>
  );
};

export default MyTravelPage;
