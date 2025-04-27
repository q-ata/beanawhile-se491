import React, { useEffect, useState } from "react";

import {
  Box,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack
} from "@chakra-ui/react";

import {
  Permissions
} from "../../utils/client";

const Preferences = ({ header, default_, setPermission }: {
  header: string,
  default_: Permissions,
  setPermission: (p: Permissions) => void
}) => {
  return <Box width="80%" pb="5">
    <Heading fontSize="md">{header}</Heading>
    <Slider min={0} max={2} defaultValue={default_} onChange={setPermission}>
      <SliderMark value={0} mt="1.5" fontSize="sm">
        All Friends
      </SliderMark>
      <SliderMark value={1} mt="1.5" ml="-8" fontSize="sm">
        Close Friends
      </SliderMark>
      <SliderMark value={2} mt="1.5" ml="-12" fontSize="sm">
        Nobody
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  </Box>
};

export default Preferences;
