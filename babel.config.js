module.exports = {
  presets: ['babel-preset-current-node-syntax'],
  plugins: [
    '@babel/plugin-syntax-jsx',
    ['@babel/plugin-syntax-typescript', { isTSX: true }],
  ],
};