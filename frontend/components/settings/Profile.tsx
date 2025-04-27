import React from "react";

import {
  Box,
  Heading,
  Image,
  Input,
  Stack,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel
} from "@chakra-ui/react";

import { ProfilePictureType, getGravatarURL, getBeanPicture, GetUserResponse } from "../../utils/client";

const Profile = ({ user, setUser }: { user: GetUserResponse, setUser: (u: GetUserResponse) => void }) => {
  return (
    <Stack spacing="12px">
      <Heading fontSize="lg">Display Name</Heading>
      <Input
        value={user.name}
        onChange={(e) => setUser({...user, name: e.target.value})} />

      <Heading fontSize="lg">Email Address</Heading>
      <Input
        type="email"
        value={user.email}
        onChange={(e) => setUser({...user, email: e.target.value})} />

      <Heading fontSize="lg">Profile Picture</Heading>
      <Tabs index={user.profile_picture_type} onChange={(index) => {
        setUser({
          ...user,
          profile_picture_type: index,
          profile_picture_url: index === ProfilePictureType.File ? "" : null
        });
      }}>
        <TabList>
          <Tab>Gravatar</Tab>
          <Tab>File</Tab>
          <Tab>Bean</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Image
              src={`${getGravatarURL(user.email)}?s=256`}
              alt="Gravatar Profile Picture"
              width="80%"
              margin="auto"
              borderRadius="5px" />
          </TabPanel>
          <TabPanel>
            <Image
              src="https://i.imgur.com/EhNgS6j.jpeg"
              alt="File Upload"
              width="80%"
              margin="auto"
              borderRadius="5px" />
          </TabPanel>
          <TabPanel>
            <Box>
              <Image
                src={getBeanPicture(user.email)}
                alt="Your Bean"
                width="80%"
                margin="auto"
                borderRadius="5px" />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default Profile;
