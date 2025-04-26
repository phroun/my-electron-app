import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { mainConfig } from './webpack/webpack.main.config';
import { rendererConfig } from './webpack/webpack.renderer.config';
// Add Node polyfill plugin import
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import type { Configuration } from 'webpack';

// Create enhanced webpack configs with Node.js polyfills
const enhancedMainConfig: Configuration = {
  ...mainConfig,
  plugins: [
    ...(mainConfig.plugins || []),
    new NodePolyfillPlugin()
  ],
  resolve: {
    ...(mainConfig.resolve || {}),
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false as const, // Type as const to satisfy TypeScript
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/")
    }
  }
};

const enhancedRendererConfig: Configuration = {
  ...rendererConfig,
  plugins: [
    ...(rendererConfig.plugins || []),
    new NodePolyfillPlugin()
  ],
  resolve: {
    ...(rendererConfig.resolve || {}),
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false as const // Type as const to satisfy TypeScript
    }
  }
};

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}), 
    new MakerZIP({}, ['darwin']), 
    new MakerRpm({}), 
    new MakerDeb({})
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig: enhancedMainConfig,
      renderer: {
        config: enhancedRendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
      // Optionally disable fork-ts-checker if it's causing EPIPE errors
      // Uncomment the following section if needed
      /*
      plugins: [
        {
          name: 'typescript',
          config: {
            enabled: false
          }
        }
      ]
      */
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
