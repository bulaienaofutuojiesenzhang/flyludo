// 检验值是否为空
export function isEmpty(value1){
	let value = value1.trim();
	return (value === '' || value === null || value === undefined);
};

// 检验邮箱是否合法
export function isEmail(value){
	const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return emailRegex.test(value);
};

// 检验手机号是否合法
export function isMobile(value){
	const mobileRegex = /^1[3456789]\d{9}$/;
	return mobileRegex.test(value);
}

// 字符长度是否符合要求
export function isLegalLength(value, minLength, maxLength){
	length = value.trim().length;
	return (minLength <= length && length <= maxLength);
}

/* 昵称必须是数字、字母、汉字或它们的组合 */ 
export function isNickname(value){
	const nicknameRegex = /^[0-9a-zA-Z\u4e00-\u9fa5]*$/;
	return nicknameRegex.test(value);
}

/* 登录密码是数字或字母或数字和字母的组合校验 */ 
export function isPassword(value){
	const passwordRegex = /^[0-9a-zA-Z]*$/;
	return passwordRegex.test(value);
}