import Config from '../config/index';
import qs from 'qs';
import AsyncStorage from './AsyncStorage';

// 图片上传
export default {
	async imgUpData(imgUrl,imgType = 'image/jpeg',imgName='myimg') {
		// Token
		let Token = await AsyncStorage.getItem("jwToken");
		console.log('Token',Token)
		try {
			let formData = new FormData();// 把图片放入formData中,采用formData来实现
			let fileObj = { uri:  imgUrl, type: imgType, name: imgName };// 这里的key(uri和type和name)不能改变,此处type也有可能是'application/octet-stream',看后台配置
			formData.append('file', fileObj)
			let response = await fetch(
				Config.API_PATH + "/api/oss/upload", 
				{
					method: 'POST',
					headers: {
						'Content-Type':'multipart/form-data',
						'Authorization': Token
					},
					body: formData
				});
			
			let responseJson = await response.json();
			return responseJson;
		} catch (error) {
			console.error(error);
		}
	},
	async wwwFromfetch(uri,data) {
		try {	
			let response = await fetch(
				uri, 
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
					},
					body: qs.stringify(data)
				});
			
			let responseJson = await response.json();
			return responseJson;
		} catch (error) {
			console.error(error);
		}
	}
}

