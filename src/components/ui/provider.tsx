import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import chakraTheme from "@/styles/chakraTheme";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={chakraTheme}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
