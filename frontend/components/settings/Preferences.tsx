import React from "react";

import {
  Box,
  Heading,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Tooltip
} from "@chakra-ui/react";

import {
  ProximityAlgorithm,
  GetUserResponse
} from "../../utils/client";

import Permission from "./Permission";

const Preferences = ({ user, setUser }: { user: GetUserResponse, setUser: (u: GetUserResponse) => void }) => {
  return (
    <Stack spacing="12px">
      <Tooltip label="How we find friends near you" placement="bottom-start">
        <Heading fontSize="lg"><span style={{ borderBottom: "1px dotted" }}>Proximity Algorithm</span></Heading>
      </Tooltip>
      <Select
        defaultValue={ProximityAlgorithm.Smart}
        onChange={(e) => {
          setUser({
            ...user,
            proximity_algorithm: Number(e.target.value),
            proximity_distance: user.proximity_distance || 30
          });
        }}>
        <option value={ProximityAlgorithm.Smart}>Smart</option>
        <option value={ProximityAlgorithm.Region}>Same Region</option>
        <option value={ProximityAlgorithm.Distance}>Distance</option>
      </Select>
      {
        user.proximity_algorithm === ProximityAlgorithm.Distance ?
          <Box pt="8" pb="3">
            <Slider
              min={10}
              max={500}
              defaultValue={user.proximity_distance}
              onChange={(e) => setUser({ ...user, proximity_distance: e })}>
              <SliderMark value={10} mt="1" ml="-2.5" fontSize="sm">
                10km
              </SliderMark>
              <SliderMark value={500} mt="1" ml="-8" fontSize="sm">
                500km
              </SliderMark>
              <SliderMark
                value={user.proximity_distance}
                textAlign="center"
                bg="blue.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
                borderRadius="5px"
              >
                {user.proximity_distance}km
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
          :
          <></>
      }

      <Heading fontSize="lg">Friend Permissions</Heading>
      <Permission
        header="See My Full Schedule"
        default_={user.perm_see_full_schedule}
        setPermission={(e) => setUser({ ...user, perm_see_full_schedule: e })} />
      <Permission
        header="See My Exact Location"
        default_={user.perm_see_exact_location}
        setPermission={(e) => setUser({ ...user, perm_see_exact_location: e })} />
      <Permission
        header="View My Contact Info"
        default_={user.perm_view_contact_info}
        setPermission={(e) => setUser({ ...user, perm_view_contact_info: e })} />
      <Permission
        header="View My Email Address"
        default_={user.perm_view_email}
        setPermission={(e) => setUser({ ...user, perm_view_email: e })} />

    </Stack>
  );
};

export default Preferences;
