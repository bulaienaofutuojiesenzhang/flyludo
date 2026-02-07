import { isEmpty, isMobile, isLegalLength, isEmail, isPassword, isNickname } from './BaseValidate';

export default (field, value) => {
	switch (field) {
		case 'phone':
			if (isEmpty(value)) {
				return '手机号不可为空';
			} else if (!isMobile(value) || !isLegalLength(value, 11, 11)) {
				return '请输入正确的手机号码';
			} else {
				return null
			}
		case 'password':
			if (isEmpty(value)) {
				return '密码不可为空';
			} else if (!isLegalLength(value, 8, 16)) {
				return '请输入8-16位密码';
			} else if (!isPassword(value)) {
				return '密码必须是数字或字母'
			} else {
				return null
			}
		case 'isEmail':
			if (isEmpty(value)) {
				return '邮箱信息未填写';
			} else if (!isLegalLength(value, 7, 36)) {
				return '请输入7-36位密码';
			} else if (!isEmail(value)) {
				return '邮箱格式错误！'
			} else {
				return null
			}
		case 'smsCode':
			if (isEmpty(value)) {
				return '验证码不可为空';
			} else if (!isLegalLength(value, 6, 6)) {
				return '请输入6位验证码';
			} else {
				return null
			}
		case 'number':
			value = parseFloat(value)
			if (typeof value === 'number' && !isNaN(value)) {
				return null
			} else {
				return '数值类型不正确！'
			}
		case 'nickName':
			if (isEmpty(value)) {
				return '昵称不可为空';
			} else if (!isLegalLength(value, 1, 6)) {
				return '请输入1-6位的昵称';
			} else if (!isNickname(value)) {
				return '昵称格式不正确';
			} else {
				return null
			}
		case 'isEmpty':
			if (isEmpty(value)) {
				return '不能为空！';
			} else {
				return null
			}
	}
}