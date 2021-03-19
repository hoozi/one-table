const { resolve } = require('path');

module.exports = {
  productionSourceMap: false,
  pages: {
    index: {
      entry: 'examples/main.ts', // 入口
      template: 'public/index.html', // 模板
      filename: 'index.html' // 输出文件
    }
  },
  css: {
    //requireModuleExtension:false,
    //exclude:/node_modules/,
    loaderOptions: {
      
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'prefixCls': 'one-pro',
          'primary-color':'#1890ff',
          'one-border-color': '#e4eaed',//'#f0f0f0'//'#dce3e8',
          'font-size-base': '12px'
        }
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('examples'))
      .set('~', resolve('src'));

    config.module
      .rule('packages')
      .include.add(/packages/)
      .end()
      .include.add(/src/);
      
    return config;
  }
}