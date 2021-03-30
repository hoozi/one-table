
import typescript from "rollup-plugin-typescript2";
//import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import url from "@rollup/plugin-url";
import image from '@rollup/plugin-image';
import cssnano from 'cssnano';

export default [
  url({
    include: [
      "**/*.woff2",
      "**/*.woff",
      "**/*.ttf",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
    ],
    limit: Infinity
  }),
  image(),
  json(),
  //resolve(),
  typescript({
    exclude: ["*.d.ts", "**/*.d.ts", "**/*.stories.tsx", "**/*.spec.tsx", "node_modules"],
    include: [
      "src/**/*.ts",
      "src/**/*.tsx",
      "src/**/*.vue",
      "tests/**/*.ts",
      "tests/**/*.tsx"
    ],
    rollupCommonJSResolveHack: true,
    clean: true,
    tsconfig: 'rollup.tsconfig.json'
  }),
  babel({
    babelHelpers: "runtime",
    extensions: [".js", ".jsx", ".ts", ".tsx", "json"],
    exclude: ["node_modules/**", "public/**"],
  }),
  commonjs(),
  postcss({
    use: [
      [
        "less", 
        { 
          javascriptEnabled: true, 
          modifyVars: {
            'prefixCls': 'one-pro',
            'primary-color':'#1890ff',
            'one-border-color': '#e4eaed'
          } 
        }
      ]
    ],
    plugins: [
      cssnano()
    ]
  })
  //terser()
]