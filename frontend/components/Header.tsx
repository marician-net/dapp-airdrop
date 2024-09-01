'use client';
import { Flex, Text } from "@chakra-ui/react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header() {
  return (
    <Flex
        justifyContent="space-between"
        alignItems="center"
        p="2rem"
    >
        <Text color="blue.500" fontWeight="bold">Oaiby</Text>
        <ConnectButton />

    </Flex>
  )
}

export default Header