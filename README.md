<p align="center"><img src="https://i.imgur.com/YkFYElG.jpg"></p>

# VTEX SPEED WEBPACK ESNEXT

> Reverse proxy, compilation, minification, optimization using esnext with webpack.

I made this project in a few hours to help the community, currently I have no time to improve it. If you would like to help please make a pull request!

## Getting Started

**Before continuing,** please edit the `accountName, version, prefix, team, website` key to the `package.json` file:
```json
"vtex": {
    "store": "your-store-account-name",
    "version": 1,
    "prefix": "XY",
    "team": "Your Team Name",
    "website": "Your Website",
    "environment": "vtexcommercestable",
    "browser": "chrome",
    "protocol": "https"
  }
```

```bash
# Clone this repo
git clone https://github.com/EduD/vtex-speed-webpack-esnext.git

# Enter the folder you cloned
cd vtex-speed-webpack-esnext

# install all dependencies
npm install

# run vtex-speed-webpack-esnext
npm start

# compile and minify files for production
npm run deploy

# remove development folders
npm run clean

# check for errors in the lint of your js files
npm run lint

```

### Prerequisities

- [Node](https://nodejs.org)
- [Gulp](http://gulpjs.com/)
- [Webpack](https://webpack.js.org/)
- [Husky](https://github.com/typicode/husky)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/EduD/vtex-speed-webpack-esnext/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Author

* **Eduardo Dantas** - [EduD](https://github.com/EduD)

See also the list of [contributors](https://github.com/EduD/vtex-speed-webpack-esnext/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
