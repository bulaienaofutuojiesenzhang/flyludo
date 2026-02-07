/*
 
 * @Date: 2019-03-29 14:59:24 
 * @Last Modified by:  
 * @Last Modified time: 2019-05-17 16:55:37
 */

export default class MathFloat {
    
    /**
     * 重写toFixed 小数向下截取
     * toFixed缺点 1.四舍五入后面的数值 2.固定两位缺失会补0
     */
    static floor = (number, pow = 2) => {
        if (!number) number = 0;
        return Math.floor(number * Math.pow(10, pow)) / Math.pow(10, pow);
    }

    /**
     * 重写ceil 小数向上截取
     */
    static ceil = (number, pow = 2) => {
        if (!number) number = 0;
        return Math.ceil(number * Math.pow(10, pow)) / Math.pow(10, pow);
    }

    /**
     * 今天
     */
    static thisDays = () => {
        const today = new Date();
        let yy = today.getFullYear()
        let mm = today.getMonth()
        let dd = today.getDate()
        let ste = yy+''+mm+''+dd
        return ste;
    }

    static formatDistance = (date) => { 
        const now = new Date().getTime();
        const diff = now - date;
        const seconds = Math.round(diff / 1000);
       
        if (seconds < 60) {
          return '刚刚';
        }
       
        const minutes = seconds / 60;
        if (minutes < 60) {
          return `${Math.floor(minutes)}分钟前`;
        }
       
        const hours = minutes / 60;
        if (hours < 24) {
          return `${Math.floor(hours)}小时前`;
        }
       
        const days = hours / 24;
        return `${Math.floor(days)}天前`;
      } 
}