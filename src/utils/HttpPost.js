import { DeviceEventEmitter } from 'react-native';
import Config from '../config/index';
import qs from 'qs';
import { Toast } from 'native-base'; 
import AsyncStorage from './AsyncStorage';
import md5 from 'md5';
import { Platform } from "react-native";

//排序的函数
function objKeySort(obj) {
    var newkey = Object.keys(obj).sort();
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newObj = {};//创建一个新的对象，用于存放排好序的键值对
    for (var i = 0; i < newkey.length; i++) {//遍历newkey数组
        newObj[newkey[i]] = obj[newkey[i]];//向新创建的对象中按照排好的顺序依次增加键值对
    }
    return newObj;//返回排好序的新对象
}


export default async (type = 'GET', uri, data, ismd5 ) => {
	// Token
	let jwToken = await AsyncStorage.getItem("jwToken");
	let testUrl = await AsyncStorage.getItem("testUrl");
	// 大写
	type = type.toUpperCase();
	// 地址判断
	if (testUrl) {
		uri = testUrl + uri;
	} else {
		uri.search("http") != '-1' ? uri = uri : uri = Config.API_PATH + uri;
	}
	
	let startTime = new Date().getTime();
	
	Config.Env === 'dev' && console.info(type,uri);
	// try {
		let response = {};
		if (type === 'GET') {
			Config.Env === 'dev' && console.info("get data:",data);
			if (data) {
				data = uri + '?' + qs.stringify(data)
			}else{
				data = uri
			}
			let header = {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
			if (jwToken) {
				header.Authorization = 'Bearer ' + jwToken
			}
			response = await fetch(data,{
				method: 'GET',
				headers: header,
			})
		} else if (type === 'POST' || type === 'PUT' || type === 'DELETE') {
			// 加密
			// if (!ismd5) {
			// 	data.timestamp = new Date().getTime();
			// 	data.system = Platform.OS;
			// 	data.version = Config.Version.version+'.'+Config.Version.versionNum;
			// 	let md = decodeURIComponent(qs.stringify(objKeySort(data))+data.timestamp)
			// 	md = md.toLowerCase()
			// 	data.mySign = md5(md);
			// }

			Config.Env === 'dev' && console.info(`${type.toLowerCase()} data:`,data);

			let header = {
				'Accept': 'application/json',
				'Content-Type': 'application/json;charset=UTF-8',
			}
			if (jwToken) {
				header.Authorization = 'Bearer ' + jwToken
			}
			// 实体
			response = await fetch(
				uri, 
				{
					method: type,
					headers: header,
					body: JSON.stringify(data),
				}
			);
		} else {
			throw new Error(`Unsupported HTTP method: ${type}`);
		}
		let responseJson = await response.json();

		let endTime = new Date().getTime();
		
		Config.Env === 'dev' && console.info(responseJson);
		Config.Env === 'dev' && console.info('开始时间',startTime,'结束时间：', endTime,'用时：', endTime-startTime);
		Config.Env === 'dev' && console.info();
		if(responseJson && responseJson.code == 'Unauthorized'){
			Toast.show({ title: responseJson.msg || responseJson.data.msg, placement: "top"});
			DeviceEventEmitter.emit("toLogin");
		} else if (responseJson && responseJson.code != 200 ){
			if (responseJson.message || responseJson.msg ) {
				Toast.show({ title: responseJson.message || responseJson.msg || responseJson.data.message || responseJson.data.msg ,  placement: "top"});
			}
			
		}

		return responseJson;
	// } catch (error) {
	// 	console.error(error);
	// }
} 

