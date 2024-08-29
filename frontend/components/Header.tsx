'use client';
import { Flex, Text } from "@chakra-ui/react";

function Header() {
  return (
    <Flex
        justifyContent="space-between"
        alignItems="center"
        p="2rem"
    >
        <Text>Logo</Text>
        <Text>Connexion</Text>

    </Flex>
  )
}

export default Header