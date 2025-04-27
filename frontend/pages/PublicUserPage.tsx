import React, { useState, useEffect } from "react";
import { useParams, Redirect } from 'react-router-dom'
import NavbarPageWrapper from "../components/base/NavbarPageWrapper";
import {
    Stack,
} from "@chakra-ui/react";

import {
    getPublicUser,
    GetPublicUserResponse,
} from "../utils/client";

import ProfileCard from "../components/publicUser/ProfileCard";

const PublicUser = () => {
    const [user, setUser] = useState<GetPublicUserResponse>({
        name: "",
        email: "",
        profile_picture_url: "",
        contact_discord: "",
        contact_instagram: "",
    });
    const { email } = useParams<{ email: string }>()

    useEffect(() => {
        getPublicUser(email).then((res) => {
            if (!res.ok) {
                setUser(null);
                return;
            }

            setUser(res.content);
        });
    }, []);

    if (!user) {
        return <Redirect to='/' />
    }

    return (
        <NavbarPageWrapper>
            <ProfileCard user={user} />
        </NavbarPageWrapper>
    );
};

export default PublicUser;
