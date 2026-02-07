/*
 * @Date: 2018-12-20 18:18:00 
 * @Last Modified by:  
 * @Last Modified time: 2022-11-10 12:36:35
 */
const Env = require('./Env');
const Config = require('./Config.env.json');
const Version = require('./Version.json');

module.exports = {
    Env: Env,
    Version: Version,
    API_PATH: Config[Env].API_PATH,
    File_PATH: Config[Env].File_PATH,
};