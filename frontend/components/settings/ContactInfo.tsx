import React from "react";

import {
  Box,
  Heading,
  Input,
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
  GetUserResponse
} from "../../utils/client";

const ContactInfo = ({ user, setUser }: { user: GetUserResponse, setUser: (u: GetUserResponse) => void }) => {
  return (
    <Stack spacing="12px">
      <Heading fontSize="lg">Discord</Heading>
      <Input
        value={user.contact_discord}
        onChange={(e) => setUser({ ...user, contact_discord: e.target.value })}
      />
      <Heading fontSize="lg">Instagram</Heading>
      <Input
        value={user.contact_instagram}
        onChange={(e) => setUser({ ...user, contact_instagram: e.target.value })}
      />
    </Stack>
  );
};

export default ContactInfo;
