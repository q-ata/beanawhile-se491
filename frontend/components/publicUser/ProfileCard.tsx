import React from "react";
import {
    Box,
    Heading,
    HStack,
    Image,
    Stack,
    Text,
} from "@chakra-ui/react";

import { getBeanPicture, GetPublicUserResponse } from "../../utils/client";

const ProfileCardItem = ({ title, value }: { title: string, value: string }) => {
    return (
        value &&
        <HStack spacing='12px'>
            <Text fontWeight={"bold"}>{title + ":"}</Text>
            <Text>{value}</Text>
        </HStack>
    );
}

const Profile = ({ user }: { user: GetPublicUserResponse }) => {
    return (
        <Stack mx="auto" w="xl" p="12px" spacing="32px">
            <Box rounded="lg" bg="white" boxShadow="lg" p="32px">
                <Stack align="center" spacing="16px">
                    <Image
                        src={`${getBeanPicture(user.email)}`}
                        alt="Bean Profile Picture"
                        width="50%"
                        margin="auto"
                        borderRadius="full"
                        border={"2px solid black"}
                    />
                    <Heading fontSize="4xl">{user.name}</Heading>

                    <Box>
                        <ProfileCardItem title={"Email"} value={user.email} />
                        <ProfileCardItem title={"Discord"} value={user.contact_discord} />
                        <ProfileCardItem title={"Instagram"} value={user.contact_instagram} />
                    </Box>
                </Stack>
            </Box >
        </Stack >
    );
};

export default Profile;

