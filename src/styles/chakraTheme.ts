import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const chakraTheme = createSystem(defaultConfig, defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
        },
        body: {
          value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
        },
      },

      colors: {
        brand: {
          50: {
            value: '#FFF3E0',
          },
          100: {
            value: '#FFE0B2',
          },
          200: {
            value: '#FFCC80',
          },
          300: {
            value: '#FFB74D',
          },
          400: {
            value: '#FFA726',
          },
          500: {
            value: '#FF8C1A',
          },
          600: {
            value: '#FB8C00',
          },
          700: {
            value: '#F57C00',
          },
          800: {
            value: '#EF6C00',
          },
          900: {
            value: '#E65100',
          },
        },
      },
    },
  },
}));

export default chakraTheme;
