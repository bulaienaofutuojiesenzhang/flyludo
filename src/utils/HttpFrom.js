import Config from '../config/index';
import qs from 'qs';
import AsyncStorage from './AsyncStorage';

// 图片上传（飞行棋自有 R2：dao.foleme.com）
export default {
	async imgUpData(imgUrl,imgType = 'image/jpeg',imgName='myimg') {
		// Token
		let Token = await AsyncStorage.getItem("jwToken");
		try {
			let formData = new FormData();
			let fileObj = { uri:  imgUrl, type: imgType, name: imgName };
			formData.append('file', fileObj)
			const headers = {
				Accept: 'application/json',
			};
			if (Token) {
				// 与 HttpPost 一致：Bearer；勿手动设 multipart Content-Type（需带 boundary）
				headers.Authorization = Token.indexOf('Bearer ') === 0 ? Token : ('Bearer ' + Token);
			}
			let response = await fetch(
				Config.API_PATH + "/api/oss/upload", 
				{
					method: 'POST',
					headers,
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
