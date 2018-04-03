const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
module.exports = {
	entry: {
		index: './src/js/index.js'
	},
	plugins:[	
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
			title: '商家',
			filename: 'index.html',
			template: './src/index.html',
			inject: 'body',
			chunks: ['index']
		})
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname,'dist')
	},
	module:{
		rules:[
			{
				test: /\.css$/,
				use:[
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.scss$/,
				use:[
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				use:[
					'file-loader'
				]
			},
			{
				test: /\.json$/,
				use:[
					'json-loader'
				]
			}
		]
	}
}