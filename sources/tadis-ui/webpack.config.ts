import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: './src/viewer.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'webpack.tsconfig.json'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new ProgressBarPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: 'async',
      automaticNameDelimiter: '-'
    }
  }
};
