const path = require("path");
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
const isProduction = process.env.NODE_ENV !== 'development'
const devNeedCdn = false
const cdn = {
    // cdn：模块名称和模块作用域命名（对应window里面挂载的变量名称）
    externals: {
        vue: 'Vue',
        vuex: 'Vuex',
        'vue-router': 'VueRouter'
    },
    // cdn的css链接
    css: [],
    // cdn的js链接
    js: [
        'https://cdn.staticfile.org/vue/2.6.10/vue.min.js',
        'https://cdn.staticfile.org/vuex/3.0.1/vuex.min.js',
        'https://cdn.staticfile.org/vue-router/3.0.3/vue-router.min.js'
    ]
}
module.exports = {
	publicPath: "./",
	outputDir: "dist",
	assetsDir: "static",
	lintOnSave: false,
	productionSourceMap: false,
	css: {
        loaderOptions: {
        }
    },
    pluginOptions: {
        'style-resources-loader': {
          preProcessor: 'less',
          patterns: [path.resolve(__dirname, "src/common/less/variable.less")] // 引入全局样式变量
        }
    },
	chainWebpack: (config) => {
		// ============压缩图片 start============
		// config.module
		// 	.rule('images')
		// 	.test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
        //     .use('image-webpack-loader')
        //     .loader('image-webpack-loader')
        //     .options({ bypassOnDebug: true })
		// 	.end()
		// ============注入cdn start============
		config.plugin('html')
			.tap(args => {
				if (isProduction || devNeedCdn) args[0].cdn = cdn
				return args
			})
	},
	configureWebpack: (config) => {
		const plugins = [];
		if (isProduction || devNeedCdn) {
			// 为生产环境修改配置...
			config.mode = "production";
			config.externals = cdn.externals
			// 将每个依赖包打包成单独的js文件
			let optimization = {
				runtimeChunk: "single",
				splitChunks: {
					chunks: "all",
					maxInitialRequests: Infinity,
					minSize: 20000,
					cacheGroups: {
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name(module) {
								// get the name. E.g. node_modules/packageName/not/this/part.js
								// or node_modules/packageName
								const packageName = module.context.match(
									/[\\/]node_modules[\\/](.*?)([\\/]|$)/
								)[1];
								// npm package names are URL-safe, but some servers don't like @ symbols
								return `npm.${packageName.replace("@", "")}`;
							},
						},
					},
				}
			};
			Object.assign(config, {
				optimization,
			});
			plugins.push(
				new CompressionWebpackPlugin({
					filename: "[path].gz[query]",
					algorithm: "gzip",
					test: productionGzipExtensions,
					threshold: 10240,
					minRatio: 0.8
				})
			);
		} else {
			// 为开发环境修改配置...
			config.mode = "development";
		}
		Object.assign(config, {
			// 开发生产共同配置
			resolve: {
				alias: {
					"@": path.resolve(__dirname, "./src"),
					"@c": path.resolve(__dirname, "./src/components"),
					"@p": path.resolve(__dirname, "./src/pages"),
				}, // 别名配置
			},
		});
		config.plugins = [...config.plugins, ...plugins];
    },
	devServer: {
		port: 8088,
		open: true,
		overlay: {
			warnings: false,
			errors: true,
		},
		proxy: {
			"/mock-prefix": {
				target: "http://localhost:7300/mock/5e99461be01d7962fdd74ee6",
				pathRewrite: { "^/mock-prefix": "" },
			},
		},
	},
};
